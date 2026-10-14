import { ref, computed } from 'vue'
import type { LessonProgress, UserProgress } from '@/types/app'
import { createSessionProgressStore } from '@/features/progress/adapters/session-progress-store'
import type { ProgressStore } from '@/features/progress/domain/progress-store'
import { createEmptyProgress, markRead, recordQuizAttempt } from '@/features/progress/domain/progress-tracker'

let sharedProgress = ref<UserProgress>(createEmptyProgress())
let store: ProgressStore | null = null

function ensureStore(): ProgressStore | null {
  if (typeof window === 'undefined') return null
  if (!store) {
    store = createSessionProgressStore()
    if (store) sharedProgress.value = store.load()
  }
  return store
}

/**
 * Composable compartido de progreso efímero (session storage).
 * Estado efímero: se pierde al recargar la pestaña (design.md).
 */
export function useLessonProgress() {
  const s = ensureStore()

  const progress = computed(() => sharedProgress.value)

  function stateOf(lessonId: string): LessonProgress | undefined {
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
    s?.save(sharedProgress.value)
  }

  function registerQuizResult(lessonId: string, correctCount: number): void {
    sharedProgress.value = recordQuizAttempt(sharedProgress.value, lessonId, correctCount)
    s?.save(sharedProgress.value)
  }

  return { progress, stateOf, isRead, isMastered, registerRead, registerQuizResult }
}
