<script setup lang="ts">
import type { DbCard } from '../../types/database'

defineProps<{
  card: DbCard
  reviewed: boolean
}>()

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <div
    class="btn-tactile cursor-pointer rounded-xl border border-(--glass-border) bg-(--glass-bg) p-4 backdrop-blur-(--glass-blur) transition-all hover:-translate-y-0.5 hover:shadow-(--glass-shadow)"
    :class="{ '!border-(--color-success)/30': reviewed }"
    @click="$emit('click')"
  >
    <div class="mb-2 flex items-center justify-between">
      <span class="text-[0.7rem] font-bold uppercase tracking-wider text-(--color-primary)">{{ card.topic }}</span>
      <span
        class="rounded px-1.5 py-0.5 text-[0.7rem] font-semibold"
        :class="card.difficulty === 'easy' ? 'bg-(--color-success)/15 text-(--color-success)' : card.difficulty === 'medium' ? 'bg-(--color-warning)/15 text-(--color-warning)' : 'bg-(--color-destructive)/15 text-(--color-destructive)'"
      >{{ card.difficulty }}</span>
    </div>
    <h3 class="m-0 mb-1 text-[0.9375rem] font-semibold leading-tight text-(--color-text-primary)">{{ card.title }}</h3>
    <p class="m-0 text-xs text-(--color-text-secondary)">{{ card.subtopic }}</p>
    <div class="mt-3 flex items-center justify-between">
      <span class="text-xs font-semibold text-(--color-accent-green)">+{{ card.points }} pts</span>
      <span v-if="reviewed" class="flex items-center gap-1 text-[0.7rem] font-semibold text-(--color-success)">
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Repasada
      </span>
    </div>
  </div>
</template>
