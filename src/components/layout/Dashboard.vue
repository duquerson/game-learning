<script setup lang="ts">
import { computed } from 'vue'
import type { Badge } from '../../types/app'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import BadgeItem from '../badges/BadgeItem.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'
import EmptyState from '../ui/EmptyState.vue'

interface RecentBadge extends Badge {
  unlockedAt: string
}

const props = withDefaults(defineProps<{
  totalPoints?: number
  currentStreak?: number
  longestStreak?: number
  cardsToday?: number
  uniqueReviewed?: number
  totalCards?: number
  userEmail?: string
  allBadges?: RecentBadge[]
  loading?: boolean
}>(), {
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  cardsToday: 0,
  uniqueReviewed: 0,
  totalCards: 0,
  userEmail: '',
  allBadges: () => [],
  loading: false,
})

const userName = computed(() => {
  if (!props.userEmail) return ''
  return props.userEmail.split('@')[0].charAt(0).toUpperCase() + props.userEmail.split('@')[0].slice(1)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  return props.userEmail ? `${timeGreeting}, ${userName.value} 👋` : `${timeGreeting} 👋`
})

const streakLabel = computed(() => {
  if (props.currentStreak === 0) return '—'
  if (props.currentStreak === 1) return '1 día'
  return `${props.currentStreak} días`
})

const progressPercent = computed(() => {
  if (props.totalCards === 0) return 0
  return Math.round((props.uniqueReviewed / props.totalCards) * 100)
})

function navigateTo(path: string) {
  window.location.href = path
}
</script>

<template>
  <div class="dashboard">
    <header class="header">
      <h1 class="greeting">{{ greeting }}</h1>
    </header>

    <!-- Progress bar -->
    <GlassCard v-if="totalCards > 0" class="progress-card">
      <div class="progress-header">
        <span class="progress-label">Progreso general</span>
        <span class="progress-count">{{ uniqueReviewed }} / {{ totalCards }} tarjetas</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <span class="progress-pct">{{ progressPercent }}% completado</span>
    </GlassCard>

    <!-- Motivational empty state -->
    <EmptyState
      v-if="cardsToday === 0 && !loading"
      icon="🌟"
      title="¡Empieza tu sesión de hoy!"
      description="Aún no has estudiado ninguna tarjeta hoy. ¡Inicia una sesión y mantén tu racha!"
      ctaLabel="Iniciar repaso"
      ctaHref="/review"
    />

    <!-- Stats grid -->
    <div class="stats-grid">
      <template v-if="loading">
        <SkeletonLoader variant="stat" :count="4" />
      </template>
      <template v-else>
        <GlassCard class="stat-card animate-fade-in-up" style="animation-delay: 0ms">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <span class="stat-value">{{ totalPoints }}</span>
            <span class="stat-label">Puntos totales</span>
          </div>
        </GlassCard>

        <GlassCard class="stat-card animate-fade-in-up" style="animation-delay: 100ms">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <span class="stat-value">{{ streakLabel }}</span>
            <span class="stat-label">Racha actual</span>
          </div>
        </GlassCard>

        <GlassCard class="stat-card animate-fade-in-up" style="animation-delay: 150ms">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <span class="stat-value">{{ longestStreak }}</span>
            <span class="stat-label">Mejor racha</span>
          </div>
        </GlassCard>

        <GlassCard class="stat-card animate-fade-in-up" style="animation-delay: 200ms">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <span class="stat-value">{{ cardsToday }}</span>
            <span class="stat-label">Repasadas hoy</span>
          </div>
        </GlassCard>
      </template>
    </div>

    <!-- CTA button -->
    <GlassCard class="action-card">
      <h2>¿Listo para continuar?</h2>
      <p>Repasa tus tarjetas y gana más puntos</p>
      <div class="actions">
        <GlassButton @click="navigateTo('/review')">
          Iniciar repaso
        </GlassButton>
        <GlassButton variant="secondary" @click="navigateTo('/library')">
          Ver biblioteca
        </GlassButton>
      </div>
    </GlassCard>

    <!-- All badges -->
    <section v-if="allBadges.length > 0" class="badges-section">
      <h2>Mis insignias</h2>
      <div class="badges-list">
        <BadgeItem
          v-for="badge in allBadges"
          :key="badge.id"
          :badge="badge"
          :unlocked-at="badge.unlockedAt"
        />
      </div>
    </section>

    <!-- Quick links -->
    <div class="quick-links">
      <a href="/badges" class="link-card">
        <span>🏆</span>
        <span>Insignias</span>
      </a>
      <a href="/profile" class="link-card">
        <span>👤</span>
        <span>Perfil</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header {
  margin-bottom: 0.5rem;
}

.greeting {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-primary);
}

@media (min-width: 768px) {
  .greeting { font-size: 1.5rem; }
}

/* Progress bar */
.progress-card {
  text-align: left;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.progress-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
.progress-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
.progress-bar-track {
  height: 8px;
  border-radius: 99px;
  background: var(--glass-border);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--color-primary);
  transition: width 0.5s ease;
}
.progress-pct {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: right;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.action-card {
  text-align: center;
}

.action-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--color-text-primary);
}

.action-card p {
  margin: 0 0 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Badges section */
.badges-section h2 {
  font-size: 1rem;
  margin: 0 0 0.75rem;
  color: var(--color-text-primary);
}

.badges-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: transform 0.2s ease;
}

.link-card:hover {
  transform: translateY(-2px);
}

@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
