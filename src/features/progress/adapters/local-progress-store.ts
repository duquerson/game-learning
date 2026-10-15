import type { ProgressStore } from '../domain/progress-store'
import { STORAGE_KEY, StorageProgressStore, isValidProgress } from './progress-storage'
import { SessionProgressStore } from './session-progress-store'

export { STORAGE_KEY }

/**
 * Adaptador local anónimo: persiste en localStorage (sobrevive al cierre).
 * Sin cuentas ni sincronización: solo este navegador. Borrado autoservicio.
 */
export class LocalProgressStore extends StorageProgressStore {
  constructor(storage: Storage) {
    super(storage)
  }
}

/**
 * Migra una sola vez el progreso efímero previo (session) a local.
 * No sobrescribe un progreso local ya existente. Tolerante a JSON corrupto.
 */
export function migrateSessionToLocal(session: Storage, local: Storage): void {
  try {
    if (local.getItem(STORAGE_KEY) !== null) return
    const raw = session.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed: unknown = JSON.parse(raw)
    if (!isValidProgress(parsed)) return
    local.setItem(STORAGE_KEY, raw)
    session.removeItem(STORAGE_KEY)
  } catch {
    // Migración best-effort: nunca debe romper la carga.
  }
}

function safeStorage(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    const s = window[kind]
    if (typeof s === 'undefined') return null
    // Sonda modo privado: puede lanzar al escribir.
    const probe = '__gl_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

/** Crea el store local anónimo. Solo en cliente. Con fallback a session si local no disponible. */
export function createLocalProgressStore(): ProgressStore | null {
  const local = safeStorage('localStorage')
  if (local) {
    const session = safeStorage('sessionStorage')
    if (session) migrateSessionToLocal(session, local)
    return new LocalProgressStore(local)
  }
  const session = safeStorage('sessionStorage')
  if (session) return new SessionProgressStore(session)
  return null
}
