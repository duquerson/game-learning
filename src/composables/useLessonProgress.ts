import { ref, computed, onMounted } from 'vue'
import type { LessonProgress, UserProgress } from '@/types/app'
import { STORAGE_KEY, createLocalProgressStore } from '@/features/progress/adapters/local-progress-store'
import type { ProgressStore } from '@/features/progress/domain/progress-store'
import { createEmptyProgress, markRead, recordQuizAttempt } from '@/features/progress/domain/progress-tracker'

const sharedProgress = ref<UserProgress>(createEmptyProgress())
let store: ProgressStore | null = null
let storeLoaded = false

/**
 * Composable compartido de progreso local anónimo (localStorage).
 * Persiste al cerrar la pestaña/navegador; solo en este dispositivo.
 * Sin cuentas ni sincronización. Borrado autoservicio vía clearProgress.
 *
 * Hidratación SSR-safe: las lecturas devuelven estado vacío hasta que
 * `ready` se activa en onMounted de cada instancia. Así el primer render
 * del cliente coincide con el HTML del servidor aunque otra isla Vue
 * (p. ej. LessonView) haya mutado el estado compartido primero.
 */
export function useLessonProgress() {
  const ready = ref(false)

  onMounted(() => {
    if (!store) store = createLocalProgressStore()
    if (store && !storeLoaded) {
      sharedProgress.value = store.load()
      storeLoaded = true
    }
    ready.value = true
  })

  const progress = computed(() => (ready.value ? sharedProgress.value : null))

  function stateOf(lessonId: string): LessonProgress | undefined {
    if (!ready.value) return undefined
    return sharedProgress.value.lessons[lessonId]
  }

  function isRead(lessonId: string): boolean {
    return stateOf(lessonId)?.read ?? false
  }

  function isMastered(lessonId: string): boolean {
    return stateOf(lessonId)?.state === 'mastered'
  }

  function registerRead(lessonId: string): void {
    sharedProgress.value = markRead(sharedProgress.value, lessonId)
    store?.save(sharedProgress.value)
  }

  function registerQuizResult(lessonId: string, correctCount: number): void {
    sharedProgress.value = recordQuizAttempt(sharedProgress.value, lessonId, correctCount)
    store?.save(sharedProgress.value)
  }

  function clearProgress(): void {
    sharedProgress.value = createEmptyProgress()
    try {
      store?.clear()
    } catch {
      // best-effort: el estado en memoria ya se reinició (save/clear no lanzan)
    }
    // Limpia resto de session previa si existía (migración parcial / fallback).
    try {
      if (typeof window !== 'undefined') window.sessionStorage?.removeItem(STORAGE_KEY)
    } catch {
      // best-effort
    }
  }

  return { progress, ready, stateOf, isRead, isMastered, registerRead, registerQuizResult, clearProgress }
}
