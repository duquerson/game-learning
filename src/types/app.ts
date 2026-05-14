export type Difficulty = 'easy' | 'medium' | 'hard'
export type ReviewMode = 'self-assessment' | 'quiz'
export type BadgeLevel = 'basic' | 'intermediate' | 'advanced'
export type BadgeCategory = 'achievement' | 'streak' | 'mastery'

export type BadgeCondition =
  | { type: 'first_correct' }
  | { type: 'correct_streak'; threshold: number }
  | { type: 'total_reviewed'; threshold: number }
  | { type: 'daily_streak'; threshold: number }
  | { type: 'topic_mastery'; topic: string }
  | { type: 'total_correct'; threshold: number }
  | { type: 'perfect_session'; min_cards: number }
  | { type: 'all_cards_mastery' }

export interface Flashcard {
  id: string
  category: string
  topic: string
  difficulty: Difficulty
  front: {
    question: string
    hint?: string
    codePreview?: string
  }
  back: {
    answer: string
    explanation?: string
    example?: string
    code?: string
    trueFalse?: boolean
  }
  spacedRepetition?: {
    confidence?: number
    reviewCount?: number
    nextReviewAt?: string
  }
}

export interface Card extends Flashcard {
  title: string
  content: string
  question: string
  options: CardOption[]
  correctAnswer: string
}

export interface CardOption {
  id: string // 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  level: BadgeLevel
  category?: BadgeCategory
  condition: BadgeCondition
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
  confidence?: number // 0: No, 1: Doubt, 2: Easy
}

export interface QuizOption {
  id: string       // card id for the correct one, 'A'|'B'|'C'|'D' for distractors
  title: string    // display text
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
  sessionId: string
}

export interface CompleteSessionResult {
  newBadges: Badge[]
  updatedStats: UserStats
}
