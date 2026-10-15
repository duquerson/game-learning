import type { UserProgress } from '../../../types/app'
import type { ProgressStore } from '../domain/progress-store'
import { createEmptyProgress } from '../domain/progress-tracker'

export const STORAGE_KEY = 'game-learning:progress'

export function isValidProgress(value: unknown): value is UserProgress {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.lessons !== 'object' || candidate.lessons === null) return false
  if (!('lastAccessedLessonId' in candidate)) return false
  if (
    candidate.lastAccessedLessonId !== null
    && typeof candidate.lastAccessedLessonId !== 'string'
  ) return false
  return true
}

/**
 * Base best-effort sobre Storage: load tolerante, save/clear nunca lanzan
 * (p. ej. QuotaExceededError en modo privado lleno no debe romper la UI).
 */
export class StorageProgressStore implements ProgressStore {
  constructor(protected readonly storage: Storage) {}

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
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // best-effort: el estado en memoria sigue válido
    }
  }

  clear(): void {
    try {
      this.storage.removeItem(STORAGE_KEY)
    } catch {
      // best-effort
    }
  }
}
