<script setup lang="ts">
import { computed } from 'vue'
import type { Badge } from '../../types/app'

const props = defineProps<{
  badge: Badge
  unlockedAt: string | null
}>()

const formattedDate = computed(() => props.unlockedAt
  ? new Date(props.unlockedAt).toLocaleDateString()
  : null
)

const levelLabels: Record<string, string> = {
  basic: 'Basico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const categoryLabels: Record<string, string> = {
  achievement: 'logro',
  streak: 'racha',
  mastery: 'maestria',
}
</script>

<template>
  <div
    class="flex items-start gap-4 rounded-xl border border-(--glass-border) bg-(--glass-bg) p-4 shadow-(--glass-shadow) backdrop-blur-(--glass-blur) transition-all"
    :class="unlockedAt ? '!border-(--color-primary)' : 'opacity-40'"
  >
    <div class="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/15">
      <svg v-if="unlockedAt" class="h-6 w-6 text-(--color-accent-green)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
      <svg v-else class="h-6 w-6 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    </div>

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex flex-wrap items-center gap-2">
        <span class="text-[0.95rem] font-semibold text-(--color-text-primary)">{{ badge.name }}</span>
        <span
          class="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
          :class="badge.level === 'basic' ? 'bg-(--color-success)/20 text-(--color-success)' : badge.level === 'intermediate' ? 'bg-(--color-warning)/20 text-(--color-warning)' : 'bg-(--color-primary)/20 text-(--color-primary)'"
        >{{ levelLabels[badge.level] }}</span>
        <span v-if="badge.category" class="rounded-full bg-info/15 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-info">{{ categoryLabels[badge.category] }}</span>
      </div>

      <p class="m-0 text-[0.78rem] leading-relaxed text-(--color-text-secondary)">{{ badge.description }}</p>

      <span v-if="formattedDate" class="mt-1 block text-[0.72rem] font-medium text-(--color-success)">
        Desbloqueada el {{ formattedDate }}
      </span>
      <span v-else class="mt-1 block text-[0.72rem] italic text-(--color-text-secondary)">Bloqueada</span>
    </div>
  </div>
</template>
