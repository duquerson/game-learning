import type { Question, QuizResult } from '../../../types/app'

/** Regla de dominio: 4 de 5 correctas = dominado (design.md). */
export const PASSING_SCORE = 4
export const QUIZ_LENGTH = 5

/**
 * Evalúa un quiz de selección múltiple.
 * Función pura: no depende de DOM, framework ni almacenamiento.
 */
export function gradeQuiz(quiz: Question[], answers: Record<string, string>): QuizResult {
  if (quiz.length !== QUIZ_LENGTH) {
    throw new Error(`gradeQuiz: se esperaban ${QUIZ_LENGTH} preguntas, se recibieron ${quiz.length}.`)
  }

  let correctCount = 0
  const feedback: string[] = []

  for (const question of quiz) {
    const given = answers[question.id]
    const isCorrect = given === question.correctOptionId
    if (isCorrect) correctCount += 1
    const verdict = isCorrect ? 'Correcta.' : given === undefined ? 'Sin responder.' : 'Incorrecta.'
    feedback.push(`${verdict} ${question.explanation}`)
  }

  return {
    correctCount,
    total: QUIZ_LENGTH,
    passed: correctCount >= PASSING_SCORE,
    feedback,
  }
}
