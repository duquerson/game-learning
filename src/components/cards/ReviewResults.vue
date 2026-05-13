<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useReviewStore } from '../../stores/review'

const store = useReviewStore()

// Fallback desde URL params cuando el store se reinicia (ej. refresh de página)
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

  const score = hasStoreData.value
    ? total.value > 0 ? Math.round((correct.value / total.value) * 100) : 0
    : urlPercentage.value

  if (score >= 80) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      const confetti = (await import('canvas-confetti')).default
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 } })
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 } })
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
  <div class="results-page">
    <div class="results-card animate-fade-in-up">

      <h1 class="results-title">Resultados del repaso</h1>

      <!-- Score ring -->
      <div
        class="score-ring"
        :class="{
          'score-ring--great': percentage >= 80,
          'score-ring--good': percentage >= 60 && percentage < 80,
          'score-ring--low': percentage < 60,
        }"
      >
        <span class="score-value">{{ percentage }}%</span>
      </div>

      <!-- Performance message -->
      <p class="performance-msg animate-fade-in-up" style="animation-delay: 100ms">
        {{ performanceMessage }}
      </p>

      <!-- Stats row -->
      <div class="stats-row animate-fade-in-up" style="animation-delay: 200ms">
        <div class="stat-item">
          <span class="stat-num">{{ total }}</span>
          <span class="stat-lbl">Total</span>
        </div>
        <div class="stat-item stat-item--correct">
          <span class="stat-num">{{ correct }}</span>
          <span class="stat-lbl">Correctas</span>
        </div>
        <div class="stat-item stat-item--wrong">
          <span class="stat-num">{{ incorrect }}</span>
          <span class="stat-lbl">Incorrectas</span>
        </div>
      </div>

      <!-- Points earned -->
      <div class="points-box animate-fade-in-up" style="animation-delay: 300ms">
        <span class="points-value">+{{ points }}</span>
        <span class="points-lbl">puntos ganados</span>
      </div>

      <!-- New badges -->
      <div v-if="newBadges.length > 0" class="badges-section animate-fade-in-up" style="animation-delay: 400ms">
        <h2 class="badges-heading">Nuevas insignias</h2>
        <div class="badges-list">
          <div
            v-for="badge in newBadges"
            :key="badge.id"
            class="badge-chip"
          >
            <span class="badge-icon">{{ badge.icon }}</span>
            <span class="badge-name">{{ badge.name }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions animate-fade-in-up" style="animation-delay: 400ms">
        <button class="btn-primary" @click="reviewAgain">
          Repasar de nuevo
        </button>
        <button class="btn-secondary" @click="() => window.location.href = '/dashboard'">
          Volver al Dashboard
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.results-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
}

.results-card {
  width: 100%;
  max-width: 440px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

@media (min-width: 480px) {
  .results-card {
    padding: 2rem;
  }
}

/* ── Title ──────────────────────────────────────────────── */
.results-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

@media (min-width: 480px) {
  .results-title {
    font-size: 1.5rem;
  }
}

/* ── Score ring ─────────────────────────────────────────── */
.score-ring {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  border: 4px solid var(--glass-border);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-ring--great { border-color: var(--color-success); }
.score-ring--good  { border-color: var(--color-accent); }
.score-ring--low   { border-color: var(--color-error); }

.score-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* ── Performance message ────────────────────────────────── */
.performance-msg {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* ── Stats row ──────────────────────────────────────────── */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-item--correct .stat-num { color: var(--color-success); }
.stat-item--wrong   .stat-num { color: var(--color-error); }

.stat-lbl {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* ── Points box ─────────────────────────────────────────── */
.points-box {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.points-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-accent);
}

.points-lbl {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

/* ── Badges ─────────────────────────────────────────────── */
.badges-section {
  width: 100%;
}

.badges-heading {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badges-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.625rem;
}

.badge-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  min-width: 80px;
}

.badge-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.badge-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* ── Actions ────────────────────────────────────────────── */
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-btn);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}
</style>
