export interface DbCard {
  id: string
  title: string
  content: string
  topic: string
  subtopic: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  created_at: string
}

export interface DbBadge {
  id: string
  name: string
  description: string
  icon: string
  level: 'basic' | 'intermediate' | 'advanced'
  condition: BadgeConditionJson
}

export interface DbUserProgress {
  id: string
  user_id: string
  card_id: string
  correct: boolean
  reviewed_at: string
}

export interface DbUserStats {
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  updated_at: string
}

export interface DbUserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
}

export interface DbUserPreferences {
  user_id: string
  selected_topics: string[]
  onboarding_completed: boolean
  updated_at: string
}

export type BadgeConditionJson =
  | { type: 'first_correct' }
  | { type: 'correct_streak'; threshold: number }
  | { type: 'total_reviewed'; threshold: number }
  | { type: 'daily_streak'; threshold: number }
  | { type: 'topic_mastery'; topic: string }
  | { type: 'total_correct'; threshold: number }
  | { type: 'perfect_session'; min_cards: number }
  | { type: 'all_cards_mastery' }
