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

/** Navega a /results pasando los datos de la sesión como query params (fallback para refresh). */
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

const topicCards = computed(() => {
  if (!store.currentCard) return []
  return props.cards.filter(c => c.topic === store.currentCard!.topic)
})

watch(
  () => store.currentCard,
  (card) => {
    selectedOptionId.value = null
    answered.value = false
    currentCardContent.value = ''
    if (card) {
      quizOptions.value = generateQuizOptions(card, topicCards.value, props.cards)
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
  if (!answered.value) return 'quiz-option--default'
  if (option.isCorrect) return 'quiz-option--correct'
  if (option.id === selectedOptionId.value) return 'quiz-option--wrong'
  return 'quiz-option--muted'
}
</script>

<template>
  <div class="review-wrapper">

    <!-- Loading overlay -->
    <div v-if="store.isLoading" class="loading-overlay">
      <div class="spinner" />
    </div>

    <!-- Session finished (redirecting) -->
    <div v-if="store.isFinished" class="finished-state">
      <div class="spinner" />
      <p>Guardando resultados…</p>
    </div>

    <template v-else-if="store.currentCard">
      <!-- Progress -->
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-sm" style="color: var(--color-text-secondary)">
          <span>Tarjeta {{ store.progress.current }} de {{ store.progress.total }}</span>
          <span class="flex items-center gap-2">
            <span class="timer" :class="{ 'timer--warn': timer <= 10, 'timer--danger': timer <= 5 }">
              ⏱ {{ timer }}s
            </span>
            <span>{{ MODE_LABELS[mode] }}</span>
          </span>
        </div>
        <div class="h-2 overflow-hidden rounded-full" style="background: var(--glass-border)">
          <div
            class="h-full rounded-full transition-all duration-300"
            style="background: var(--color-primary)"
            :style="{ width: `${(store.progress.current / store.progress.total) * 100}%` }"
          />
        </div>
      </div>

      <!-- Self-Assessment mode -->
      <template v-if="mode === 'self-assessment'">
        <!-- Slide transition keyed by currentIndex -->
        <Transition name="slide-card" mode="out-in">
          <div :key="store.currentIndex" class="flex flex-col gap-4">
            <!-- 3D Flip Card -->
            <div class="card-scene min-h-[55vh]">
              <div class="card-3d" :class="{ 'is-flipped': isFlipped }">
                <!-- Front face: question -->
                <div class="card-face card-front">
                  <!-- Topic chip -->
                  <span class="topic-chip">
                    {{ store.currentCard.topic }}
                    <template v-if="store.currentCard.subtopic"> · {{ store.currentCard.subtopic }}</template>
                  </span>
                  <h2 class="card-title">{{ store.currentCard.title }}</h2>
                  <span class="difficulty-badge" :class="`difficulty-${store.currentCard.difficulty}`">
                    {{ store.currentCard.difficulty }}
                  </span>
                </div>

                <!-- Back face: answer -->
                <div class="card-face card-back">
                  <span class="topic-chip">
                    {{ store.currentCard.topic }}
                    <template v-if="store.currentCard.subtopic"> · {{ store.currentCard.subtopic }}</template>
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
                class="flip-btn"
                :disabled="store.isLoading"
                @click="flipCard"
              >
                Ver respuesta
              </button>
              <template v-else>
                <div class="flex gap-3">
                  <button class="answer-btn answer-btn--wrong" :disabled="store.isLoading" @click="handleAnswer(false)">
                    ✗ No lo sabía
                  </button>
                  <button class="answer-btn answer-btn--correct" :disabled="store.isLoading" @click="handleAnswer(true)">
                    ✓ Lo sabía
                  </button>
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </template>

      <!-- Quiz mode -->
      <template v-else>
        <p class="text-center text-sm" style="color: var(--color-text-secondary)">
          Pregunta {{ store.progress.current }} de {{ store.progress.total }}
        </p>

        <Transition name="slide-card" mode="out-in">
          <div :key="store.currentIndex" class="flex flex-col gap-3">
            <!-- Card -->
            <div class="quiz-card">
              <span class="topic-chip">
                {{ store.currentCard.topic }}
                <template v-if="store.currentCard.subtopic"> · {{ store.currentCard.subtopic }}</template>
              </span>
              <h2 class="card-title">{{ store.currentCard.title }}</h2>
              <span class="difficulty-badge" :class="`difficulty-${store.currentCard.difficulty}`">
                {{ store.currentCard.difficulty }}
              </span>
            </div>

            <!-- Options -->
            <div class="flex flex-col gap-3">
              <button
                v-for="option in quizOptions"
                :key="option.id"
                class="quiz-option"
                :class="optionClass(option)"
                :disabled="answered || store.isLoading"
                @click="selectOption(option)"
              >
                {{ option.title }}
              </button>
            </div>

            <!-- Explanation (shown after answering) -->
            <div v-if="answered && currentCardContent" class="explanation-box">
              <p class="explanation-label">Explicación</p>
              <p class="explanation-text">{{ currentCardContent }}</p>
            </div>
          </div>
        </Transition>
      </template>
    </template>

    <!-- No cards fallback -->
    <div v-else class="empty-fallback">
      <p style="color: var(--color-text-secondary)">No hay tarjetas disponibles.</p>
      <a href="/library" class="empty-link">Ir a la biblioteca</a>
    </div>

  </div>
</template>

<style scoped>
/* ── Wrapper ────────────────────────────────────────────── */
.review-wrapper {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Loading overlay ────────────────────────────────────── */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid var(--glass-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Finished state ─────────────────────────────────────── */
.finished-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

/* ── Card face shared ───────────────────────────────────── */
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

/* ── Flip button ────────────────────────────────────────── */
.flip-btn {
  width: 100%;
  padding: 0.875rem;
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flip-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.flip-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Answer buttons ─────────────────────────────────────── */
.answer-btn {
  flex: 1;
  padding: 0.875rem;
  border-radius: var(--radius-btn);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.answer-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

/* ── Quiz card ──────────────────────────────────────────── */
.quiz-card {
  min-height: 30vh;
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
}

/* ── Quiz options ───────────────────────────────────────── */
.quiz-option {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.quiz-option:disabled { cursor: not-allowed; }

.quiz-option--default {
  background: var(--glass-bg);
  color: var(--color-text-primary);
}

.quiz-option--default:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.quiz-option--correct {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
  color: var(--color-success);
}

.quiz-option--wrong {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  color: var(--color-error);
}

.quiz-option--muted {
  background: var(--glass-bg);
  color: var(--color-text-secondary);
  opacity: 0.5;
}

/* ── Empty fallback ─────────────────────────────────────── */
.empty-fallback {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}

.empty-link {
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.empty-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

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

/* ── Timer ───────────────────────────────────────────────── */
.timer {
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: var(--glass-bg);
  color: var(--color-text-secondary);
  transition: color 0.3s, background 0.3s;
}
.timer--warn {
  color: var(--color-accent);
  background: rgba(245,158,11,0.12);
}
.timer--danger {
  color: var(--color-error);
  background: rgba(239,68,68,0.12);
  animation: pulse 0.5s ease-in-out infinite alternate;
}
@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

/* ── Explanation box ─────────────────────────────────────── */
.explanation-box {
  padding: 1rem;
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
  background: rgba(124,58,237,0.06);
}
.explanation-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}
.explanation-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  white-space: pre-wrap;
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
