import type { Difficulty } from '../types/app'

export const BASE_POINTS: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 }

export function calculatePoints(difficulty: Difficulty, correct: boolean): number {
  if (!correct) return 0
  return BASE_POINTS[difficulty]
}

export function calculateStreakBonus(correctStreak: number): number {
  if (correctStreak === 5) return 15
  if (correctStreak === 3) return 5
  if (correctStreak > 5 && correctStreak % 3 === 0) return 5
  return 0
}

export function applyPoints(current: number, difficulty: Difficulty, correct: boolean, streak: number): number {
  const base = calculatePoints(difficulty, correct)
  const bonus = correct ? calculateStreakBonus(streak) : 0
  return current + base + bonus
}
