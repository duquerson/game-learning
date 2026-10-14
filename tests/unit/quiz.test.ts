import { describe, it, expect } from 'vitest'
import { gradeQuiz, PASSING_SCORE } from '../../src/features/quiz/domain/grade-quiz'
import type { Question } from '../../src/types/app'

function q(id: string, correct: 'A' | 'B' | 'C' | 'D'): Question {
  return {
    id,
    prompt: `Pregunta ${id}`,
    options: ['opA', 'opB', 'opC', 'opD'],
    correctOptionId: correct,
    explanation: `Explicación ${id}`,
  }
}

const quiz: Question[] = [
  q('q1', 'A'),
  q('q2', 'B'),
  q('q3', 'C'),
  q('q4', 'D'),
  q('q5', 'A'),
]

describe('gradeQuiz', () => {
  it('marca passed con 5/5', () => {
    const result = gradeQuiz(quiz, { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'A' })
    expect(result.correctCount).toBe(5)
    expect(result.passed).toBe(true)
    expect(result.total).toBe(5)
  })

  it('marca passed con 4/5 (regla de dominio)', () => {
    const result = gradeQuiz(quiz, { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'B' })
    expect(result.correctCount).toBe(4)
    expect(result.passed).toBe(true)
  })

  it('marca failed con 3/5', () => {
    const result = gradeQuiz(quiz, { q1: 'A', q2: 'B', q3: 'C', q4: 'A', q5: 'B' })
    expect(result.correctCount).toBe(3)
    expect(result.passed).toBe(false)
  })

  it('ignora respuestas que no corresponden a una pregunta', () => {
    const result = gradeQuiz(quiz, { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'A', fantasma: 'B' })
    expect(result.correctCount).toBe(5)
  })

  it('cuenta como incorrecta una respuesta que no está en las opciones', () => {
    const result = gradeQuiz(quiz, { q1: 'Z', q2: 'B', q3: 'C', q4: 'D', q5: 'A' })
    expect(result.correctCount).toBe(4)
  })

  it('incluye feedback explicativo por pregunta en orden', () => {
    const result = gradeQuiz(quiz, { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'B' })
    expect(result.feedback).toHaveLength(5)
    expect(result.feedback[4]).toContain('Explicación q5')
  })

  it('expone la constante PASSING_SCORE en 4', () => {
    expect(PASSING_SCORE).toBe(4)
  })

  it('lanza error con un quiz que no tenga 5 preguntas', () => {
    expect(() => gradeQuiz(quiz.slice(0, 3), {})).toThrow()
  })
})
