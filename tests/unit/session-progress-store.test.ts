import { describe, it, expect, beforeEach } from 'vitest'
import { SessionProgressStore } from '../../src/features/progress/adapters/session-progress-store'
import type { ProgressStore } from '../../src/features/progress/domain/progress-store'
import { createEmptyProgress } from '../../src/features/progress/domain/progress-tracker'

// Stub mínimo de Storage para entorno node
class MemoryStorage implements Storage {
  private map = new Map<string, string>()
  get length() { return this.map.size }
  clear() { this.map.clear() }
  getItem(key: string) { return this.map.has(key) ? this.map.get(key)! : null }
  key(index: number) { return [...this.map.keys()][index] ?? null }
  removeItem(key: string) { this.map.delete(key) }
  setItem(key: string, value: string) { this.map.set(key, value) }
}

describe('SessionProgressStore', () => {
  let storage: MemoryStorage
  let store: ProgressStore

  beforeEach(() => {
    storage = new MemoryStorage()
    store = new SessionProgressStore(storage)
  })

  it('retorna progreso vacío cuando no hay nada guardado', () => {
    expect(store.load()).toEqual(createEmptyProgress())
  })

  it('guarda y recarga el progreso', () => {
    const progress = {
      lessons: { 'l1': { lessonId: 'l1', read: true, bestScore: 4, state: 'mastered' as const } },
      lastAccessedLessonId: 'l1',
    }
    store.save(progress)
    expect(store.load()).toEqual(progress)
  })

  it('limpia el progreso guardado', () => {
    store.save({ lessons: {}, lastAccessedLessonId: 'x' })
    store.clear()
    expect(store.load()).toEqual(createEmptyProgress())
  })

  it('retorna progreso vacío si el JSON está corrupto', () => {
    storage.setItem('game-learning:progress', '{corrupto')
    expect(store.load()).toEqual(createEmptyProgress())
  })

  it('retorna progreso vacío si el JSON no tiene la forma esperada', () => {
    storage.setItem('game-learning:progress', JSON.stringify({ unexpected: true }))
    expect(store.load()).toEqual(createEmptyProgress())
  })
})
