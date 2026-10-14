import type { UserProgress } from '../../../types/app'
import type { ProgressStore } from '../domain/progress-store'
import { createEmptyProgress } from '../domain/progress-tracker'

const STORAGE_KEY = 'game-learning:progress'

function isValidProgress(value: unknown): value is UserProgress {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.lessons === 'object' && candidate.lessons !== null
    && 'lastAccessedLessonId' in candidate
}

/**
 * Adaptador efímero para preview: guarda en sessionStorage.
 * El estado se pierde al cerrar la pestaña (design.md).
 */
export class SessionProgressStore implements ProgressStore {
  constructor(private readonly storage: Storage) {}

  load(): UserProgress {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (!raw) return createEmptyProgress()
      const parsed: unknown = JSON.parse(raw)
      return isValidProgress(parsed) ? parsed : createEmptyProgress()
    } catch {
      return createEmptyProgress()
    }
  }

  save(progress: UserProgress): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY)
  }
}

/** Crea el store usando el sessionStorage del navegador. Solo en cliente. */
export function createSessionProgressStore(): ProgressStore | null {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return null
  }
  return new SessionProgressStore(window.sessionStorage)
}
