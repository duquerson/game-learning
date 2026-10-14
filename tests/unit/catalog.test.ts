import { describe, it, expect } from 'vitest'
import { lessons, lessonsByLevel, lessonById, nextLesson, levels } from '../../src/features/learning-content/content'

describe('catálogo real de contenido', () => {
  it('importa sin errores de validación (build gate)', () => {
    expect(lessons.length).toBe(9)
  })

  it('cubre los 3 niveles con 3 lecciones cada uno', () => {
    for (const level of levels) {
      expect(lessonsByLevel(level.id)).toHaveLength(3)
    }
  })

  it('cada lección tiene 5 preguntas de quiz', () => {
    for (const lesson of lessons) {
      expect(lesson.quiz, lesson.id).toHaveLength(5)
    }
  })

  it('lessonById encuentra una lección existente', () => {
    expect(lessonById('basico-variables')?.title).toContain('Variables')
  })

  it('nextLesson avanza en orden y termina en null al final', () => {
    const first = lessons[0]
    const second = nextLesson(first.id)
    expect(second?.id).toBe(lessons[1].id)
    expect(nextLesson(lessons[lessons.length - 1].id)).toBeUndefined()
  })
})
