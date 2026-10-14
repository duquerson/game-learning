<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Lesson, QuizResult } from '@/types/app'
import { formatExplanation, formatInlineMarkdown } from '@/features/learning-experience/format'
import { useLessonProgress } from '@/composables/useLessonProgress'
import QuizQuestion from './QuizQuestion.vue'

const props = defineProps<{
  lesson: Lesson
}>()

const { registerRead, registerQuizResult, isMastered } = useLessonProgress()

const explanationHtml = computed(() => formatExplanation(props.lesson.explanation))
const mastered = computed(() => isMastered(props.lesson.id))

onMounted(() => {
  // Dominar exige marcar lectura (design.md): se registra al abrir la lección.
  registerRead(props.lesson.id)
})

function onQuizCompleted(result: QuizResult) {
  registerQuizResult(props.lesson.id, result.correctCount)
}
</script>

<template>
  <article class="lesson">
    <header class="lesson-header">
      <p class="lesson-level">{{ lesson.level }}</p>
      <h1 class="lesson-title">{{ lesson.title }}</h1>
      <p class="lesson-objective">
        <strong>Objetivo:</strong> {{ lesson.objective }}
      </p>
      <p v-if="mastered" class="mastered-badge" role="status">Lección dominada</p>
    </header>

    <section aria-labelledby="explicacion" class="lesson-body prose-measure">
      <h2 id="explicacion">Explicación</h2>
      <div class="explanation" v-html="explanationHtml"></div>
    </section>

    <section v-if="lesson.examples.length" aria-labelledby="ejemplos" class="lesson-body prose-measure">
      <h2 id="ejemplos">Ejemplos</h2>
      <pre v-for="(example, i) in lesson.examples" :key="i" class="code-block"><code>{{ example }}</code></pre>
    </section>

    <QuizQuestion :quiz="lesson.quiz" :lesson-id="lesson.id" @completed="onQuizCompleted" />

    <section v-if="lesson.practices.length" aria-labelledby="practicas" class="lesson-body practices prose-measure">
      <h2 id="practicas">Práctica opcional</h2>
      <p class="practices-hint">Estos ejercicios no afectan tu dominio de la lección.</p>
      <ul>
        <li v-for="(practice, i) in lesson.practices" :key="i" v-html="formatInlineMarkdown(practice)"></li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.lesson-header {
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}
.lesson-level {
  margin: 0 0 0.35rem;
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}
.lesson-title {
  margin: 0 0 0.5rem;
  font-size: var(--text-h1);
  line-height: 1.15;
}
.lesson-objective {
  margin: 0;
  font-size: var(--text-body);
  color: var(--color-muted);
  line-height: 1.5;
}
.mastered-badge {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.2rem 0.7rem;
  border-radius: 99px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-progress);
  border: 1px solid var(--color-progress);
}
.lesson-body {
  margin-bottom: 2rem;
}
.lesson-body h2 {
  font-size: var(--text-h2);
  margin: 0 0 0.75rem;
}
.explanation :deep(p) {
  margin: 0 0 1rem;
  line-height: 1.65;
}
.explanation :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
  padding: 0.1em 0.35em;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.code-block {
  background: var(--color-slate-map);
  color: #E8EEF1;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: 0 0 1rem;
}
.practices-hint {
  margin: 0 0 0.5rem;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.practices ul {
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.7;
}
.practices :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
}
</style>
