import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { createSupabaseClient } from '../lib/supabase'
import { calculatePoints, calculateStreakBonus, applyPoints } from '../lib/points'
import { updateStreak } from '../lib/streak'
import { evaluateBadgeConditions } from '../lib/badges'
import { createAppError, logServerError, mapSupabaseError } from '../lib/errors'
import type { Badge, BadgeConditionContext, SubmitAnswerResult, CompleteSessionResult } from '../types/app'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// ─── Helper: verificar sesión ────────────────────────────────────────────────
async function requireUser(context: { request: Request; cookies: Parameters<typeof createSupabaseClient>[1] }) {
  const supabase = createSupabaseClient(context.request, context.cookies)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { supabase, userId: null }
  return { supabase, userId: user.id }
}

// ─── Actions ─────────────────────────────────────────────────────────────────
export const server = {
  review: {
    /**
     * Registra una respuesta individual y actualiza puntos.
     * Llamado por cada tarjeta durante la sesión.
     */
    submitAnswer: defineAction({
      input: z.object({
        cardId: z.string().uuid(),
        correct: z.boolean(),
        sessionId: z.string().uuid(),
      }),
      handler: async (input, context): Promise<{ success: true; data: SubmitAnswerResult } | { success: false; error: string; message: string }> => {
        const { supabase, userId } = await requireUser(context)
        if (!userId) {
          const err = createAppError('UNAUTHORIZED', 'No session', context.url?.pathname)
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Validar tarjeta en servidor y usar dificultad real para evitar manipulación del cliente.
        const { data: cardData, error: cardError } = await supabase
          .from('cards')
          .select('difficulty')
          .eq('id', input.cardId)
          .single()
        if (cardError || !cardData) {
          const code = mapSupabaseError(cardError ?? { status: 404 })
          const err = createAppError(code, cardError?.message ?? 'Card not found', '/actions/review.submitAnswer')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Calcular racha en servidor (no confiar en correctStreak del cliente).
        const { data: streakRows, error: streakError } = await supabase
          .from('user_progress')
          .select('correct')
          .eq('user_id', userId)
          .order('reviewed_at', { ascending: false })
          .limit(50)
        if (streakError) {
          const code = mapSupabaseError(streakError)
          const err = createAppError(code, streakError.message, '/actions/review.submitAnswer')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }
        let serverStreak = 0
        for (const row of streakRows ?? []) {
          if (!row.correct) break
          serverStreak++
        }

        // Insertar en user_progress
        const { error: progressError } = await supabase.from('user_progress').insert({
          user_id: userId,
          card_id: input.cardId,
          correct: input.correct,
          session_id: input.sessionId,
        })
        if (progressError) {
          const code = mapSupabaseError(progressError)
          const err = createAppError(code, progressError.message, '/actions/review.submitAnswer')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Calcular puntos
        const newStreak = input.correct ? serverStreak + 1 : 0
        const pointsEarned = calculatePoints(cardData.difficulty, input.correct)
        const streakBonus = input.correct ? calculateStreakBonus(newStreak) : 0

        // Actualizar user_stats.total_points
        const { data: stats } = await supabase
          .from('user_stats')
          .select('total_points')
          .eq('user_id', userId)
          .single()

        const currentPoints = stats?.total_points ?? 0
        const newTotal = applyPoints(currentPoints, cardData.difficulty, input.correct, newStreak)

        const { error: statsError } = await supabase
          .from('user_stats')
          .upsert({ user_id: userId, total_points: newTotal, updated_at: new Date().toISOString() })
        if (statsError) {
          const code = mapSupabaseError(statsError)
          const err = createAppError(code, statsError.message, '/actions/review.submitAnswer')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return {
          success: true,
          data: { pointsEarned, newTotal, streakBonus, correctStreak: newStreak, sessionId: input.sessionId },
        }
      },
    }),

    /**
     * Finaliza la sesión: actualiza racha diaria y evalúa insignias.
     */
    completeSession: defineAction({
      input: z.object({
        sessionId: z.string().uuid(),
        sessionResults: z.array(z.object({
          cardId: z.string().uuid(),
          correct: z.boolean(),
          // Accept extra fields from client (difficulty, pointsEarned) but don't use them
          difficulty: z.string().optional(),
          pointsEarned: z.number().optional(),
        }).strict()).min(1).max(200),
      }),
      handler: async (input, context): Promise<{ success: true; data: CompleteSessionResult } | { success: false; error: string; message: string }> => {
        const { supabase, userId } = await requireUser(context)
        if (!userId) {
          const err = createAppError('UNAUTHORIZED', 'No session', context.url?.pathname)
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Actualizar racha diaria
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single()

        const today = new Date().toISOString().split('T')[0]
        const streakState = {
          current_streak: currentStats?.current_streak ?? 0,
          longest_streak: currentStats?.longest_streak ?? 0,
          last_study_date: currentStats?.last_study_date ?? null,
        }
        const newStreakState = updateStreak(streakState, today)

        const { error: streakUpdateError } = await supabase.from('user_stats').upsert({
          user_id: userId,
          current_streak: newStreakState.current_streak,
          longest_streak: newStreakState.longest_streak,
          last_study_date: newStreakState.last_study_date,
          updated_at: new Date().toISOString(),
        })
        if (streakUpdateError) {
          const code = mapSupabaseError(streakUpdateError)
          const err = createAppError(code, streakUpdateError.message, '/actions/review.completeSession')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Validar que los resultados enviados por el cliente existan en progreso reciente.
        const requestedSessionSize = input.sessionResults.length
        const { data: recentSessionProgress, error: recentSessionError } = await supabase
          .from('user_progress')
          .select('card_id, correct, reviewed_at')
          .eq('user_id', userId)
          .eq('session_id', input.sessionId)
          .is('completed_at', null)
          .order('reviewed_at', { ascending: false })
          .limit(200)
        if (recentSessionError) {
          const code = mapSupabaseError(recentSessionError)
          const err = createAppError(code, recentSessionError.message, '/actions/review.completeSession')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        const progressCountByKey = new Map<string, number>()
        for (const row of recentSessionProgress ?? []) {
          const key = `${row.card_id}:${row.correct ? 1 : 0}`
          progressCountByKey.set(key, (progressCountByKey.get(key) ?? 0) + 1)
        }

        let validatedSessionTotal = 0
        let validatedSessionCorrect = 0
        for (const row of input.sessionResults) {
          const key = `${row.cardId}:${row.correct ? 1 : 0}`
          const available = progressCountByKey.get(key) ?? 0
          if (available <= 0) {
            const err = createAppError('VALIDATION_ERROR', 'Session payload mismatch', '/actions/review.completeSession')
            logServerError(err)
            return { success: false, error: err.code, message: err.message }
          }
          progressCountByKey.set(key, available - 1)
          validatedSessionTotal++
          if (row.correct) validatedSessionCorrect++
        }
        if (validatedSessionTotal !== requestedSessionSize || requestedSessionSize !== (recentSessionProgress?.length ?? 0)) {
          const err = createAppError('VALIDATION_ERROR', 'Session payload mismatch', '/actions/review.completeSession')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        const { error: completionMarkError } = await supabase
          .from('user_progress')
          .update({ completed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('session_id', input.sessionId)
          .is('completed_at', null)
        if (completionMarkError) {
          const code = mapSupabaseError(completionMarkError)
          const err = createAppError(code, completionMarkError.message, '/actions/review.completeSession')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Construir BadgeConditionContext
        const { data: allProgress } = await supabase
          .from('user_progress')
          .select('card_id, correct')
          .eq('user_id', userId)

        const { data: allCards } = await supabase.from('cards').select('id, topic')
        const { data: unlockedBadges } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', userId)
        const { data: allBadges } = await supabase.from('badges').select('*')

        const totalReviewed = allProgress?.length ?? 0
        const correctAnswers = allProgress?.filter(p => p.correct).length ?? 0

        // Calcular topicProgress
        const topicProgress: Record<string, { reviewed: number; total: number }> = {}
        for (const card of allCards ?? []) {
          if (!topicProgress[card.topic]) {
            const total = allCards?.filter(c => c.topic === card.topic).length ?? 0
            topicProgress[card.topic] = { reviewed: 0, total }
          }
        }
        for (const p of allProgress ?? []) {
          const card = allCards?.find(c => c.id === p.card_id)
          if (card && p.correct) {
            topicProgress[card.topic] = topicProgress[card.topic] ?? { reviewed: 0, total: 0 }
            topicProgress[card.topic].reviewed++
          }
        }

        const orderedSessionRows = (recentSessionProgress ?? [])
          .slice(0, validatedSessionTotal)
          .reverse()
        let rollingStreak = 0
        let maxStreak = 0
        for (const row of orderedSessionRows) {
          if (row.correct) {
            rollingStreak++
            maxStreak = Math.max(maxStreak, rollingStreak)
          } else {
            rollingStreak = 0
          }
        }

        const ctx: BadgeConditionContext = {
          totalReviewed,
          correctAnswers,
          currentStreak: newStreakState.current_streak,
          correctStreak: maxStreak,
          sessionCorrect: validatedSessionCorrect,
          sessionTotal: validatedSessionTotal,
          topicProgress,
        }

        const unlockedIds = unlockedBadges?.map(b => b.badge_id) ?? []
        const mappedBadges: Badge[] = (allBadges ?? []).map(b => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          level: b.level,
          condition: b.condition,
        }))

        const newBadges = evaluateBadgeConditions(ctx, unlockedIds, mappedBadges)

        // Insertar nuevas insignias
        if (newBadges.length > 0) {
          const { error: insertBadgeError } = await supabase.from('user_badges').insert(
            newBadges.map(b => ({ user_id: userId, badge_id: b.id }))
          )
          if (insertBadgeError) {
            const code = mapSupabaseError(insertBadgeError)
            const err = createAppError(code, insertBadgeError.message, '/actions/review.completeSession')
            logServerError(err)
            return { success: false, error: err.code, message: err.message }
          }
        }

        const updatedStats = {
          totalPoints: currentStats?.total_points ?? 0,
          currentStreak: newStreakState.current_streak,
          longestStreak: newStreakState.longest_streak,
          lastStudyDate: newStreakState.last_study_date,
        }

        return { success: true, data: { newBadges, updatedStats } }
      },
    }),
  },

  onboarding: {
    /**
     * Guarda los topics seleccionados y marca el onboarding como completado.
     */
    savePreferences: defineAction({
      input: z.object({
        topics: z.array(z.string().min(1)).min(1),
        difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
      }),
      handler: async (input, context): Promise<{ success: true } | { success: false; error: string; message: string }> => {
        const { supabase, userId } = await requireUser(context)
        if (!userId) {
          const err = createAppError('UNAUTHORIZED', 'No session', context.url?.pathname)
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        const { error: prefsError } = await supabase.from('user_preferences').upsert({
          user_id: userId,
          selected_topics: input.topics,
          difficulty: input.difficulty,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        if (prefsError) {
          const code = mapSupabaseError(prefsError)
          const err = createAppError(code, prefsError.message, '/actions/onboarding.savePreferences')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        // Crear user_stats inicial si no existe
        const { error: statsInitError } = await supabase.from('user_stats').upsert({
          user_id: userId,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          updated_at: new Date().toISOString(),
        })
        if (statsInitError) {
          const code = mapSupabaseError(statsInitError)
          const err = createAppError(code, statsInitError.message, '/actions/onboarding.savePreferences')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return { success: true }
      },
    }),
  },

profile: {
    /**
     * Actualiza los topics seleccionados del usuario.
     */
    updateTopics: defineAction({
      input: z.object({
        topics: z.array(z.string().min(1)).min(1),
      }),
      handler: async (input, context): Promise<{ success: true } | { success: false; error: string; message: string }> => {
        const { supabase, userId } = await requireUser(context)
        if (!userId) {
          const err = createAppError('UNAUTHORIZED', 'No session', context.url?.pathname)
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        const { error } = await supabase
          .from('user_preferences')
          .update({ selected_topics: input.topics, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        if (error) {
          const code = mapSupabaseError(error)
          const err = createAppError(code, error.message, '/actions/profile.updateTopics')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return { success: true }
      },
    }),
  },

  auth: {
    /**
     * Inicia sesión con email y contraseña.
     */
    login: defineAction({
      input: z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
      handler: async (input, context): Promise<{ success: true; redirect: string } | { success: false; error: string; message: string }> => {
        const supabase = createSupabaseClient(context.request, context.cookies)

        const { error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        })

        if (error) {
          const code = mapSupabaseError(error)
          const err = createAppError(code, error.message, '/actions/auth.login')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return { success: true, redirect: '/dashboard' }
      },
    }),

    /**
     * Registra un nuevo usuario.
     */
    register: defineAction({
      input: z.object({
        email: z.string().email(),
        password: z.string()
          .min(8, 'La contraseña debe tener al menos 8 caracteres')
          .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
          .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
          .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
          .regex(/[^A-Za-z0-9]/, 'La contraseña debe tener al menos un carácter especial'),
      }),
      handler: async (input, context) => {
        const supabase = createSupabaseClient(context.request, context.cookies)
        
        const { error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
        })
        
        if (error) {
          const code = mapSupabaseError(error)
          const err = createAppError(code, error.message, '/actions/auth.register')
          logServerError(err)
          return { success: false, error: err.code, message: err.message, redirect: null }
        }

        return { success: true, redirect: '/onboarding' }
      },
    }),

    /**
     * Cierra la sesión actual.
     */
    logout: defineAction({
      handler: async (_input, context) => {
        console.log('[LOGOUT] Context keys:', Object.keys(context))
        console.log('[LOGOUT] Has request:', !!context.request)
        console.log('[LOGOUT] Has cookies:', !!context.cookies)
        
        try {
          if (!context.request || !context.cookies) {
            console.error('[LOGOUT] Contexto incompleto')
            return { success: true, redirect: '/login' }
          }
          
          const supabase = createSupabaseClient(context.request, context.cookies)
          
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            console.error('[LOGOUT] Error de Supabase:', error.message)
          }

          return { success: true, redirect: '/login' }
        } catch (err) {
          console.error('[LOGOUT] Error:', err)
          return { success: true, redirect: '/login' }
        }
      },
    }),

    /**
     * Obtiene la sesión actual del usuario.
     */
    getSession: defineAction({
      handler: async (context) => {
        const supabase = createSupabaseClient(context.request, context.cookies)
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          const code = mapSupabaseError(error)
          const err = createAppError(code, error.message, '/actions/auth.getSession')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return { success: true, user: user as SupabaseUser | null }
      },
    }),

    /**
     * Envía email de recuperación de contraseña.
     */
    resetPassword: defineAction({
      input: z.object({
        email: z.string().email('Ingresa un email válido'),
      }),
      handler: async (input, context) => {
        const supabase = createSupabaseClient(context.request, context.cookies)

        const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
          redirectTo: `${context.url?.origin ?? ''}/reset-password`,
        })

        if (error) {
          const code = mapSupabaseError(error)
          const err = createAppError(code, error.message, '/actions/auth.resetPassword')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return { success: true }
      },
    }),

    /**
     * Actualiza la contraseña del usuario (usado en recovery flow).
     */
    /**
     * Actualiza la preferencia de tema en la base de datos.
     */
    updateTheme: defineAction({
      input: z.object({
        theme: z.enum(['light', 'dark']),
      }),
      handler: async (input, context) => {
        const { supabase, userId } = await requireUser(context)
        if (!userId) {
          return { success: false }
        }
        await supabase.from('user_preferences').upsert({
          user_id: userId,
          theme: input.theme,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        return { success: true }
      },
    }),

    updatePassword: defineAction({
      input: z.object({
        password: z.string()
          .min(8, 'La contraseña debe tener al menos 8 caracteres')
          .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
          .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
          .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
      }),
      handler: async (input, context) => {
        const supabase = createSupabaseClient(context.request, context.cookies)

        const { error } = await supabase.auth.updateUser({
          password: input.password,
        })

        if (error) {
          const code = mapSupabaseError(error)
          const err = createAppError(code, error.message, '/actions/auth.updatePassword')
          logServerError(err)
          return { success: false, error: err.code, message: err.message }
        }

        return { success: true, redirect: '/login' }
      },
    }),
  },
}
