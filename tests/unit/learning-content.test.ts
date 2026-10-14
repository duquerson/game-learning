import { describe, it, expect } from 'vitest'
import { validateLesson, validateCatalog } from '../../src/features/learning-content/domain/validate'
import type { Lesson } from '../../src/types/app'

function makeQuestion(overrides: Partial<Lesson['quiz'][number]> = {}): Lesson['quiz'][number] {
  return {
    id: 'q1',
    prompt: '¿Qué imprime console.log(typeof null)?',
    options: ['object', 'null', 'undefined', 'number'],
    correctOptionId: 'A',
    explanation: 'En JS typeof null es "object" (bug histórico).',
    ...overrides,
  }
}

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 'basico-variables',
    level: 'basico',
    unitId: 'basico-1',
    title: 'Variables y tipos de datos',
    objective: 'Declarar variables con let/const e identificar tipos primitivos.',
    explanation: 'Explicación de prueba.',
    examples: ['const x = 1'],
    quiz: Array.from({ length: 5 }, (_, i) => makeQuestion({ id: `q${i + 1}` })),
    practices: ['Práctica opcional'],
    ...overrides,
  }
}

describe('validateLesson', () => {
  it('acepta una lección válida', () => {
    expect(validateLesson(makeLesson())).toEqual([])
  })

  it('rechaza un quiz con menos de 5 preguntas', () => {
    const errors = validateLesson(makeLesson({ quiz: [makeQuestion()] }))
    expect(errors.some((e) => e.includes('5 preguntas'))).toBe(true)
  })

  it('rechaza una pregunta sin 4 opciones', () => {
    const bad = makeQuestion({ options: ['a', 'b', 'c'] as never })
    const errors = validateLesson(makeLesson({ quiz: [bad, ...Array.from({ length: 4 }, (_, i) => makeQuestion({ id: `q${i + 2}` }))] }))
    expect(errors.some((e) => e.includes('4 opciones'))).toBe(true)
  })

  it('rechaza correctOptionId que no exista en opciones', () => {
    const bad = makeQuestion({ correctOptionId: 'Z' as never })
    const errors = validateLesson(makeLesson({ quiz: [bad, ...Array.from({ length: 4 }, (_, i) => makeQuestion({ id: `q${i + 2}` }))] }))
    expect(errors.some((e) => e.includes('correctOptionId'))).toBe(true)
  })

  it('rechaza IDs de pregunta duplicados', () => {
    const dup = Array.from({ length: 5 }, () => makeQuestion({ id: 'same' }))
    const errors = validateLesson(makeLesson({ quiz: dup }))
    expect(errors.some((e) => e.includes('duplicad'))).toBe(true)
  })

  it('rechaza lección sin objetivo', () => {
    const errors = validateLesson(makeLesson({ objective: '' }))
    expect(errors.some((e) => e.includes('objetivo'))).toBe(true)
  })

  it('rechaza lección sin explicación', () => {
    const errors = validateLesson(makeLesson({ explanation: '' }))
    expect(errors.some((e) => e.includes('explicación'))).toBe(true)
  })
})

describe('validateCatalog', () => {
  it('acepta el catálogo de 9 lecciones válido', () => {
    const catalog = ['basico', 'intermedio', 'avanzado'].flatMap((level) =>
      [1, 2, 3].flatMap((unit) =>
        [1, 2, 3].map((n) => makeLesson({ id: `${level}-u${unit}-l${n}`, level: level as never, unitId: `${level}-${unit}` }))
      )
    )
    expect(validateCatalog(catalog)).toEqual([])
  })

  it('rechaza IDs duplicados en el catálogo', () => {
    const catalog = [makeLesson({ id: 'dup' }), makeLesson({ id: 'dup' })]
    const errors = validateCatalog(catalog)
    expect(errors.some((e) => e.includes('duplicad'))).toBe(true)
  })
})
