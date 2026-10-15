import type { UserProgress } from '../../../types/app'

/**
 * Puerto de persistencia de progreso (architecture.md).
 * Preview usa adaptador local anónimo (localStorage, con fallback).
 */
export interface ProgressStore {
  load(): UserProgress
  save(progress: UserProgress): void
  clear(): void
}
