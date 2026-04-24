<script setup lang="ts">
import { computed } from 'vue'
import type { Badge, UserBadge, BadgeLevel } from '../../types/app'
import BadgeItem from './BadgeItem.vue'
import EmptyState from '../ui/EmptyState.vue'

const props = defineProps<{
  badges: Badge[]
  unlockedBadges: UserBadge[]
}>()

const unlockedMap = computed(() => {
  const map = new Map<string, string>()
  for (const ub of props.unlockedBadges) {
    map.set(ub.badgeId, ub.unlockedAt)
  }
  return map
})

const totalUnlocked = computed(() => props.unlockedBadges.length)

const levels: BadgeLevel[] = ['basic', 'intermediate', 'advanced']

const levelLabels: Record<BadgeLevel, string> = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const badgesByLevel = computed(() => {
  return levels.map((level) => ({
    level,
    label: levelLabels[level],
    badges: props.badges.filter((b) => b.level === level),
  }))
})

function getUnlockedAt(badgeId: string): string | null {
  return unlockedMap.value.get(badgeId) ?? null
}
</script>

<template>
  <div class="badge-grid">
    <div class="summary">
      <span class="summary-count">{{ totalUnlocked }} / {{ badges.length }}</span>
      <span class="summary-label">insignias desbloqueadas</span>
    </div>

    <!-- Estado vacío cuando no hay insignias desbloqueadas -->
    <EmptyState
      v-if="totalUnlocked === 0"
      icon="🏆"
      title="¡Aún no tienes insignias!"
      description="Completa sesiones de repaso para desbloquear tus primeras insignias y demostrar tu progreso."
      ctaLabel="Empezar a repasar"
      ctaHref="/review"
    />

    <template v-else>
      <div
        v-for="group in badgesByLevel"
        :key="group.level"
        class="level-group"
      >
        <h2 class="level-heading">{{ group.label }}</h2>

        <div class="badges-list">
          <BadgeItem
            v-for="badge in group.badges"
            :key="badge.id"
            :badge="badge"
            :unlockedAt="getUnlockedAt(badge.id)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.badge-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
}

.summary-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.summary-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.level-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-heading {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badges-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .badges-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 900px) {
  .badges-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
