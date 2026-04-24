import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculatePoints, calculateStreakBonus, applyPoints, BASE_POINTS } from '../../src/lib/points'
import type { Difficulty } from '../../src/types/app'

describe('calculatePoints', () => {
  it('P1: devuelve BASE_POINTS[difficulty] cuando correct=true', () => {
    fc.assert(fc.property(
      fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
      (difficulty) => calculatePoints(difficulty, true) === BASE_POINTS[difficulty]
    ), { numRuns: 100 })
  })

  it('P10: devuelve 0 cuando correct=false para cualquier dificultad', () => {
    fc.assert(fc.property(
      fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
      (difficulty) => calculatePoints(difficulty, false) === 0
    ), { numRuns: 100 })
  })

  it('P2: es determinista — mismo input produce mismo output', () => {
    fc.assert(fc.property(
      fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
      fc.boolean(),
      (difficulty, correct) => calculatePoints(difficulty, correct) === calculatePoints(difficulty, correct)
    ), { numRuns: 100 })
  })
})

describe('calculateStreakBonus', () => {
  it('P3: devuelve 5 en streak=3', () => expect(calculateStreakBonus(3)).toBe(5))
  it('P3: devuelve 15 en streak=5', () => expect(calculateStreakBonus(5)).toBe(15))
  it('P3: devuelve 0 para streak 1, 2, 4', () => {
    expect(calculateStreakBonus(1)).toBe(0)
    expect(calculateStreakBonus(2)).toBe(0)
    expect(calculateStreakBonus(4)).toBe(0)
  })
  it('P3: devuelve 5 en múltiplos de 3 mayores a 5 (6, 9, 12)', () => {
    expect(calculateStreakBonus(6)).toBe(5)
    expect(calculateStreakBonus(9)).toBe(5)
  })
})

describe('applyPoints — P3: Bonus de racha acumulativo correcto', () => {
  // **Validates: Requirements R7.4, R7.5, R7.8**
  it('P3: simular N respuestas correctas consecutivas — total bonus iguala suma de calculateStreakBonus(1..N)', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 20 }),
      fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
      (n, difficulty) => {
        // Simulate N consecutive correct answers with incrementing streak
        let total = 0
        for (let streak = 1; streak <= n; streak++) {
          total = applyPoints(total, difficulty, true, streak)
        }

        // Expected: n * basePoints + sum of all streak bonuses
        const expectedBase = n * BASE_POINTS[difficulty]
        let expectedBonus = 0
        for (let streak = 1; streak <= n; streak++) {
          expectedBonus += calculateStreakBonus(streak)
        }

        return total === expectedBase + expectedBonus
      }
    ), { numRuns: 200 })
  })
})

describe('applyPoints', () => {
  it('P1+P3: total nunca decrece y nunca es negativo', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 10000 }),
      fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
      fc.boolean(),
      fc.integer({ min: 0, max: 20 }),
      (current, difficulty, correct, streak) => {
        const result = applyPoints(current, difficulty, correct, streak)
        return result >= 0 && result >= current
      }
    ), { numRuns: 200 })
  })

  // **Validates: Requirements R7.6**
  it('P10: respuesta incorrecta no otorga puntos — delta es 0 para cualquier dificultad y racha', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 10000 }),
      fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
      fc.integer({ min: 0, max: 20 }),
      (current, difficulty, streak) => {
        return applyPoints(current, difficulty, false, streak) === current
      }
    ), { numRuns: 200 })
  })
})
