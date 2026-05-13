import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateQuizOptions } from '../../src/lib/quiz'
import { calculatePoints } from '../../src/lib/points'
import type { Card, SessionResult, CardOption } from '../../src/types/app'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

function makeCard(id: string, topic: string): Card {
  const optionA: CardOption = { id: 'A', text: `Respuesta correcta para ${id}` }
  const optionB: CardOption = { id: 'B', text: `Distractor B para ${id}` }
  const optionC: CardOption = { id: 'C', text: `Distractor C para ${id}` }
  const optionD: CardOption = { id: 'D', text: `Distractor D para ${id}` }
  return {
    id,
    title: `Card-${id}`,
    content: `Content for ${id}`,
    topic,
    subtopic: 'sub',
    difficulty: 'easy',
    points: 10,
    question: `Question for ${id}?`,
    options: [optionA, optionB, optionC, optionD],
    correctAnswer: 'A',
  }
}

const arbitraryCard = fc.record({
  id: fc.uuid(),
  topic: fc.constantFrom('JavaScript', 'TypeScript', 'CSS', 'HTML'),
}).map(({ id, topic }) => makeCard(id, topic))

describe('generateQuizOptions', () => {
  it('P7: siempre genera exactamente 4 opciones unicas con la respuesta correcta', () => {
    const scenario = fc.uniqueArray(fc.uuid(), { minLength: 1, maxLength: 10 }).chain((ids) => {
      const card = makeCard(ids[0], 'JavaScript')
      return fc.constant({ card })
    })

    fc.assert(
      fc.property(scenario, ({ card }) => {
        const options = generateQuizOptions(card)

        expect(options).toHaveLength(4)

        const titles = options.map(o => o.title)
        expect(new Set(titles).size).toBe(4)

        const correctOptions = options.filter(o => o.isCorrect)
        expect(correctOptions).toHaveLength(1)

        expect(correctOptions[0].id).toBe(card.correctAnswer)
      }),
      { numRuns: 100 }
    )
  })
})

describe('session simulation', () => {
  it('P8: simular una sesion produce exactamente N SessionResult, uno por carta', () => {
    const deckArb = fc.integer({ min: 1, max: 20 }).chain((n) =>
      fc.tuple(
        fc.array(
          fc.record({
            id: fc.uuid(),
            difficulty: fc.constantFrom(...DIFFICULTIES),
          }).map(({ id, difficulty }) => {
            const optionA: CardOption = { id: 'A', text: 'Correcta' }
            const optionB: CardOption = { id: 'B', text: 'Incorrecta B' }
            const optionC: CardOption = { id: 'C', text: 'Incorrecta C' }
            const optionD: CardOption = { id: 'D', text: 'Incorrecta D' }
            return {
              id,
              title: `Card-${id}`,
              content: `Content for ${id}`,
              topic: 'JavaScript',
              subtopic: 'sub',
              difficulty,
              points: 10,
              question: `Question for ${id}?`,
              options: [optionA, optionB, optionC, optionD],
              correctAnswer: 'A',
            } satisfies Card
          }),
          { minLength: n, maxLength: n }
        ),
        fc.array(fc.boolean(), { minLength: n, maxLength: n })
      )
    )

    fc.assert(
      fc.property(deckArb, ([deck, answers]) => {
        const results: SessionResult[] = deck.map((card, i) => ({
          cardId: card.id,
          correct: answers[i],
          difficulty: card.difficulty,
          pointsEarned: calculatePoints(card.difficulty, answers[i]),
        }))

        expect(results).toHaveLength(deck.length)

        results.forEach((result, i) => {
          expect(result.cardId).toBe(deck[i].id)
        })
      }),
      { numRuns: 200 }
    )
  })
})
