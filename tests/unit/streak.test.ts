import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { updateStreak, isStreakBroken } from '../../src/lib/streak'
import type { StreakState } from '../../src/lib/streak'

// Generate YYYY-MM-DD strings by picking a day offset from a base date
const dateArb = fc.integer({ min: 0, max: 1095 }) // ~3 years of days
  .map(offset => {
    const base = new Date('2024-01-01')
    base.setDate(base.getDate() + offset)
    return base.toISOString().split('T')[0]
  })

/** Add `days` days to a YYYY-MM-DD string and return a new YYYY-MM-DD string */
function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Arbitrary StreakState with valid invariants (current_streak <= longest_streak)
const streakStateArb = fc.record({
  current_streak: fc.integer({ min: 1, max: 100 }),
  longest_streak: fc.integer({ min: 1, max: 100 }),
  last_study_date: fc.option(dateArb, { nil: null }),
}).map(s => ({
  ...s,
  longest_streak: Math.max(s.current_streak, s.longest_streak),
}))

describe('updateStreak', () => {
  /**
   * P4: updateStreak maneja correctamente todos los casos de fecha
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.6
   */

  it('P4 — caso 1: idempotente cuando last_study_date === today', () => {
    // Validates: R8.6 (mismo día no cambia el streak)
    fc.assert(fc.property(
      streakStateArb,
      (state) => {
        // last_study_date must be non-null and equal to today
        const today = state.last_study_date ?? '2024-06-01'
        const stateWithToday: StreakState = { ...state, last_study_date: today }
        const result = updateStreak(stateWithToday, today)
        return (
          result.current_streak === stateWithToday.current_streak &&
          result.longest_streak === stateWithToday.longest_streak &&
          result.last_study_date === today
        )
      }
    ), { numRuns: 100 })
  })

  it('P4 — caso 2: incrementa current_streak cuando last_study_date es ayer', () => {
    // Validates: R8.1, R8.2 (día siguiente incrementa la racha)
    fc.assert(fc.property(
      streakStateArb,
      dateArb,
      (state, today) => {
        const yesterday = addDays(today, -1)
        const stateWithYesterday: StreakState = { ...state, last_study_date: yesterday }
        const result = updateStreak(stateWithYesterday, today)
        return (
          result.current_streak === stateWithYesterday.current_streak + 1 &&
          result.last_study_date === today &&
          result.longest_streak >= result.current_streak
        )
      }
    ), { numRuns: 100 })
  })

  it('P4 — caso 3: reinicia current_streak a 1 cuando last_study_date es más de 1 día atrás', () => {
    // Validates: R8.3, R8.4 (racha rota reinicia a 1)
    fc.assert(fc.property(
      streakStateArb,
      dateArb,
      fc.integer({ min: 2, max: 365 }),
      (state, today, daysAgo) => {
        const oldDate = addDays(today, -daysAgo)
        const stateWithOldDate: StreakState = { ...state, last_study_date: oldDate }
        const result = updateStreak(stateWithOldDate, today)
        return (
          result.current_streak === 1 &&
          result.last_study_date === today &&
          result.longest_streak >= 1
        )
      }
    ), { numRuns: 100 })
  })

  it('P4 — caso 4: inicia current_streak en 1 cuando last_study_date es null', () => {
    // Validates: R8.4 (sin fecha previa inicia en 1)
    fc.assert(fc.property(
      streakStateArb,
      dateArb,
      (state, today) => {
        const stateWithNull: StreakState = { ...state, last_study_date: null }
        const result = updateStreak(stateWithNull, today)
        return (
          result.current_streak === 1 &&
          result.last_study_date === today &&
          result.longest_streak >= 1
        )
      }
    ), { numRuns: 100 })
  })

  it('P4 — invariante: last_study_date siempre es today tras actualizar (todos los casos)', () => {
    // Validates: R8.6
    fc.assert(fc.property(
      fc.record({
        current_streak: fc.integer({ min: 0, max: 100 }),
        longest_streak: fc.integer({ min: 0, max: 100 }),
        last_study_date: fc.option(dateArb, { nil: null }),
      }).filter(s => s.current_streak <= s.longest_streak),
      dateArb,
      (state, today) => updateStreak(state, today).last_study_date === today
    ), { numRuns: 100 })
  })

  it('P4c: reinicia a 1 cuando la racha se rompe', () => {
    const state: StreakState = { current_streak: 5, longest_streak: 10, last_study_date: '2024-01-01' }
    const result = updateStreak(state, '2024-01-10')
    expect(result.current_streak).toBe(1)
    expect(result.longest_streak).toBe(10)
  })

  it('P4d: incrementa en 1 cuando es el día siguiente', () => {
    const state: StreakState = { current_streak: 3, longest_streak: 5, last_study_date: '2024-06-01' }
    const result = updateStreak(state, '2024-06-02')
    expect(result.current_streak).toBe(4)
  })
})

/**
 * P5: `longest_streak` es monótonamente no decreciente
 * Validates: Requirements R8.5
 */
describe('updateStreak invariants', () => {
  it('P5: longest_streak nunca decrece y current_streak <= longest_streak en toda secuencia', () => {
    // Validates: R8.5
    const base = new Date('2024-01-01')
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 365 }), { minLength: 1, maxLength: 20 }),
      (offsets) => {
        // Convert offsets to sorted unique YYYY-MM-DD date strings
        const dates = [...new Set(
          offsets.map(offset => {
            const d = new Date(base)
            d.setDate(d.getDate() + offset)
            return d.toISOString().split('T')[0]
          })
        )].sort()

        let state: StreakState = { current_streak: 0, longest_streak: 0, last_study_date: null }
        for (const date of dates) {
          const prevLongest = state.longest_streak
          state = updateStreak(state, date)
          // longest_streak must never decrease
          if (state.longest_streak < prevLongest) return false
          // current_streak must always be <= longest_streak
          if (state.current_streak > state.longest_streak) return false
        }
        return true
      }
    ), { numRuns: 200 })
  })
})
