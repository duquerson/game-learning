import type { Lesson } from '../../../types/app'

const OPTION_IDS = ['A', 'B', 'C', 'D'] as const

/**
 * Valida una lección contra los contratos de design.md.
 * Devuelve una lista de errores legibles; vacía si la lección es válida.
 */
export function validateLesson(lesson: Lesson): string[] {
  const errors: string[] = []
  const label = lesson.id || '(sin id)'

  if (!lesson.id) errors.push('Lección sin id.')
  if (!lesson.objective.trim()) errors.push(`Lección ${label}: falta el objetivo observable.`)
  if (!lesson.explanation.trim()) errors.push(`Lección ${label}: falta la explicación.`)
  if (!lesson.title.trim()) errors.push(`Lección ${label}: falta el título.`)

  if (lesson.quiz.length !== 5) {
    errors.push(`Lección ${label}: el quiz debe tener exactamente 5 preguntas (recibidas: ${lesson.quiz.length}).`)
  }

  const seenIds = new Set<string>()
  for (const question of lesson.quiz) {
    const qLabel = question.id || '(sin id)'
    if (seenIds.has(question.id)) {
      errors.push(`Lección ${label}: ID de pregunta duplicado "${qLabel}".`)
    }
    seenIds.add(question.id)

    if (question.options.length !== 4) {
      errors.push(`Lección ${label}, pregunta ${qLabel}: debe tener 4 opciones (recibidas: ${question.options.length}).`)
    }
    if (!OPTION_IDS.includes(question.correctOptionId)) {
      errors.push(`Lección ${label}, pregunta ${qLabel}: correctOptionId "${question.correctOptionId}" no corresponde a una opción válida.`)
    }
    if (!question.prompt.trim()) {
      errors.push(`Lección ${label}, pregunta ${qLabel}: falta el enunciado.`)
    }
    if (!question.explanation.trim()) {
      errors.push(`Lección ${label}, pregunta ${qLabel}: falta la explicación del feedback.`)
    }
  }

  return errors
}

/**
 * Valida el catálogo completo: cada lección y unicidad de IDs.
 */
export function validateCatalog(lessons: Lesson[]): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const lesson of lessons) {
    if (seen.has(lesson.id)) {
      errors.push(`ID de lección duplicado: "${lesson.id}".`)
    }
    seen.add(lesson.id)
    errors.push(...validateLesson(lesson))
  }
  return errors
}
