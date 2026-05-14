import type { Card, Flashcard } from '../types/app'

/**
 * Mapea el modelo de datos de la base de datos (Card) al nuevo modelo UX (Flashcard).
 * Esto permite desacoplar el almacenamiento de la presentación.
 */
export function mapCardToFlashcard(card: Card): Flashcard {
  // Intentar extraer pista opcional del contenido (ej: si termina con (Pista: ...))
  const hintMatch = card.content.match(/\(Pista: (.*?)\)$/)
  const hint = hintMatch ? hintMatch[1] : undefined
  const contentWithoutHint = hint ? card.content.replace(/\(Pista: (.*?)\)$/, '').trim() : card.content

  return {
    ...card,
    category: card.subtopic || card.topic,
    front: {
      question: card.title,
      hint: hint
    },
    back: {
      answer: card.question || card.title, // En el modelo anterior question era a veces la respuesta o el titulo era la pregunta
      explanation: contentWithoutHint,
      code: extractCode(contentWithoutHint),
      // Si la respuesta es SI/NO o similar, marcar como trueFalse
      trueFalse: isTrueFalse(card.question || card.title)
    }
  }
}

function extractCode(content: string): string | undefined {
  const codeMatch = content.match(/```(?:ts|js|typescript|javascript)?\n([\s\S]*?)```/)
  return codeMatch ? codeMatch[1].trim() : undefined
}

function isTrueFalse(text: string): boolean {
  const lower = text.toLowerCase()
  return lower.includes('¿es cierto') || lower.includes('verdadero o falso')
}
