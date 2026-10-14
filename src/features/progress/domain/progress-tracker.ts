import type { LessonProgress, LessonState, UserProgress } from '../../../types/app'
import { PASSING_SCORE } from '../../quiz/domain/grade-quiz'

/** Crea el progreso vacío de una sesión preview. */
export function createEmptyProgress(): UserProgress {
  return { lessons: {}, lastAccessedLessonId: null }
}

function ensureLesson(progress: UserProgress, lessonId: string): LessonProgress {
  return progress.lessons[lessonId] ?? { lessonId, read: false, bestScore: 0, state: 'not_started' }
}

function withLesson(progress: UserProgress, lesson: LessonProgress): UserProgress {
  return {
    ...progress,
    lessons: { ...progress.lessons, [lesson.lessonId]: lesson },
    lastAccessedLessonId: lesson.lessonId,
  }
}

/**
 * Transición de estado según reglas de dominio (design.md):
 * - sin lectura ni quiz: not_started
 * - con lectura o al menos un intento: in_progress
 * - lectura registrada Y quiz >= 4/5: mastered
 * - mastered es un piso: no retrocede con intentos posteriores
 */
export function deriveState(input: { read: boolean; bestScore: number } | undefined): LessonState {
  if (!input) return 'not_started'
  if (input.read && input.bestScore >= PASSING_SCORE) return 'mastered'
  if (input.read || input.bestScore > 0) return 'in_progress'
  return 'not_started'
}

/** Registra la lectura de la lección (requisito junto a 4/5 para dominar). */
export function markRead(progress: UserProgress, lessonId: string): UserProgress {
  const lesson = ensureLesson(progress, lessonId)
  return withLesson(progress, { ...lesson, read: true, state: deriveState({ read: true, bestScore: lesson.bestScore }) })
}

/** Registra un intento de quiz; conserva el mejor resultado. */
export function recordQuizAttempt(progress: UserProgress, lessonId: string, correctCount: number): UserProgress {
  const lesson = ensureLesson(progress, lessonId)
  const bestScore = Math.max(lesson.bestScore, correctCount)
  return withLesson(progress, {
    ...lesson,
    bestScore,
    state: deriveState({ read: lesson.read, bestScore }),
  })
}
