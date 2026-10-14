<script setup lang="ts">
import { computed } from 'vue'
import type { LevelId } from '@/types/app'
import { levels, lessonsByLevel } from '@/features/learning-content/content'
import { useLessonProgress } from '@/composables/useLessonProgress'

defineProps<{
  currentLessonId?: string
}>()

const { isMastered, isRead, stateOf } = useLessonProgress()

const totalLessons = computed(() => levels.reduce((acc, l) => acc + lessonsByLevel(l.id).length, 0))
const masteredCount = computed(() =>
  levels.flatMap((l) => lessonsByLevel(l.id)).filter((les) => isMastered(les.id)).length
)

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
    <div class="map-summary" role="status">
      <span class="summary-count">{{ masteredCount }}/{{ totalLessons }} dominadas</span>
      <div class="summary-bar" aria-hidden="true">
        <div
          class="summary-fill"
          :style="{ transform: `scaleX(${masteredCount / totalLessons})` }"
        ></div>
      </div>
    </div>

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
      Tu progreso es efímero: se reinicia al cerrar la pestaña.
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
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.summary-count {
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: 600;
}
.summary-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}
.summary-fill {
  height: 100%;
  width: 100%;
  background: var(--color-progress);
  border-radius: 99px;
  transform-origin: left center;
  transition: transform 0.3s ease;
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
</style>
