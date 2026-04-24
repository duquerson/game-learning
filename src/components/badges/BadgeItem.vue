<script setup lang="ts">
import type { Badge } from '../../types/app'

const props = defineProps<{
  badge: Badge
  unlockedAt: string | null
}>()

const formattedDate = props.unlockedAt
  ? new Date(props.unlockedAt).toLocaleDateString()
  : null

const levelLabels: Record<string, string> = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const levelColors: Record<string, string> = {
  basic: 'level-basic',
  intermediate: 'level-intermediate',
  advanced: 'level-advanced',
}
</script>

<template>
  <div class="badge-item" :class="{ locked: !unlockedAt }">
    <div class="icon-wrap">
      <span class="icon">{{ badge.icon }}</span>
      <span v-if="!unlockedAt" class="lock-overlay" aria-hidden="true">🔒</span>
    </div>

    <div class="info">
      <div class="name-row">
        <span class="name">{{ badge.name }}</span>
        <span class="level-chip" :class="levelColors[badge.level]">
          {{ levelLabels[badge.level] }}
        </span>
      </div>

      <p class="description">{{ badge.description }}</p>

      <span v-if="formattedDate" class="unlock-date">
        Desbloqueada el {{ formattedDate }}
      </span>
      <span v-else class="locked-label">Bloqueada</span>
    </div>
  </div>
</template>

<style scoped>
.badge-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-card);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: opacity 0.2s ease, border-color 0.2s ease;
}

.badge-item:not(.locked) {
  border-color: var(--color-primary);
}

.badge-item.locked {
  opacity: 0.4;
}

.icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}

.icon {
  font-size: 1.75rem;
  line-height: 1;
}

.lock-overlay {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 0.85rem;
}

.info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.level-chip {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.level-basic {
  background: rgba(16, 185, 129, 0.2);
  color: var(--color-success);
}

.level-intermediate {
  background: rgba(245, 158, 11, 0.2);
  color: var(--color-accent);
}

.level-advanced {
  background: rgba(124, 58, 237, 0.2);
  color: var(--color-primary);
}

.description {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.unlock-date {
  font-size: 0.72rem;
  color: var(--color-success);
  font-weight: 500;
}

.locked-label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
