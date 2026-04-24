import type { Card, QuizOption } from '../types/app'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateQuizOptions(card: Card, topicCards: Card[], allCards: Card[]): QuizOption[] {
  const sameTopicDistractors = topicCards.filter(c => c.id !== card.id)
  const otherDistractors = allCards.filter(c => c.id !== card.id && c.topic !== card.topic)

  const distractorPool = shuffle([...sameTopicDistractors, ...otherDistractors])
  const distractors = distractorPool.slice(0, 3)

  const options: QuizOption[] = [
    { id: card.id, title: card.title, isCorrect: true },
    ...distractors.map(d => ({ id: d.id, title: d.title, isCorrect: false })),
  ]

  return shuffle(options)
}
