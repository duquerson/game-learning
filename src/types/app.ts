export type Difficulty = 'easy' | 'medium' | 'hard'
export type ReviewMode = 'self-assessment' | 'quiz'
export type BadgeLevel = 'basic' | 'intermediate' | 'advanced'

export interface Card {
  id: string
  title: string
  content: string
  topic: string
  subtopic: string
  difficulty: Difficulty
  points: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  level: BadgeLevel
  condition: import('./database').BadgeConditionJson
}

export interface UserBadge {
  badgeId: string
  unlockedAt: string
}

export interface UserStats {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
}

export interface UserPreferences {
  selectedTopics: string[]
  onboardingCompleted: boolean
}

export interface SessionResult {
  cardId: string
  correct: boolean
  difficulty: Difficulty
  pointsEarned: number
}

export interface QuizOption {
  id: string
  title: string
  isCorrect: boolean
}

export interface BadgeConditionContext {
  totalReviewed: number
  correctAnswers: number
  currentStreak: number
  correctStreak: number
  sessionCorrect: number
  sessionTotal: number
  topicProgress: Record<string, { reviewed: number; total: number }>
}

export interface SubmitAnswerResult {
  pointsEarned: number
  newTotal: number
  streakBonus: number
  correctStreak: number
}

export interface CompleteSessionResult {
  newBadges: Badge[]
  updatedStats: UserStats
}
