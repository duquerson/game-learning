<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Question, QuizResult } from '@/types/app'
import { gradeQuiz } from '@/features/quiz/domain/grade-quiz'
import { nextLesson } from '@/features/learning-content/content'
import { withBase } from '@/lib/withBase'

const props = defineProps<{
  quiz: Question[]
  lessonId: string
}>()

const emit = defineEmits<{
  (e: 'completed', result: QuizResult): void
}>()

const OPTION_IDS = ['A', 'B', 'C', 'D'] as const

const currentIndex = ref(0)
const answers = ref<Record<string, string>>({})
const currentAnswer = ref<string | null>(null)
const submitted = ref(false)
const finished = ref(false)
const result = ref<QuizResult | null>(null)

const current = computed(() => props.quiz[currentIndex.value])
const questionNumber = computed(() => currentIndex.value + 1)

function selectOption(optionId: string) {
  if (submitted.value) return
  currentAnswer.value = optionId
}

function checkAnswer() {
  if (!currentAnswer.value) return
  answers.value = { ...answers.value, [current.value.id]: currentAnswer.value }
  submitted.value = true
}

function nextStep() {
  if (questionNumber.value >= props.quiz.length) {
    result.value = gradeQuiz(props.quiz, answers.value)
    finished.value = true
    emit('completed', result.value)
    return
  }
  currentIndex.value += 1
  currentAnswer.value = answers.value[current.value.id] ?? null
  submitted.value = false
}

function retry() {
  currentIndex.value = 0
  answers.value = {}
  currentAnswer.value = null
  submitted.value = false
  finished.value = false
  result.value = null
}

const isCorrectSelection = computed(
  () => submitted.value && currentAnswer.value === current.value.correctOptionId
)

const nextUp = computed(() => nextLesson(props.lessonId))
</script>

<template>
  <section aria-labelledby="quiz-heading" class="quiz">
    <template v-if="!finished">
      <h2 id="quiz-heading" class="quiz-heading">Comprueba tu comprensión</h2>
      <p class="quiz-progress" role="status">Pregunta {{ questionNumber }} de {{ quiz.length }}</p>

      <div class="stage">
        <fieldset class="question">
          <legend class="prompt">{{ current.prompt }}</legend>
          <label
            v-for="(option, i) in current.options"
            :key="OPTION_IDS[i]"
            class="option"
            :class="{
              selected: currentAnswer === OPTION_IDS[i],
              'reveal-correct': submitted && OPTION_IDS[i] === current.correctOptionId,
              'reveal-wrong': submitted && currentAnswer === OPTION_IDS[i] && OPTION_IDS[i] !== current.correctOptionId,
            }"
          >
            <input
              type="radio"
              :name="current.id"
              :value="OPTION_IDS[i]"
              :checked="currentAnswer === OPTION_IDS[i]"
              :disabled="submitted"
              class="sr-only"
              @change="selectOption(OPTION_IDS[i])"
            />
            <span class="option-letter" aria-hidden="true">{{ OPTION_IDS[i] }}</span>
            <span class="option-text">{{ option }}</span>
          </label>
        </fieldset>

        <div v-if="submitted" class="feedback" :class="isCorrectSelection ? 'ok' : 'ko'" role="status" aria-live="polite">
          <strong>{{ isCorrectSelection ? 'Correcta.' : currentAnswer ? 'Incorrecta.' : 'Sin responder.' }}</strong>
          {{ current.explanation }}
        </div>
      </div>
  </template>

  <template v-else-if="result">
    <div class="stage">
      <h2 id="quiz-heading" class="quiz-heading">Resultado del quiz</h2>
      <p class="score" :class="result.passed ? 'ok' : 'ko'" role="status">
        {{ result.correctCount }}/{{ result.total }} correctas.
        {{ result.passed ? '¡Lección dominada!' : 'Necesitas 4/5 para dominar. Puedes reintentar sin límite.' }}
      </p>
      <ul class="feedback-list">
        <li v-for="(line, i) in result.feedback" :key="i">{{ line }}</li>
      </ul>
    </div>
  </template>

  <div class="actions">
    <button
      v-if="!finished && !submitted"
      type="button"
      class="btn primary touch-target"
      :disabled="!currentAnswer"
      @click="checkAnswer"
    >
      Comprobar respuesta
    </button>
    <button v-else-if="!finished" type="button" class="btn primary touch-target" @click="nextStep">
      {{ questionNumber >= quiz.length ? 'Ver resultado' : 'Siguiente pregunta' }}
    </button>
    <template v-else>
      <button type="button" class="btn secondary touch-target" @click="retry">
        Reintentar quiz
      </button>
      <a v-if="result?.passed && nextUp" class="btn primary touch-target" :href="withBase(`/leccion/${nextUp.id}`)">
        Continuar: {{ nextUp.title }}
      </a>
      <a class="btn primary touch-target" :href="withBase('/')">Volver al mapa</a>
    </template>
  </div>
  </section>
</template>

<style scoped>
.quiz {
  margin-top: 2.5rem;
}
.quiz-heading {
  font-size: var(--text-h2);
  margin: 0 0 0.25rem;
}
.quiz-progress {
  margin: 0 0 1rem;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.question {
  border: none;
  margin: 0;
  padding: 0;
}
.stage {
  min-height: 24rem;
}
.prompt {
  font-weight: 700;
  font-size: var(--text-h3);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}
.option {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.option:hover {
  background: var(--color-surface);
}
.option.selected {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
}
.option.reveal-correct {
  border-color: var(--color-progress);
  background: color-mix(in srgb, var(--color-progress) 10%, transparent);
}
.option.reveal-wrong {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}
.option:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.option-letter {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.option-text {
  min-width: 0;
  font-size: var(--text-body);
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.feedback {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.5;
  border-left: 3px solid;
}
.feedback.ok {
  border-color: var(--color-progress);
  background: color-mix(in srgb, var(--color-progress) 8%, transparent);
}
.feedback.ko {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 6%, transparent);
}
.actions {
  margin-top: 1.25rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.4rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: filter 0.15s, transform 0.1s;
}
.btn:active:not(:disabled) {
  transform: scale(0.98);
}
.btn.primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
.btn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
}
.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.secondary {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-foreground);
}
.btn.secondary:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
}
.score {
  font-size: var(--text-h3);
  font-weight: 600;
}
.score.ok { color: var(--color-progress); }
.score.ko { color: var(--color-attention); }
.feedback-list {
  margin: 0 0 1rem;
  padding-left: 1.1rem;
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: 1.7;
}
</style>
