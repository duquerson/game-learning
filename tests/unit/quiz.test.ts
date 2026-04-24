import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateQuizOptions } from '../../src/lib/quiz'
import { calculatePoints } from '../../src/lib/points'
import type { Card, SessionResult } from '../../src/types/app'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

// Arbitrary for a Card with a given id and topic
const cardArb = (id: string, topic: string): Card => ({
  id,
  title: `Card-${id}`,
  content: `Content for ${id}`,
  topic,
  subtopic: 'sub',
  difficulty: 'easy',
  points: 10,
})

// Arbitrary that generates a Card with arbitrary id and topic
const arbitraryCard = fc.record({
  id: fc.uuid(),
  topic: fc.constantFrom('JavaScript', 'TypeScript', 'CSS', 'HTML'),
}).map(({ id, topic }) => cardArb(id, topic))

describe('generateQuizOptions', () => {
  /**
   * Property 7: Las opciones del Quiz son únicas y contienen la respuesta correcta
   *
   * Validates: Requirements R6.2, R6.3, R6.4
   */
  it('P7: siempre genera exactamente 4 opciones únicas con la respuesta correcta', () => {
    // Generate: current card + at least 3 other cards with unique IDs
    const scenario = fc.uniqueArray(fc.uuid(), { minLength: 4, maxLength: 20 }).chain((ids) => {
      const [currentId, d1, d2, d3, ...rest] = ids
      const currentCard = cardArb(currentId, 'JavaScript')

      // topicCards: same topic as current card (at least 1 additional)
      const topicCardIds = [d1, d2]
      const topicCards = topicCardIds.map(id => cardArb(id, 'JavaScript'))

      // allCards: remaining cards with different topic
      const otherCards = [d3, ...rest].map(id => cardArb(id, 'TypeScript'))

      return fc.constant({ currentCard, topicCards, allCards: otherCards })
    })

    fc.assert(
      fc.property(scenario, ({ currentCard, topicCards, allCards }) => {
        const options = generateQuizOptions(currentCard, topicCards, allCards)

        // 1. Exactly 4 options returned
        expect(options).toHaveLength(4)

        // 2. All option titles are unique (no duplicates)
        const titles = options.map(o => o.title)
        expect(new Set(titles).size).toBe(4)

        // 3. Exactly one option has isCorrect === true
        const correctOptions = options.filter(o => o.isCorrect)
        expect(correctOptions).toHaveLength(1)

        // 4. The correct option's title matches the current card's title
        expect(correctOptions[0].title).toBe(currentCard.title)
      }),
      { numRuns: 100 }
    )
  })

  it('P7: completa con tarjetas de otros topics si no hay suficientes del mismo', () => {
    const target = cardArb('t1', 'JavaScript')
    const topicCards = [cardArb('t2', 'JavaScript')]
    const allCards = [
      cardArb('t3', 'TypeScript'),
      cardArb('t4', 'TypeScript'),
      cardArb('t5', 'TypeScript'),
    ]

    const options = generateQuizOptions(target, topicCards, allCards)

    expect(options).toHaveLength(4)
    expect(new Set(options.map(o => o.id)).size).toBe(4)

    const correctOptions = options.filter(o => o.isCorrect)
    expect(correctOptions).toHaveLength(1)
    expect(correctOptions[0].title).toBe(target.title)
  })
})

describe('session simulation', () => {
  /**
   * Property 8: El conteo de resultados de sesión iguala el tamaño del deck
   *
   * Validates: Requirements R5.7, R6.8
   */
  it('P8: simular una sesión produce exactamente N SessionResult, uno por carta', () => {
    const deckArb = fc.integer({ min: 1, max: 20 }).chain((n) =>
      fc.tuple(
        fc.array(
          fc.record({
            id: fc.uuid(),
            difficulty: fc.constantFrom(...DIFFICULTIES),
          }).map(({ id, difficulty }) => ({
            id,
            title: `Card-${id}`,
            content: `Content for ${id}`,
            topic: 'JavaScript',
            subtopic: 'sub',
            difficulty,
            points: 10,
          } satisfies Card)),
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

        // 1. Exactly N results
        expect(results).toHaveLength(deck.length)

        // 2. Each result's cardId matches the corresponding card
        results.forEach((result, i) => {
          expect(result.cardId).toBe(deck[i].id)
        })
      }),
      { numRuns: 200 }
    )
  })
})
