import type { ProgressStore } from '../domain/progress-store'
import { StorageProgressStore } from './progress-storage'

/**
 * Adaptador de fallback: guarda en sessionStorage.
 * Se usa solo si localStorage no está disponible (modo privado estricto).
 */
export class SessionProgressStore extends StorageProgressStore {
  constructor(storage: Storage) {
    super(storage)
  }
}

/** Crea el store usando el sessionStorage del navegador. Solo en cliente. */
export function createSessionProgressStore(): ProgressStore | null {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return null
  }
  return new SessionProgressStore(window.sessionStorage)
}
