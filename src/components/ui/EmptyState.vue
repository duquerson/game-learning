<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon?: string
  ctaLabel?: string
  ctaHref?: string
}>()

const emit = defineEmits<{
  (e: 'cta-click'): void
}>()

const icons: Record<string, string> = {
  book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
}
</script>

<template>
  <div class="flex flex-col items-center gap-2 rounded-xl border border-(--glass-border) bg-(--glass-bg) p-10 text-center shadow-(--glass-shadow) backdrop-blur-(--glass-blur)">
    <svg v-if="icon && icons[icon]" class="mb-2 h-12 w-12 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" v-html="icons[icon]"></svg>
    <h3 class="m-0 text-base font-semibold text-(--color-text-primary)">{{ title }}</h3>
    <p class="m-0 max-w-xs text-sm text-(--color-text-secondary)">{{ description }}</p>
    <a
      v-if="ctaHref && ctaLabel"
      :href="ctaHref"
      class="btn-tactile touch-target mt-2 inline-flex items-center rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-(--color-primary-foreground) no-underline transition-all hover:brightness-110"
    >
      {{ ctaLabel }}
    </a>
    <button
      v-else-if="ctaLabel"
      class="btn-tactile touch-target mt-2 inline-flex items-center rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-(--color-primary-foreground) transition-all hover:brightness-110"
      @click="emit('cta-click')"
    >
      {{ ctaLabel }}
    </button>
  </div>
</template>
