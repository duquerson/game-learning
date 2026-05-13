import type { Card, QuizOption } from '../types/app'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateQuizOptions(card: Card): QuizOption[] {
  const correctId = card.correctAnswer || 'A'

  const options: QuizOption[] = card.options.map(opt => ({
    id: opt.id,
    title: opt.text,
    isCorrect: opt.id === correctId,
  }))

  return shuffle(options)
}
