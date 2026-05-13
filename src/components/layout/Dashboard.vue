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
  const timeGreeting = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  return props.userEmail ? `${timeGreeting}, ${userName.value}` : timeGreeting
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

const stats = computed(() => [
  { label: 'Puntos totales', value: props.totalPoints, icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' },
  { label: 'Racha actual', value: streakLabel.value, icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>' },
  { label: 'Mejor racha', value: props.longestStreak, icon: '<path d="M12 15l-2-2m0 0l-2 2m2-2l2 2m-2-2V7m0 8l2 2m-2-2l-2-2M12 3a9 9 0 100 18 9 9 0 000-18z"/>' },
  { label: 'Repasadas hoy', value: props.cardsToday, icon: '<path d="M4 6h16M4 12h16M4 18h7"/>' },
])

function navigateTo(path: string) {
  window.location.href = path
}
</script>

<template>
  <div class="mx-auto flex max-w-[600px] flex-col gap-4">
    <header class="mb-2 stagger-item" style="animation-delay: 0s">
      <h1 class="font-heading text-h1 m-0">{{ greeting }}</h1>
    </header>

    <GlassCard v-if="totalCards > 0 && !loading" class="p-4">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-semibold text-(--color-text-primary)">Progreso general</span>
        <span class="text-xs text-(--color-text-secondary)">{{ uniqueReviewed }} / {{ totalCards }} tarjetas</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-(--glass-border)">
        <div
          class="h-full rounded-full bg-(--color-primary) transition-all duration-500 ease-out"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
      <span class="mt-1 block text-right text-xs text-(--color-text-muted)">{{ progressPercent }}% completado</span>
    </GlassCard>

    <EmptyState
      v-if="cardsToday === 0 && !loading"
      icon="book"
      title="Empieza tu sesion de hoy"
      description="Aun no has estudiado ninguna tarjeta hoy. Inicia una sesion y mantén tu racha"
      ctaLabel="Iniciar repaso"
      ctaHref="/review"
    />

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <template v-if="loading">
        <SkeletonLoader variant="stat" :count="4" />
      </template>
      <template v-else>
        <GlassCard
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="flex items-center gap-3 p-4"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <svg class="h-5 w-5 shrink-0 text-(--color-primary)" aria-hidden="true" v-html="stat.icon"></svg>
          <div class="min-w-0">
            <span class="block truncate text-lg font-bold text-(--color-text-primary)">{{ stat.value }}</span>
            <span class="block text-xs text-(--color-text-secondary)">{{ stat.label }}</span>
          </div>
        </GlassCard>
      </template>
    </div>

    <GlassCard class="p-6 text-center">
      <h2 class="mb-2 text-lg font-semibold text-(--color-text-primary)">Listo para continuar?</h2>
      <p class="mb-4 text-sm text-(--color-text-secondary)">Repasa tus tarjetas y gana mas puntos</p>
      <div class="flex flex-wrap justify-center gap-4">
        <GlassButton class="btn-tactile touch-target" @click="navigateTo('/review')">
          Iniciar repaso
        </GlassButton>
        <GlassButton class="btn-tactile touch-target" variant="secondary" @click="navigateTo('/library')">
          Ver biblioteca
        </GlassButton>
      </div>
    </GlassCard>

    <section v-if="allBadges.length > 0">
      <h2 class="mb-3 text-base font-semibold text-(--color-text-primary)">Mis insignias</h2>
      <div class="flex flex-col gap-2">
        <BadgeItem
          v-for="badge in allBadges"
          :key="badge.id"
          :badge="badge"
          :unlocked-at="badge.unlockedAt"
        />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-4">
      <a
        href="/badges"
        class="btn-tactile flex items-center gap-3 rounded-[--radius-btn] border border-(--glass-border) bg-(--glass-bg) p-4 font-medium text-(--color-text-primary) no-underline backdrop-blur-[--glass-blur]"
      >
        <svg class="h-5 w-5 text-(--color-accent-green)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15l-2-2m0 0l-2 2m2-2l2 2m-2-2V7m0 8l2 2m-2-2l-2-2M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
        <span>Insignias</span>
      </a>
      <a
        href="/profile"
        class="btn-tactile flex items-center gap-3 rounded-[--radius-btn] border border-(--glass-border) bg-(--glass-bg) p-4 font-medium text-(--color-text-primary) no-underline backdrop-blur-[--glass-blur]"
      >
        <svg class="h-5 w-5 text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span>Perfil</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
[class*="btn-tactile"] {
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
[class*="btn-tactile"]:active {
  transform: scale(0.97);
}
</style>
