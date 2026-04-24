<script setup lang="ts">
import type { DbCard } from '../../types/database'

defineProps<{
  card: DbCard
  reviewed: boolean
}>()

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <div class="card-item" :class="{ reviewed }" @click="$emit('click')">
    <div class="card-top">
      <span class="topic">{{ card.topic }}</span>
      <span class="difficulty" :class="card.difficulty">{{ card.difficulty }}</span>
    </div>
    <h3>{{ card.title }}</h3>
    <p class="subtopic">{{ card.subtopic }}</p>
    <div class="card-bottom">
      <span class="points">+{{ card.points }} pts</span>
      <span v-if="reviewed" class="reviewed-badge">✓ Repasada</span>
    </div>
  </div>
</template>

<style scoped>
.card-item {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.card-item:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow); }
.card-item.reviewed { border-color: rgba(16,185,129,0.3); }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.topic { font-size: 0.7rem; text-transform: uppercase; color: var(--color-primary); font-weight: 700; letter-spacing: 0.05em; }
.difficulty { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.4rem; border-radius: 4px; }
.difficulty.easy { background: rgba(16,185,129,0.15); color: var(--color-success); }
.difficulty.medium { background: rgba(245,158,11,0.15); color: var(--color-accent); }
.difficulty.hard { background: rgba(239,68,68,0.15); color: var(--color-error); }
h3 { margin: 0 0 0.25rem; font-size: 0.9375rem; color: var(--color-text-primary); line-height: 1.3; }
.subtopic { margin: 0; font-size: 0.75rem; color: var(--color-text-secondary); }
.card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; }
.points { font-size: 0.75rem; font-weight: 600; color: var(--color-accent); }
.reviewed-badge { font-size: 0.7rem; color: var(--color-success); font-weight: 600; }
</style>
