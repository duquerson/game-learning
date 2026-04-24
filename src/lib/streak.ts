export interface StreakState {
  current_streak: number
  longest_streak: number
  last_study_date: string | null
}

export function isStreakBroken(lastDate: string | null, today: string): boolean {
  if (!lastDate) return false
  const last = new Date(lastDate)
  const now = new Date(today)
  const diffDays = Math.floor((now.getTime() - last.getTime()) / 86_400_000)
  return diffDays > 1
}

export function updateStreak(state: StreakState, today: string): StreakState {
  const { current_streak, longest_streak, last_study_date } = state
  if (last_study_date === today) return state
  let newStreak: number
  if (!last_study_date || isStreakBroken(last_study_date, today)) {
    newStreak = 1
  } else {
    newStreak = current_streak + 1
  }
  return {
    current_streak: newStreak,
    longest_streak: Math.max(longest_streak, newStreak),
    last_study_date: today,
  }
}
