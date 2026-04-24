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
  cardsToday?: number
  recentBadges?: RecentBadge[]
  loading?: boolean
}>(), {
  totalPoints: 0,
  currentStreak: 0,
  cardsToday: 0,
  recentBadges: () => [],
  loading: false,
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const streakLabel = computed(() => {
  if (props.currentStreak === 0) return '—'
  if (props.currentStreak === 1) return '1 día'
  return `${props.currentStreak} días`
})

function navigateTo(path: string) {
  window.location.href = path
}
</script>

<template>
  <div class="dashboard">
    <header class="header">
      <h1 class="greeting">{{ greeting }} 👋</h1>
    </header>

    <!-- Motivational empty state (R3.6) -->
    <EmptyState
      v-if="cardsToday === 0 && !loading"
      icon="🌟"
      title="¡Empieza tu sesión de hoy!"
      description="Aún no has estudiado ninguna tarjeta hoy. ¡Inicia una sesión y mantén tu racha!"
      ctaLabel="Iniciar repaso"
      ctaHref="/review"
    />

    <!-- Stats grid (R3.1, R3.2, R3.3) -->
    <div class="stats-grid">
      <template v-if="loading">
        <SkeletonLoader variant="stat" :count="3" />
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

        <GlassCard class="stat-card stat-card--full animate-fade-in-up" style="animation-delay: 200ms">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <span class="stat-value">{{ cardsToday }}</span>
            <span class="stat-label">Tarjetas repasadas hoy</span>
          </div>
        </GlassCard>
      </template>
    </div>

    <!-- CTA button (R3.4) -->
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

    <!-- Recent badges (R3.5) -->
    <section v-if="recentBadges.length > 0" class="recent-badges animate-fade-in-up" style="animation-delay: 300ms">
      <h2>Últimas insignias</h2>
      <div class="badges-list">
        <BadgeItem
          v-for="badge in recentBadges"
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
        <span>Mis insignias</span>
      </a>
      <a href="/profile" class="link-card">
        <span>👤</span>
        <span>Mi perfil</span>
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
  .greeting {
    font-size: 1.5rem;
  }
}

/* Stats grid: 2 columns on mobile, third card spans full width */
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

.stat-card--full {
  grid-column: 1 / -1;
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

.recent-badges h2 {
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

/* Responsive: 3-column stats on wider screens */
@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-card--full {
    grid-column: auto;
  }
}
</style>
