<script setup lang="ts">
import { computed } from 'vue'
import { levels, lessons, lessonsByLevel, lessonById } from '@/features/learning-content/content'
import { useLessonProgress } from '@/composables/useLessonProgress'

defineProps<{
  currentLessonId?: string
}>()

const { isMastered, stateOf, progress, ready, clearProgress } = useLessonProgress()

const totalLessons = computed(() => levels.reduce((acc, l) => acc + lessonsByLevel(l.id).length, 0))
const masteredCount = computed(() =>
  levels.flatMap((l) => lessonsByLevel(l.id)).filter((les) => isMastered(les.id)).length
)

const PENDING_PREVIEW_COUNT = 2

const continueLesson = computed(() => {
  const lastId = progress.value?.lastAccessedLessonId
  const hasProgress = !!lastId && Object.keys(progress.value?.lessons ?? {}).length > 0
  if (!hasProgress) return undefined
  if (lastId) {
    const lesson = lessonById(lastId)
    if (lesson && !isMastered(lastId)) return lesson
  }
  // Fallback: si lo último visto ya está dominado, sugiere el primer pendiente
  // para que el banner no desaparezca con 8/9 dominadas.
  return lessons.find((l) => !isMastered(l.id))
})

const pendingTitles = computed(() =>
  lessons.filter((l) => !isMastered(l.id)).slice(0, PENDING_PREVIEW_COUNT).map((l) => l.title)
)

function handleClear() {
  if (typeof window !== 'undefined' && window.confirm('¿Borrar tu progreso en este navegador?')) {
    clearProgress()
  }
}

function stateLabel(lessonId: string): string {
  const st = stateOf(lessonId)
  if (!st || st.state === 'not_started') return 'Sin empezar'
  if (st.state === 'in_progress') return 'En curso'
  return 'Dominado'
}

function stateClass(lessonId: string): string {
  const st = stateOf(lessonId)
  if (!st || st.state === 'not_started') return 'state-not-started'
  if (st.state === 'in_progress') return 'state-in-progress'
  return 'state-mastered'
}
</script>

<template>
  <nav aria-label="Ruta de aprendizaje" class="course-map">
    <p class="map-summary" role="status">{{ masteredCount }}/{{ totalLessons }} dominadas</p>

    <p v-if="ready && continueLesson" class="continue-block">
      <span class="continue-progress">Llevas {{ masteredCount }}/{{ totalLessons }} · 5 preguntas · ~5 min · sin timer</span>
      <a :href="`/leccion/${continueLesson.id}`" class="continue-link">
        Continuar: {{ continueLesson.title }} →
      </a>
      <span v-if="pendingTitles.length" class="continue-pending">Te faltan: {{ pendingTitles.join(' · ') }}</span>
    </p>

    <section v-for="level in levels" :key="level.id" class="level">
      <h2 class="level-title">{{ level.title }}</h2>
      <p class="level-desc">{{ level.description }}</p>
      <ul class="lesson-list">
        <li v-for="lesson in lessonsByLevel(level.id)" :key="lesson.id">
          <a
            :href="`/leccion/${lesson.id}`"
            class="lesson-link"
            :class="[stateClass(lesson.id), { current: lesson.id === currentLessonId }]"
            :aria-current="lesson.id === currentLessonId ? 'page' : undefined"
          >
            <span class="lesson-marker" aria-hidden="true"></span>
            <span class="lesson-title">{{ lesson.title }}</span>
            <span class="lesson-state" :class="stateClass(lesson.id)">{{ stateLabel(lesson.id) }}</span>
          </a>
        </li>
      </ul>
    </section>

    <p class="preview-hint">
      Tu progreso se guarda solo en este navegador y sobrevive al cerrar la pestaña. Sin cuentas ni sincronización.
      <button type="button" class="clear-btn" @click="handleClear">Borrar progreso</button>
    </p>
  </nav>
</template>

<style scoped>
.course-map {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.map-summary {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: 600;
}
.level-title {
  font-size: var(--text-h3);
  margin: 0 0 0.15rem;
}
.level-desc {
  margin: 0 0 0.6rem;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.lesson-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.lesson-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-foreground);
  border: 1px solid transparent;
  transition: background 0.15s;
}
.lesson-link:hover {
  background: var(--color-surface);
}
.lesson-link.current {
  border-color: var(--color-attention);
  background: var(--color-surface);
}
.lesson-marker {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--color-muted);
  background: transparent;
}
.state-in-progress .lesson-marker,
.lesson-state.state-in-progress {
  border-color: var(--color-attention);
}
.state-mastered .lesson-marker,
.lesson-state.state-mastered {
  border-color: var(--color-progress);
  background: var(--color-progress);
}
.lesson-title {
  flex: 1;
  min-width: 0;
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}
.lesson-state {
  font-size: var(--text-xs);
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  white-space: nowrap;
}
.preview-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-muted);
  border-left: 2px solid var(--color-attention);
  padding-left: 0.6rem;
}
.continue-block {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-left: 2px solid var(--color-primary);
  padding-left: 0.75rem;
}
.continue-progress,
.continue-pending {
  font-size: var(--text-xs);
  color: var(--color-muted);
}
.continue-link {
  display: inline-block;
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.9rem;
}
.continue-link:hover {
  text-decoration: underline;
}
.clear-btn {
  margin-left: 0.5rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.2rem 0.6rem;
  font-size: var(--text-xs);
  color: inherit;
  cursor: pointer;
}
.clear-btn:hover {
  border-color: var(--color-primary);
}
</style>
