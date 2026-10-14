import { ref, computed, onMounted } from 'vue'
import type { LessonProgress, UserProgress } from '@/types/app'
import { createSessionProgressStore } from '@/features/progress/adapters/session-progress-store'
import type { ProgressStore } from '@/features/progress/domain/progress-store'
import { createEmptyProgress, markRead, recordQuizAttempt } from '@/features/progress/domain/progress-tracker'

const sharedProgress = ref<UserProgress>(createEmptyProgress())
let store: ProgressStore | null = null
let storeLoaded = false

/**
 * Composable compartido de progreso efímero (session storage).
 * Estado efímero: se pierde al recargar la pestaña (design.md).
 *
 * Hidratación SSR-safe: las lecturas devuelven estado vacío hasta que
 * `ready` se activa en onMounted de cada instancia. Así el primer render
 * del cliente coincide con el HTML del servidor aunque otra isla Vue
 * (p. ej. LessonView) haya mutado el estado compartido primero.
 */
export function useLessonProgress() {
  const ready = ref(false)

  onMounted(() => {
    if (!store) store = createSessionProgressStore()
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

  return { progress, stateOf, isRead, isMastered, registerRead, registerQuizResult }
}
