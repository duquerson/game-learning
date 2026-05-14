<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useReviewStore } from '../../stores/review'
import { useReviewSession } from '../../composables/useReviewSession'
import { mapCardToFlashcard } from '../../lib/flashcard-mapper'
import MarkdownRenderer from '../ui/MarkdownRenderer.vue'
import ConfidenceSelector from './ConfidenceSelector.vue'
import NavigationControls from './NavigationControls.vue'
import QuizQuestion from './QuizQuestion.vue'
import type { Card, ReviewMode, Flashcard } from '../../types/app'

const props = defineProps<{
  cards: Card[]
  mode: ReviewMode
}>()

const store = useReviewStore()
const { isFlipped, flipCard, handleAnswer: _handleAnswer } = useReviewSession()

// Inicialización inmediata para evitar parpadeos e hidratación
store.initSession(props.cards, props.mode)

const currentFlashcard = computed<Flashcard | null>(() => {
  if (!store.currentCard) return null
  return mapCardToFlashcard(store.currentCard)
})

// UI State (mainly for self-assessment)
const evaluated = ref(false)

// Reset state when card changes
watch(() => store.currentIndex, () => {
  isFlipped.value = false
  evaluated.value = false
})

const handleConfidence = async (confidence: number) => {
  const correct = confidence > 0
  const success = await store.submitAnswer(
    store.currentCard!.id,
    correct,
    store.currentCard!.difficulty,
    confidence
  )
  if (success) {
    evaluated.value = true
  }
}

// Mapping for QuizQuestion component
const mappedQuestions = computed(() => {
  return props.cards.map(card => ({
    id: card.id,
    text: card.title, // UX spec: Title is the question
    difficulty: card.difficulty,
    explanation: card.content,
    options: card.options.map(opt => ({
      id: opt.id,
      label: opt.id as 'A' | 'B' | 'C' | 'D',
      text: opt.text,
      isCorrect: opt.id === card.correctAnswer
    }))
  }))
})

const handleQuizAnswer = async (answer: any) => {
  await store.submitAnswer(
    answer.questionId,
    answer.isCorrect,
    props.cards.find(c => c.id === answer.questionId)!.difficulty
  )
}

const navigateToResults = () => {
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

const handleQuizFinished = async (payload: { answers: any[] }) => {
  const success = await store.completeSession()
  if (success) {
    navigateToResults()
  }
}

// Navigation helpers
const goPrev = () => store.prevCard()
const goNext = async () => {
  const { done } = await store.nextCard()
  if (done) navigateToResults()
}

// Keyboard support
const handleKeydown = (e: KeyboardEvent) => {
  if (store.isLoading) return

  if (props.mode === 'self-assessment') {
    if (e.code === 'ArrowLeft') {
      goPrev()
    } else if (e.code === 'ArrowRight') {
      goNext()
    } else if (e.code === 'Space') {
      e.preventDefault()
      if (!isFlipped.value) flipCard()
    } else if (isFlipped.value) {
      if (e.key === '1') handleConfidence(0)
      if (e.key === '2') handleConfidence(1)
      if (e.key === '3') handleConfidence(2)
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="review-session mx-auto max-w-2xl">
    <!-- Loading overlay -->
    <div v-if="store.isLoading && !store.currentCard" class="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div class="spinner" />
      <p class="animate-pulse text-[--color-text-secondary]">Preparando contenido...</p>
    </div>

    <!-- Finalizing Session -->
    <div v-else-if="store.isFinished" class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-[--color-text-secondary]">
      <div class="spinner" />
      <p>Finalizando sesión...</p>
    </div>

    <div v-else-if="props.mode === 'quiz'">
      <!-- Quiz Mode uses the dedicated QuizQuestion component -->
      <QuizQuestion 
        :questions="mappedQuestions"
        :topic-label="cards[0]?.topic || 'GENERAL'"
        @answer-submitted="handleQuizAnswer"
        @quiz-finished="handleQuizFinished"
      />
    </div>

    <div v-else-if="currentFlashcard" class="flex flex-col gap-6 px-4 py-6 sm:py-8">
      <!-- Header / Progress (Self-assessment only) -->
      <header class="flex flex-col gap-3">
        <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[--color-text-muted]">
          <span class="flex items-center gap-2">
            <span class="h-1 w-1 rounded-full bg-[--color-primary] shadow-[0_0_6px_var(--color-primary)]"></span>
            {{ currentFlashcard.category }}
          </span>
          <span>{{ store.progress.current }} / {{ store.progress.total }}</span>
        </div>
        
        <div class="h-1 overflow-hidden rounded-full bg-[--glass-border]">
          <div class="h-full rounded-full bg-gradient-to-r from-[--color-primary] to-[--color-accent] shadow-[0_0_8px_rgba(124,58,237,0.3)] transition-all duration-500 ease-out"
            :style="{ width: `${(store.progress.current / store.progress.total) * 100}%` }" />
        </div>
      </header>

      <!-- Main Interaction Area (Self-assessment only) -->
      <main class="relative min-h-[65vh]">
        <div class="flex flex-col gap-6">
          <!-- 3D Flip Card -->
          <div 
            class="card-scene" 
            :class="{ 'is-flipped': isFlipped }"
            @click="!isFlipped && flipCard()"
          >
            <div class="card-3d">
              <!-- Front Face -->
              <div class="card-face card-front glass">
                <div class="flex h-full flex-col p-8">
                  <div class="flex-1 flex flex-col justify-center text-center">
                    <h2 class="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                      <MarkdownRenderer :content="currentFlashcard.front.question" />
                    </h2>
                    <p v-if="currentFlashcard.front.hint" class="mt-6 text-sm text-[--color-text-muted] italic">
                      💡 Pista: {{ currentFlashcard.front.hint }}
                    </p>
                  </div>
                  <div class="mt-auto text-center">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-[--color-text-muted] animate-pulse">
                      Tap para voltear
                    </span>
                  </div>
                </div>
              </div>

              <!-- Back Face -->
              <div class="card-face card-back glass">
                <div class="flex h-full flex-col overflow-y-auto p-6 sm:p-8">
                  <div class="mb-6 border-b border-[--glass-border] pb-4 text-center">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-[--color-accent]">Respuesta</span>
                    <h3 class="mt-1 text-xl font-bold text-[--color-primary]">
                      <MarkdownRenderer :content="currentFlashcard.back.answer" inline />
                    </h3>
                  </div>
                  <div class="flex-1 space-y-4 text-sm leading-relaxed text-[--color-text-secondary]">
                    <MarkdownRenderer :content="currentFlashcard.back.explanation || ''" />
                  </div>
                  <div class="mt-6 flex items-center justify-between pt-4 border-t border-[--glass-border]">
                    <span class="difficulty-badge" :class="`difficulty-${currentFlashcard.difficulty}`">
                      {{ currentFlashcard.difficulty }}
                    </span>
                    <span class="text-[10px] text-[--color-text-muted] uppercase font-bold tracking-tighter">
                      Spaced Repetition
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Area: Confidence Evaluation -->
          <div v-if="isFlipped" class="animate-fade-in">
            <div v-if="!evaluated" class="space-y-4">
              <p class="text-center text-sm font-medium text-[--color-text-secondary]">¿Qué tan bien lo sabías?</p>
              <ConfidenceSelector :disabled="store.isLoading" @select="handleConfidence" />
            </div>
            <div v-else class="text-center p-4 rounded-xl bg-[--color-primary]/10 border border-[--color-primary]/20 animate-scale-in">
              <p class="text-sm font-semibold text-[--color-primary]">✓ Autoevaluación registrada</p>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer Navigation (Self-assessment only) -->
      <footer class="mt-auto opacity-70 transition-opacity hover:opacity-100">
        <NavigationControls 
          :has-prev="store.currentIndex > 0"
          :has-next="store.currentIndex < store.deck.length - 1"
          :is-last="store.currentIndex === store.deck.length - 1"
          :loading="store.isLoading"
          @prev="goPrev"
          @next="goNext"
        />
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* ── 3D Card Scene ────────────────────────────────────────── */
.card-scene {
  perspective: 2000px;
  width: 100%;
  height: 100%;
}

.card-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 55vh;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.is-flipped .card-3d {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--glass-border);
}

.card-front {
  z-index: 2;
  background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.05), transparent),
              var(--glass-bg);
}

.card-back {
  transform: rotateY(180deg);
  background: radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.08), transparent),
              var(--glass-bg);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid var(--glass-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 8px var(--color-primary));
}

@keyframes spin { to { transform: rotate(360deg); } }

.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

@media (max-width: 640px) {
  .card-3d { min-height: 50vh; }
}
</style>
