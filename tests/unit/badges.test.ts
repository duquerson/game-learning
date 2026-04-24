import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { evaluateBadgeConditions } from '../../src/lib/badges'
import type { Badge, BadgeConditionContext } from '../../src/types/app'

/**
 * Fixed set of test badges covering all 8 condition types.
 * Using deterministic IDs and thresholds to make the test meaningful.
 */
const allTestBadges: Badge[] = [
  // first_correct
  {
    id: 'b-first-correct',
    name: 'Primer paso',
    description: 'Primera respuesta correcta',
    icon: '🌱',
    level: 'basic',
    condition: { type: 'first_correct' },
  },
  // correct_streak
  {
    id: 'b-correct-streak',
    name: 'En racha',
    description: '3 respuestas correctas seguidas',
    icon: '⚡',
    level: 'basic',
    condition: { type: 'correct_streak', threshold: 3 },
  },
  // total_reviewed
  {
    id: 'b-total-reviewed',
    name: 'Estudioso',
    description: '50 tarjetas repasadas',
    icon: '📚',
    level: 'basic',
    condition: { type: 'total_reviewed', threshold: 50 },
  },
  // daily_streak
  {
    id: 'b-daily-streak',
    name: 'Constante',
    description: '7 días seguidos',
    icon: '🔥',
    level: 'intermediate',
    condition: { type: 'daily_streak', threshold: 7 },
  },
  // topic_mastery
  {
    id: 'b-topic-mastery',
    name: 'Maestro JS',
    description: 'Dominio de JavaScript',
    icon: '🏆',
    level: 'intermediate',
    condition: { type: 'topic_mastery', topic: 'JavaScript' },
  },
  // total_correct
  {
    id: 'b-total-correct',
    name: 'Centurión',
    description: '100 respuestas correctas',
    icon: '🚀',
    level: 'intermediate',
    condition: { type: 'total_correct', threshold: 100 },
  },
  // perfect_session
  {
    id: 'b-perfect-session',
    name: 'Perfección',
    description: 'Sesión perfecta con 5+ tarjetas',
    icon: '💎',
    level: 'advanced',
    condition: { type: 'perfect_session', min_cards: 5 },
  },
  // all_cards_mastery
  {
    id: 'b-all-mastery',
    name: 'Maestro total',
    description: 'Todas las tarjetas dominadas',
    icon: '👑',
    level: 'advanced',
    condition: { type: 'all_cards_mastery' },
  },
]

/**
 * Arbitrary generator for BadgeConditionContext.
 * Generates realistic values that can trigger various badge conditions.
 */
const arbitraryContext = fc.record<BadgeConditionContext>({
  totalReviewed: fc.integer({ min: 0, max: 200 }),
  correctAnswers: fc.integer({ min: 0, max: 200 }),
  currentStreak: fc.integer({ min: 0, max: 30 }),
  correctStreak: fc.integer({ min: 0, max: 10 }),
  sessionCorrect: fc.integer({ min: 0, max: 20 }),
  sessionTotal: fc.integer({ min: 0, max: 20 }),
  topicProgress: fc.oneof(
    // Empty topic progress
    fc.constant({} as Record<string, { reviewed: number; total: number }>),
    // JavaScript topic with varying mastery
    fc.record({
      reviewed: fc.integer({ min: 0, max: 20 }),
      total: fc.integer({ min: 1, max: 20 }),
    }).map(tp => ({ JavaScript: tp })),
    // Both topics with varying mastery
    fc.record({
      jsReviewed: fc.integer({ min: 0, max: 20 }),
      jsTotal: fc.integer({ min: 1, max: 20 }),
      tsReviewed: fc.integer({ min: 0, max: 20 }),
      tsTotal: fc.integer({ min: 1, max: 20 }),
    }).map(({ jsReviewed, jsTotal, tsReviewed, tsTotal }) => ({
      JavaScript: { reviewed: jsReviewed, total: jsTotal },
      TypeScript: { reviewed: tsReviewed, total: tsTotal },
    })),
  ),
})

describe('evaluateBadgeConditions', () => {
  /**
   * Property 6: evaluateBadgeConditions es idempotente
   *
   * Calling evaluateBadgeConditions twice with the same context:
   * 1. Both calls return the same badge IDs (idempotency)
   * 2. Badges already unlocked never appear in the result
   *
   * **Validates: Requirements R9.1–R9.9, R9.11**
   */
  it('P6: idempotente — mismas entradas producen el mismo resultado', () => {
    fc.assert(
      fc.property(
        arbitraryContext,
        fc.array(fc.constantFrom(...allTestBadges.map(b => b.id)), { maxLength: allTestBadges.length }),
        (ctx: BadgeConditionContext, alreadyUnlocked: string[]) => {
          const firstRun = evaluateBadgeConditions(ctx, alreadyUnlocked, allTestBadges)
          const secondRun = evaluateBadgeConditions(ctx, alreadyUnlocked, allTestBadges)

          const firstIds = firstRun.map(b => b.id).sort()
          const secondIds = secondRun.map(b => b.id).sort()

          // Both calls must return the same badge IDs
          if (firstIds.length !== secondIds.length) return false
          return firstIds.every((id, i) => id === secondIds[i])
        }
      ),
      { numRuns: 200 }
    )
  })

  it('P6: insignias ya desbloqueadas nunca aparecen en el resultado', () => {
    fc.assert(
      fc.property(
        arbitraryContext,
        fc.array(fc.constantFrom(...allTestBadges.map(b => b.id)), { maxLength: allTestBadges.length }),
        (ctx: BadgeConditionContext, alreadyUnlocked: string[]) => {
          const result = evaluateBadgeConditions(ctx, alreadyUnlocked, allTestBadges)
          const unlockedSet = new Set(alreadyUnlocked)

          // No returned badge should be in the already-unlocked set
          return result.every(b => !unlockedSet.has(b.id))
        }
      ),
      { numRuns: 200 }
    )
  })

  it('P6: segunda evaluación con badges ya desbloqueados devuelve []', () => {
    fc.assert(
      fc.property(
        arbitraryContext,
        (ctx: BadgeConditionContext) => {
          const firstRun = evaluateBadgeConditions(ctx, [], allTestBadges)
          const firstIds = firstRun.map(b => b.id)
          const secondRun = evaluateBadgeConditions(ctx, firstIds, allTestBadges)
          return secondRun.length === 0
        }
      ),
      { numRuns: 200 }
    )
  })

  // Unit tests for specific badge conditions
  it('desbloquea "Primer paso" cuando correctAnswers >= 1', () => {
    const ctx: BadgeConditionContext = {
      totalReviewed: 1, correctAnswers: 1, currentStreak: 0, correctStreak: 0,
      sessionCorrect: 1, sessionTotal: 1, topicProgress: {},
    }
    const result = evaluateBadgeConditions(ctx, [], allTestBadges)
    expect(result.some(b => b.id === 'b-first-correct')).toBe(true)
  })

  it('desbloquea "En racha" cuando correctStreak >= 3', () => {
    const ctx: BadgeConditionContext = {
      totalReviewed: 3, correctAnswers: 3, currentStreak: 1, correctStreak: 3,
      sessionCorrect: 3, sessionTotal: 3, topicProgress: {},
    }
    const result = evaluateBadgeConditions(ctx, [], allTestBadges)
    expect(result.some(b => b.id === 'b-correct-streak')).toBe(true)
  })

  it('desbloquea "Perfección" cuando sesión perfecta con min_cards cumplido', () => {
    const ctx: BadgeConditionContext = {
      totalReviewed: 5, correctAnswers: 5, currentStreak: 1, correctStreak: 5,
      sessionCorrect: 5, sessionTotal: 5, topicProgress: {},
    }
    const result = evaluateBadgeConditions(ctx, [], allTestBadges)
    expect(result.some(b => b.id === 'b-perfect-session')).toBe(true)
  })

  it('desbloquea "Maestro JS" cuando topic_mastery de JavaScript se cumple', () => {
    const ctx: BadgeConditionContext = {
      totalReviewed: 10, correctAnswers: 10, currentStreak: 1, correctStreak: 0,
      sessionCorrect: 5, sessionTotal: 5,
      topicProgress: { JavaScript: { reviewed: 10, total: 10 } },
    }
    const result = evaluateBadgeConditions(ctx, [], allTestBadges)
    expect(result.some(b => b.id === 'b-topic-mastery')).toBe(true)
  })

  it('no desbloquea badges ya obtenidos', () => {
    const ctx: BadgeConditionContext = {
      totalReviewed: 200, correctAnswers: 200, currentStreak: 30, correctStreak: 10,
      sessionCorrect: 20, sessionTotal: 20,
      topicProgress: {
        JavaScript: { reviewed: 20, total: 20 },
        TypeScript: { reviewed: 20, total: 20 },
      },
    }
    const allIds = allTestBadges.map(b => b.id)
    const result = evaluateBadgeConditions(ctx, allIds, allTestBadges)
    expect(result).toHaveLength(0)
  })
})
