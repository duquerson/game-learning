<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useReviewStore } from '../../stores/review'

const store = useReviewStore()

// Fallback values from URL params (used when store has no session data)
const urlTotal = ref(0)
const urlCorrect = ref(0)
const urlPercentage = ref(0)
const urlPoints = ref(0)

const hasStoreData = computed(() => store.sessionResults.length > 0)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  urlTotal.value = Number(params.get('total')) || 0
  urlCorrect.value = Number(params.get('correct')) || 0
  urlPercentage.value = Number(params.get('percentage')) || 0
  urlPoints.value = Number(params.get('points')) || 0

  // Trigger confetti celebration when score ≥ 80%
  const score = hasStoreData.value
    ? (store.sessionResults.length > 0
        ? Math.round((store.sessionResults.filter(r => r.correct).length / store.sessionResults.length) * 100)
        : 0)
    : urlPercentage.value

  if (score >= 80) {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      const confetti = (await import('canvas-confetti')).default
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'],
      })
      // Second burst for extra celebration
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#7C3AED', '#EC4899', '#F59E0B'],
        })
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#10B981', '#06B6D4', '#C4B5FD'],
        })
      }, 250)
    }
  }
})

const total = computed(() =>
  hasStoreData.value ? store.sessionResults.length : urlTotal.value
)
const correct = computed(() =>
  hasStoreData.value ? store.sessionResults.filter(r => r.correct).length : urlCorrect.value
)
const incorrect = computed(() => total.value - correct.value)
const percentage = computed(() =>
  hasStoreData.value
    ? total.value > 0 ? Math.round((correct.value / total.value) * 100) : 0
    : urlPercentage.value
)
const points = computed(() =>
  hasStoreData.value ? store.sessionPoints : urlPoints.value
)
const newBadges = computed(() =>
  hasStoreData.value ? (store.sessionCompleteResult?.newBadges ?? []) : []
)

const performanceMessage = computed(() => {
  if (percentage.value >= 80) return '¡Excelente trabajo! 🎉'
  if (percentage.value >= 60) return '¡Buen progreso! 💪'
  return '¡Sigue practicando! 📚'
})

const scoreRingColor = computed(() => {
  if (percentage.value >= 80) return 'border-emerald-400'
  if (percentage.value >= 60) return 'border-amber-400'
  return 'border-red-400'
})

function reviewAgain() {
  if (hasStoreData.value && store.deck.length > 0) {
    store.initSession(store.deck, store.mode)
    window.location.href = `/review/${store.mode}`
  } else {
    window.location.href = '/review'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 w-full max-w-md text-center animate-fade-in-up">
      <h1 class="text-2xl font-bold text-white mb-6">Resultados del repaso</h1>

      <!-- Score circle -->
      <div
        class="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-4 border-4 bg-white/5 animate-fade-in-up"
        style="animation-delay: 100ms"
        :class="scoreRingColor"
      >
        <span class="text-4xl font-bold text-white">{{ percentage }}%</span>
      </div>

      <!-- Performance message -->
      <p class="text-xl font-semibold text-white mb-6 animate-fade-in-up" style="animation-delay: 200ms">{{ performanceMessage }}</p>

      <!-- Stats -->
      <div class="flex justify-center gap-8 mb-6 animate-fade-in-up" style="animation-delay: 300ms">
        <div class="flex flex-col items-center">
          <span class="text-2xl font-bold text-white">{{ total }}</span>
          <span class="text-xs text-white/60">Total</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-2xl font-bold text-emerald-400">{{ correct }}</span>
          <span class="text-xs text-white/60">Correctas</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-2xl font-bold text-red-400">{{ incorrect }}</span>
          <span class="text-xs text-white/60">Incorrectas</span>
        </div>
      </div>

      <!-- Points earned -->
      <div class="flex flex-col items-center mb-6 py-3 px-4 rounded-xl bg-amber-400/10 border border-amber-400/20 animate-fade-in-up" style="animation-delay: 400ms">
        <span class="text-3xl font-bold text-amber-400">+{{ points }}</span>
        <span class="text-sm text-white/60">puntos ganados</span>
      </div>

      <!-- New badges -->
      <div v-if="newBadges.length > 0" class="mb-6 animate-fade-in-up" style="animation-delay: 500ms">
        <h2 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Nuevas insignias</h2>
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="badge in newBadges"
            :key="badge.id"
            class="flex flex-col items-center gap-1 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          >
            <span class="text-2xl">{{ badge.icon }}</span>
            <span class="text-xs font-medium text-white">{{ badge.name }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3 animate-fade-in-up" style="animation-delay: 500ms">
        <button
          class="w-full py-3 px-6 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
          @click="reviewAgain"
        >
          Repasar de nuevo
        </button>
        <button
          class="w-full py-3 px-6 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
          @click="() => window.location.href = '/dashboard'"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  </div>
</template>
