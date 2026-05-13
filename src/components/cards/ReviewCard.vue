<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from 'vue'
import { useReviewStore } from '../../stores/review'
import { useReviewSession } from '../../composables/useReviewSession'
import { generateQuizOptions } from '../../lib/quiz'
import type { Card, ReviewMode, QuizOption } from '../../types/app'

const MODE_LABELS: Record<ReviewMode, string> = {
  'self-assessment': 'Autoevaluación',
  'quiz': 'Quiz',
}

const props = defineProps<{
  cards: Card[]
  mode: ReviewMode
}>()

const store = useReviewStore()
const { isFlipped, flipCard, handleAnswer: _handleAnswer } = useReviewSession()

function navigateToResults() {
  const total = store.sessionResults.length
  const correct = store.sessionResults.filter(r => r.correct).length
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  const points = store.sessionPoints
  const params = new URLSearchParams({
    total: String(total),
    correct: String(correct),
    percentage: String(percentage),
    points: String(points),
  })
  window.location.href = `/results?${params.toString()}`
}

onMounted(() => {
  store.initSession(props.cards, props.mode)
})

async function handleAnswer(correct: boolean) {
  const saved = await _handleAnswer(correct)
  if (!saved) return
  const { done, success } = await store.nextCard()
  if (done && success && typeof window !== 'undefined') {
    navigateToResults()
  }
}

// --- Timer ---
const TIMER_DURATION = 30
const timer = ref(TIMER_DURATION)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)

function startTimer() {
  stopTimer()
  timer.value = TIMER_DURATION
  timerInterval.value = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      stopTimer()
      handleTimerExpiry()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function handleTimerExpiry() {
  if (mode === 'self-assessment') {
    if (!isFlipped.value) {
      flipCard()
      setTimeout(() => handleAnswer(false), 300)
    }
  } else if (mode === 'quiz') {
    if (!answered.value && quizOptions.value.length > 0) {
      const correct = quizOptions.value.find(o => o.isCorrect)
      if (correct) {
        selectOption(correct)
      }
    }
  }
}

onUnmounted(() => stopTimer())

// --- Quiz mode state ---
const quizOptions = ref<QuizOption[]>([])
const selectedOptionId = ref<string | null>(null)
const answered = ref(false)
const currentCardContent = ref('')

watch(
  () => store.currentCard,
  (card) => {
    selectedOptionId.value = null
    answered.value = false
    currentCardContent.value = ''
    if (card) {
      quizOptions.value = generateQuizOptions(card)
      currentCardContent.value = card.content
      startTimer()
    } else {
      quizOptions.value = []
      stopTimer()
    }
  },
  { immediate: true }
)

async function selectOption(option: QuizOption) {
  if (answered.value || !store.currentCard) return
  selectedOptionId.value = option.id
  answered.value = true
  const saved = await store.submitAnswer(store.currentCard.id, option.isCorrect, store.currentCard.difficulty)
  if (!saved) {
    selectedOptionId.value = null
    answered.value = false
    return
  }
  setTimeout(async () => {
    const { done, success } = await store.nextCard()
    if (done && success && typeof window !== 'undefined') {
      navigateToResults()
    }
  }, 1000)
}

function optionClass(option: QuizOption): string {
  if (!answered.value) return 'glass text-[--color-text-primary] hover:bg-white/12'
  if (option.isCorrect) return 'border-[--color-success]/40 bg-[--color-success]/15 text-[--color-success]'
  if (option.id === selectedOptionId.value) return 'border-[--color-error]/40 bg-[--color-error]/15 text-[--color-error]'
  return 'glass text-[--color-text-secondary] opacity-50'
}
</script>

<template>
  <div class="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">

    <!-- Loading skeleton -->
    <div v-if="store.isLoading" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <span class="skeleton-pulse h-4 w-24 rounded" />
          <span class="skeleton-pulse h-4 w-20 rounded" />
        </div>
        <div class="skeleton-pulse h-2 rounded-full" />
      </div>
      <div class="skeleton-pulse flex min-h-[55vh] items-center justify-center rounded-[--radius-card]">
        <div class="flex flex-col items-center gap-3">
          <span class="skeleton-pulse h-4 w-20 rounded-full" />
          <span class="skeleton-pulse h-6 w-48 rounded" />
          <span class="skeleton-pulse h-4 w-16 rounded-full" />
        </div>
      </div>
      <div class="skeleton-pulse h-12 w-full rounded-[--radius-btn]" />
    </div>

    <!-- Session finished (redirecting) -->
    <div v-else-if="store.isFinished" class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-[--color-text-secondary]">
      <div class="spinner" />
      <p>Guardando resultados…</p>
    </div>

    <template v-else-if="store.currentCard">
      <!-- Progress -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between text-sm text-[--color-text-secondary]">
          <span>Tarjeta {{ store.progress.current }} de {{ store.progress.total }}</span>
          <span class="flex items-center gap-2">
            <!-- Timer countdown ring -->
            <span class="relative inline-flex items-center gap-1.5">
              <svg class="h-5 w-5 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"
                  class="text-[--glass-border]" />
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"
                  :class="timer <= 5 ? 'text-[--color-error]' : timer <= 10 ? 'text-[--color-accent]' : 'text-[--color-primary]'"
                  :stroke-dasharray="2 * Math.PI * 8"
                  :stroke-dashoffset="2 * Math.PI * 8 * (1 - timer / TIMER_DURATION)"
                  class="transition-all duration-1000 ease-linear" />
              </svg>
              <span class="text-xs font-semibold tabular-nums"
                :class="timer <= 5 ? 'text-[--color-error] animate-pulse' : timer <= 10 ? 'text-[--color-accent]' : 'text-[--color-text-secondary]'">
                {{ timer }}s
              </span>
            </span>
            <span>{{ MODE_LABELS[mode] }}</span>
          </span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-[--glass-border]">
          <div class="h-full rounded-full bg-[--color-primary] transition-all duration-300"
            :style="{ width: `${(store.progress.current / store.progress.total) * 100}%` }" />
        </div>
      </div>

      <!-- Self-Assessment mode -->
      <template v-if="mode === 'self-assessment'">
        <Transition name="slide-card" mode="out-in">
          <div :key="store.currentIndex" class="flex flex-col gap-4">
            <!-- 3D Flip Card -->
            <div class="card-scene min-h-[55vh]">
              <div class="card-3d" :class="{ 'is-flipped': isFlipped }">
                <!-- Front face -->
                <div class="card-face card-front">
                  <span class="topic-chip">
                    {{ store.currentCard.topic }}
                    <template v-if="store.currentCard.subtopic"><span aria-hidden="true"> · </span>{{ store.currentCard.subtopic }}</template>
                  </span>
                  <h2 class="card-title">{{ store.currentCard.title }}</h2>
                  <span class="difficulty-badge" :class="`difficulty-${store.currentCard.difficulty}`">
                    {{ store.currentCard.difficulty }}
                  </span>
                </div>
                <!-- Back face -->
                <div class="card-face card-back">
                  <span class="topic-chip">
                    {{ store.currentCard.topic }}
                    <template v-if="store.currentCard.subtopic"><span aria-hidden="true"> · </span>{{ store.currentCard.subtopic }}</template>
                  </span>
                  <h2 class="card-title card-title--muted">{{ store.currentCard.title }}</h2>
                  <div class="card-content-box">{{ store.currentCard.content }}</div>
                  <span class="difficulty-badge" :class="`difficulty-${store.currentCard.difficulty}`">
                    {{ store.currentCard.difficulty }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3">
              <button
                v-if="!isFlipped"
                class="touch-target btn-tactile glass flex w-full items-center justify-center gap-2 rounded-[--radius-btn] px-4 py-3 text-sm font-semibold text-[--color-text-primary] disabled:opacity-50"
                :disabled="store.isLoading"
                @click="flipCard"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Ver respuesta
              </button>
              <template v-else>
                <div class="flex flex-col gap-3 sm:flex-row">
                  <button
                    class="touch-target btn-tactile flex flex-1 items-center justify-center gap-2 rounded-[--radius-btn] border px-4 py-3 text-sm font-semibold disabled:opacity-50 answer-btn--wrong"
                    :disabled="store.isLoading"
                    @click="handleAnswer(false)"
                  >
                    <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    No lo sabía
                  </button>
                  <button
                    class="touch-target btn-tactile flex flex-1 items-center justify-center gap-2 rounded-[--radius-btn] border px-4 py-3 text-sm font-semibold disabled:opacity-50 answer-btn--correct"
                    :disabled="store.isLoading"
                    @click="handleAnswer(true)"
                  >
                    <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Lo sabía
                  </button>
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </template>

      <!-- Quiz mode -->
      <template v-else>
        <p class="text-center text-sm text-[--color-text-secondary]">
          Pregunta {{ store.progress.current }} de {{ store.progress.total }}
        </p>

        <Transition name="slide-card" mode="out-in">
          <div :key="store.currentIndex" class="flex flex-col gap-3 animate-fade-in">
            <!-- Card -->
            <div class="glass flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-[--radius-card] p-6 text-center">
              <span class="topic-chip">
                {{ store.currentCard.topic }}
                <template v-if="store.currentCard.subtopic"><span aria-hidden="true"> · </span>{{ store.currentCard.subtopic }}</template>
              </span>
              <h2 class="card-title font-heading text-lg leading-snug tracking-tight">{{ store.currentCard.question }}</h2>
              <span class="difficulty-badge" :class="`difficulty-${store.currentCard.difficulty}`">
                {{ store.currentCard.difficulty }}
              </span>
            </div>

            <!-- Options -->
            <div class="flex flex-col gap-3">
              <button
                v-for="(option, idx) in quizOptions"
                :key="option.id"
                class="touch-target btn-tactile flex w-full items-center gap-3 rounded-[--radius-btn] border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                :class="[optionClass(option), answered ? 'scale-in' : '']"
                :disabled="answered || store.isLoading"
                @click="selectOption(option)"
              >
                <!-- Indicator: letter or result icon -->
                <span v-if="answered && option.isCorrect" class="inline-flex shrink-0 items-center justify-center">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="16 8 10 16 7 13" />
                  </svg>
                </span>
                <span v-else-if="answered && option.id === selectedOptionId" class="inline-flex shrink-0 items-center justify-center">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </span>
                <span v-else class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[--glass-border] bg-white/5 text-xs text-[--color-text-muted]">
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <span class="flex-1">{{ option.title }}</span>
              </button>
            </div>

            <!-- Explanation -->
            <div v-if="answered && currentCardContent"
              class="animate-fade-in rounded-[--radius-btn] border border-[--glass-border] p-4"
              style="background: rgba(124, 58, 237, 0.06)"
            >
              <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[--color-primary]">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Explicación
              </p>
              <p class="whitespace-pre-wrap text-sm leading-relaxed text-[--color-text-primary]">{{ currentCardContent }}</p>
            </div>
          </div>
        </Transition>
      </template>
    </template>

    <!-- Empty fallback -->
    <div v-else class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <svg class="h-12 w-12 text-[--color-text-muted]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      <p class="text-[--color-text-secondary]">No hay tarjetas disponibles.</p>
      <a href="/library" class="touch-target glass rounded-[--radius-btn] px-6 py-2.5 text-sm font-semibold text-[--color-text-primary] no-underline transition-all hover:bg-white/10">Ir a la biblioteca</a>
    </div>

  </div>
</template>

<style scoped>
/* ── Spinner ────────────────────────────────────────────── */
.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid var(--glass-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── 3D Flip Card ───────────────────────────────────────── */
.card-scene {
  perspective: 1000px;
  width: 100%;
}
.card-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 55vh;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}
.card-3d.is-flipped {
  transform: rotateY(180deg);
}
.card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-card);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}

/* ── Topic chip ─────────────────────────────────────────── */
.topic-chip {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}

/* ── Card title ─────────────────────────────────────────── */
.card-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}
@media (min-width: 480px) {
  .card-title { font-size: 1.625rem; }
}
.card-title--muted {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

/* ── Content box (back face) ────────────────────────────── */
.card-content-box {
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  line-height: 1.6;
  text-align: left;
}

/* ── Difficulty badge ───────────────────────────────────── */
.difficulty-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}
.difficulty-easy   { background: rgba(16,185,129,0.15); color: var(--color-success); }
.difficulty-medium { background: rgba(245,158,11,0.15);  color: var(--color-accent); }
.difficulty-hard   { background: rgba(239,68,68,0.15);   color: var(--color-error); }

/* ── Answer buttons (self-assessment) ───────────────────── */
.answer-btn--wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--color-error);
}
.answer-btn--wrong:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.18);
}
.answer-btn--correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--color-success);
}
.answer-btn--correct:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.18);
}

/* ── Scale-in feedback animation ────────────────────────── */
.scale-in {
  animation: scaleFeedback 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleFeedback {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

/* ── Slide transition ───────────────────────────────────── */
.slide-card-enter-active,
.slide-card-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-card-enter-from {
  transform: translateX(60px);
  opacity: 0;
}
.slide-card-leave-to {
  transform: translateX(-60px);
  opacity: 0;
}
</style>
