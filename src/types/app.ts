// Contratos del dominio educativo (design.md)

export type LevelId = 'basico' | 'intermedio' | 'avanzado'
export type LessonState = 'not_started' | 'in_progress' | 'mastered'

export interface Question {
  id: string
  prompt: string
  options: [string, string, string, string]
  correctOptionId: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface Lesson {
  id: string
  level: LevelId
  unitId: string
  title: string
  objective: string
  explanation: string
  examples: string[]
  quiz: Question[]
  practices: string[]
}

export interface QuizResult {
  correctCount: number
  total: 5
  passed: boolean
  feedback: string[]
}

export interface LessonProgress {
  lessonId: string
  read: boolean
  bestScore: number
  state: LessonState
}

export interface UserProgress {
  lessons: Record<string, LessonProgress>
  lastAccessedLessonId: string | null
}
