<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useReviewStore } from '../../stores/review'
import { useReviewSession } from '../../composables/useReviewSession'
import { generateQuizOptions } from '../../lib/quiz'
import type { Card, ReviewMode, QuizOption } from '../../types/app'

const props = defineProps<{
  cards: Card[]
  mode: ReviewMode
}>()

const store = useReviewStore()
const { isFlipped, flipCard, handleAnswer: _handleAnswer } = useReviewSession()

onMounted(() => {
  store.initSession(props.cards, props.mode)
})

async function handleAnswer(correct: boolean) {
  const saved = await _handleAnswer(correct)
  if (!saved) return
  await store.nextCard()
}

// --- Quiz mode state ---
const quizOptions = ref<QuizOption[]>([])
const selectedOptionId = ref<string | null>(null)
const answered = ref(false)

const topicCards = computed(() => {
  if (!store.currentCard) return []
  return props.cards.filter(c => c.topic === store.currentCard!.topic)
})

watch(
  () => store.currentCard,
  (card) => {
    selectedOptionId.value = null
    answered.value = false
    if (card) {
      quizOptions.value = generateQuizOptions(card, topicCards.value, props.cards)
    } else {
      quizOptions.value = []
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
  setTimeout(() => {
    void store.nextCard()
  }, 1000)
}

function optionClass(option: QuizOption): string {
  if (!answered.value) {
    return 'border-white/20 bg-white/10 text-white hover:bg-white/20'
  }
  if (option.isCorrect) {
    return 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
  }
  if (option.id === selectedOptionId.value) {
    return 'border-red-500/50 bg-red-500/20 text-red-300'
  }
  return 'border-white/20 bg-white/10 text-white opacity-50'
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-6 flex flex-col gap-4">

    <!-- Loading overlay -->
    <div
      v-if="store.isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
    </div>

    <!-- Session finished (redirecting) -->
    <div
      v-if="store.isFinished"
      class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      <p class="text-white/70">Guardando resultados…</p>
    </div>

    <template v-else-if="store.currentCard">
      <!-- Progress -->
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-sm text-white/60">
          <span>Tarjeta {{ store.progress.current }} de {{ store.progress.total }}</span>
          <span class="capitalize">{{ mode }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full bg-violet-500 transition-all duration-300"
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
                <div
                  class="card-front rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur
                         flex flex-col items-center justify-center gap-4 text-center shadow-xl"
                >
                  <!-- Topic chip -->
                  <span class="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                    {{ store.currentCard.topic }}
                    <template v-if="store.currentCard.subtopic"> · {{ store.currentCard.subtopic }}</template>
                  </span>

                  <!-- Title / Question -->
                  <h2 class="text-2xl font-bold text-white leading-snug">
                    {{ store.currentCard.title }}
                  </h2>

                  <!-- Difficulty badge -->
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-emerald-500/20 text-emerald-300': store.currentCard.difficulty === 'easy',
                      'bg-amber-500/20 text-amber-300': store.currentCard.difficulty === 'medium',
                      'bg-red-500/20 text-red-300': store.currentCard.difficulty === 'hard',
                    }"
                  >
                    {{ store.currentCard.difficulty }}
                  </span>
                </div>

                <!-- Back face: answer -->
                <div
                  class="card-back rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur
                         flex flex-col items-center justify-center gap-4 text-center shadow-xl"
                >
                  <!-- Topic chip -->
                  <span class="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                    {{ store.currentCard.topic }}
                    <template v-if="store.currentCard.subtopic"> · {{ store.currentCard.subtopic }}</template>
                  </span>

                  <!-- Title -->
                  <h2 class="text-lg font-bold text-white/70 leading-snug">
                    {{ store.currentCard.title }}
                  </h2>

                  <!-- Answer content -->
                  <div class="rounded-xl border border-white/10 bg-white/5 p-4 text-left text-white/90 text-sm leading-relaxed w-full">
                    {{ store.currentCard.content }}
                  </div>

                  <!-- Difficulty badge -->
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-emerald-500/20 text-emerald-300': store.currentCard.difficulty === 'easy',
                      'bg-amber-500/20 text-amber-300': store.currentCard.difficulty === 'medium',
                      'bg-red-500/20 text-red-300': store.currentCard.difficulty === 'hard',
                    }"
                  >
                    {{ store.currentCard.difficulty }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3">
              <!-- Before flip: show "Ver respuesta" -->
              <button
                v-if="!isFlipped"
                class="w-full rounded-xl border border-white/20 bg-white/10 py-3 font-semibold text-white
                       backdrop-blur transition hover:bg-white/20 active:scale-95"
                :disabled="store.isLoading"
                @click="flipCard"
              >
                Ver respuesta
              </button>

              <!-- After flip: show answer buttons -->
              <template v-else>
                <div class="flex gap-3">
                  <button
                    class="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3 font-semibold text-red-300
                           backdrop-blur transition hover:bg-red-500/20 active:scale-95"
                    :disabled="store.isLoading"
                    @click="handleAnswer(false)"
                  >
                    ✗ No lo sabía
                  </button>
                  <button
                    class="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 font-semibold text-emerald-300
                           backdrop-blur transition hover:bg-emerald-500/20 active:scale-95"
                    :disabled="store.isLoading"
                    @click="handleAnswer(true)"
                  >
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
        <!-- Progress label -->
        <p class="text-center text-sm text-white/60">
          Pregunta {{ store.progress.current }} de {{ store.progress.total }}
        </p>

        <!-- Slide transition keyed by currentIndex -->
        <Transition name="slide-card" mode="out-in">
          <div :key="store.currentIndex" class="flex flex-col gap-3">
            <!-- Card -->
            <div
              class="relative min-h-[30vh] rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur
                     flex flex-col items-center justify-center gap-4 text-center shadow-xl"
            >
              <!-- Topic chip -->
              <span class="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                {{ store.currentCard.topic }}
                <template v-if="store.currentCard.subtopic"> · {{ store.currentCard.subtopic }}</template>
              </span>

              <!-- Question -->
              <h2 class="text-2xl font-bold text-white leading-snug">
                {{ store.currentCard.title }}
              </h2>

              <!-- Difficulty badge -->
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="{
                  'bg-emerald-500/20 text-emerald-300': store.currentCard.difficulty === 'easy',
                  'bg-amber-500/20 text-amber-300': store.currentCard.difficulty === 'medium',
                  'bg-red-500/20 text-red-300': store.currentCard.difficulty === 'hard',
                }"
              >
                {{ store.currentCard.difficulty }}
              </span>
            </div>

            <!-- Options -->
            <div class="flex flex-col gap-3">
              <button
                v-for="option in quizOptions"
                :key="option.id"
                class="w-full rounded-xl border py-3 px-4 font-semibold backdrop-blur transition active:scale-95 text-left"
                :class="optionClass(option)"
                :disabled="answered || store.isLoading"
                @click="selectOption(option)"
              >
                {{ option.title }}
              </button>
            </div>
          </div>
        </Transition>
      </template>
    </template>

    <!-- No cards fallback -->
    <div
      v-else
      class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
    >
      <p class="text-white/60">No hay tarjetas disponibles.</p>
      <a
        href="/library"
        class="rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white
               backdrop-blur transition hover:bg-white/20"
      >
        Ir a la biblioteca
      </a>
    </div>

  </div>
</template>

<style scoped>
/* ── 3D Flip Card ─────────────────────────────────────────── */
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

.card-front,
.card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

/* ── Slide transition between cards ──────────────────────── */
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
