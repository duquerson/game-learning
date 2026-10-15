import { describe, it, expect, beforeEach } from 'vitest'
import { LocalProgressStore } from '../../src/features/progress/adapters/local-progress-store'
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

describe('LocalProgressStore', () => {
  let storage: MemoryStorage
  let store: ProgressStore

  beforeEach(() => {
    storage = new MemoryStorage()
    store = new LocalProgressStore(storage)
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

  it('no lanza si el storage falla por cuota al guardar/limpiar', () => {
    class QuotaStorage extends MemoryStorage {
      override setItem(): void { throw new Error('QuotaExceeded') }
      override removeItem(): void { throw new Error('denied') }
    }
    const failing = new LocalProgressStore(new QuotaStorage())
    expect(() =>
      failing.save({ lessons: {}, lastAccessedLessonId: 'x' }),
    ).not.toThrow()
    expect(() => failing.clear()).not.toThrow()
    expect(failing.load()).toEqual(createEmptyProgress())
  })

  it('rechaza lastAccessedLessonId con tipo inválido', () => {
    storage.setItem(
      'game-learning:progress',
      JSON.stringify({ lessons: {}, lastAccessedLessonId: 123 }),
    )
    expect(store.load()).toEqual(createEmptyProgress())
  })
  it('migra el progreso previo de session storage a local una sola vez', async () => {
    const { migrateSessionToLocal } = await import(
      '../../src/features/progress/adapters/local-progress-store'
    )
    const session = new MemoryStorage()
    const local = new MemoryStorage()
    session.setItem(
      'game-learning:progress',
      JSON.stringify({ lessons: {}, lastAccessedLessonId: 'basico-variables' }),
    )
    migrateSessionToLocal(session, local)
    expect(local.getItem('game-learning:progress')).toBeTruthy()
    // No sobrescribe un progreso local ya existente
    local.setItem(
      'game-learning:progress',
      JSON.stringify({ lessons: {}, lastAccessedLessonId: 'otro' }),
    )
    session.setItem(
      'game-learning:progress',
      JSON.stringify({ lessons: {}, lastAccessedLessonId: 'basico-variables' }),
    )
    migrateSessionToLocal(session, local)
    expect(JSON.parse(local.getItem('game-learning:progress')!).lastAccessedLessonId).toBe('otro')
  })
})
