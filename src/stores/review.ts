import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { actions } from 'astro:actions'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../lib/user-error'
import { BASE_POINTS } from '../lib/points'
import type { Card, SessionResult, ReviewMode, CompleteSessionResult } from '../types/app'
import type { Difficulty } from '../types/app'

export const useReviewStore = defineStore('review', () => {
  const deck = ref<Card[]>([])
  const currentIndex = ref(0)
  const mode = ref<ReviewMode>('self-assessment')
  const sessionResults = ref<SessionResult[]>([])
  const sessionId = ref<string | null>(null)
  const correctStreak = ref(0)
  const sessionPoints = ref(0)
  const sessionCompleteResult = ref<CompleteSessionResult | null>(null)
  const isLoading = ref(false)

  const currentCard = computed(() => deck.value[currentIndex.value] ?? null)
  const progress = computed(() => ({
    // Clamp current para que nunca supere total al terminar la sesión
    current: Math.min(currentIndex.value + 1, deck.value.length),
    total: deck.value.length,
  }))
  const isFinished = computed(() => currentIndex.value >= deck.value.length)

  function initSession(cards: Card[], reviewMode: ReviewMode) {
    deck.value = [...cards]
    currentIndex.value = 0
    mode.value = reviewMode
    sessionResults.value = []
    sessionId.value = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); })
    correctStreak.value = 0
    sessionPoints.value = 0
    sessionCompleteResult.value = null
  }

  async function submitAnswer(cardId: string, correct: boolean, difficulty: Difficulty, confidence?: number): Promise<boolean> {
    const previousStreak = correctStreak.value
    const previousPoints = sessionPoints.value

    // Estimación optimista usando BASE_POINTS según dificultad real de la tarjeta
    const estimatedPoints = correct ? BASE_POINTS[difficulty] : 0
    if (correct) {
      correctStreak.value++
      sessionPoints.value += estimatedPoints
    } else {
      correctStreak.value = 0
    }

    // Check if we already have a result for this card (to allow re-evaluating if needed, though usually cards move forward)
    const existingIndex = sessionResults.value.findIndex(r => r.cardId === cardId)
    const result: SessionResult = {
      cardId,
      correct,
      difficulty,
      pointsEarned: estimatedPoints,
      confidence
    }

    if (existingIndex >= 0) {
      sessionResults.value[existingIndex] = result
    } else {
      sessionResults.value.push(result)
    }

    isLoading.value = true
    try {
      const { data, error } = await actions.review.submitAnswer({
        cardId,
        correct,
        sessionId: sessionId.value || 'fallback-session',
      })

      if (error || !data || !data.success) {
        throw new Error(GENERIC_USER_ERROR_MESSAGE)
      }

      // Reconcile with server values
      const { pointsEarned, streakBonus, correctStreak: newStreak } = data.data
      sessionId.value = data.data.sessionId
      correctStreak.value = newStreak
      sessionPoints.value = previousPoints + pointsEarned + streakBonus
      
      // Update the result with accurate points
      const finalIndex = sessionResults.value.findIndex(r => r.cardId === cardId)
      if (finalIndex >= 0) {
        sessionResults.value[finalIndex].pointsEarned = pointsEarned + streakBonus
      }

      if (correct) {
        toast.success(`¡+${pointsEarned} puntos!`)
        if (streakBonus > 0) {
          toast.info(`🔥 ¡Racha de ${newStreak}! +${streakBonus} puntos bonus`)
        }
      }
      return true
    } catch {
      // Rollback
      correctStreak.value = previousStreak
      sessionPoints.value = previousPoints
      if (existingIndex < 0) sessionResults.value.pop()

      toast.error(GENERIC_USER_ERROR_MESSAGE)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function prevCard() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  async function nextCard(): Promise<{ done: boolean; success: boolean }> {
    if (currentIndex.value < deck.value.length - 1) {
      currentIndex.value++
      return { done: false, success: true }
    } else {
      // Intentar finalizar solo si estamos en la última y avanzamos
      currentIndex.value++
      const success = await completeSession()
      return { done: true, success }
    }
  }

  async function completeSession(): Promise<boolean> {
    if (!sessionId.value) {
      toast.error(GENERIC_USER_ERROR_MESSAGE)
      return false
    }
    isLoading.value = true
    try {
      const { data, error } = await actions.review.completeSession({
        sessionId: sessionId.value,
        sessionResults: sessionResults.value.map(r => ({
          cardId: r.cardId,
          correct: r.correct,
          difficulty: r.difficulty,
          pointsEarned: r.pointsEarned
        })),
      })

      if (error || !data || !data.success) {
        toast.error(GENERIC_USER_ERROR_MESSAGE)
        return false
      }

      sessionCompleteResult.value = data.data

      for (const badge of data.data.newBadges) {
        toast.success(`🏆 ¡Nueva insignia! ${badge.icon} ${badge.name}`)
      }

      return true
    } catch {
      toast.error(GENERIC_USER_ERROR_MESSAGE)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    deck,
    currentIndex,
    mode,
    sessionResults,
    sessionId,
    correctStreak,
    sessionPoints,
    sessionCompleteResult,
    isLoading,
    currentCard,
    progress,
    isFinished,
    initSession,
    submitAnswer,
    prevCard,
    nextCard,
    completeSession,
  }
})
