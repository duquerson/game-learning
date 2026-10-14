import { describe, it, expect } from 'vitest'
import {
  createEmptyProgress,
  markRead,
  recordQuizAttempt,
  deriveState,
} from '../../src/features/progress/domain/progress-tracker'
import { PASSING_SCORE } from '../../src/features/quiz/domain/grade-quiz'

describe('progress-tracker (dominio puro)', () => {
  it('crea progreso vacío', () => {
    const progress = createEmptyProgress()
    expect(progress.lessons).toEqual({})
    expect(progress.lastAccessedLessonId).toBeNull()
  })

  it('markRead registra lectura y actualiza lastAccessedLessonId', () => {
    let progress = createEmptyProgress()
    progress = markRead(progress, 'basico-variables')
    expect(progress.lessons['basico-variables'].read).toBe(true)
    expect(progress.lessons['basico-variables'].state).toBe('in_progress')
    expect(progress.lastAccessedLessonId).toBe('basico-variables')
  })

  it('un quiz aprobado sin lectura no marca mastered', () => {
    let progress = createEmptyProgress()
    progress = recordQuizAttempt(progress, 'basico-variables', PASSING_SCORE)
    expect(progress.lessons['basico-variables'].state).toBe('in_progress')
  })

  it('lectura + quiz aprobado = mastered', () => {
    let progress = createEmptyProgress()
    progress = markRead(progress, 'basico-variables')
    progress = recordQuizAttempt(progress, 'basico-variables', PASSING_SCORE)
    expect(progress.lessons['basico-variables'].state).toBe('mastered')
  })

  it('un quiz reprobado deja la lección en curso si fue leída', () => {
    let progress = createEmptyProgress()
    progress = markRead(progress, 'basico-variables')
    progress = recordQuizAttempt(progress, 'basico-variables', 2)
    expect(progress.lessons['basico-variables'].state).toBe('in_progress')
  })

  it('mastered no se pierde con un intento posterior reprobado', () => {
    let progress = createEmptyProgress()
    progress = markRead(progress, 'basico-variables')
    progress = recordQuizAttempt(progress, 'basico-variables', PASSING_SCORE)
    progress = recordQuizAttempt(progress, 'basico-variables', 1)
    expect(progress.lessons['basico-variables'].state).toBe('mastered')
  })

  it('bestScore conserva el mejor resultado', () => {
    let progress = createEmptyProgress()
    progress = markRead(progress, 'l1')
    progress = recordQuizAttempt(progress, 'l1', 3)
    progress = recordQuizAttempt(progress, 'l1', 5)
    progress = recordQuizAttempt(progress, 'l1', 2)
    expect(progress.lessons['l1'].bestScore).toBe(5)
  })

  it('deriveState: not_started sin datos', () => {
    expect(deriveState(undefined)).toBe('not_started')
  })
})
