<script setup lang="ts">
defineProps<{
  hasPrev: boolean
  hasNext: boolean
  isLast: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-[--glass-border]">
    <button
      class="nav-btn prev-btn"
      :disabled="!hasPrev || loading"
      @click="$emit('prev')"
      aria-label="Tarjeta anterior"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span>Anterior</span>
    </button>

    <button
      class="nav-btn next-btn"
      :class="{ 'is-finish': isLast }"
      :disabled="!hasNext && !isLast || loading"
      @click="$emit('next')"
      :aria-label="isLast ? 'Finalizar sesión' : 'Siguiente tarjeta'"
    >
      <span>{{ isLast ? 'Finalizar' : 'Siguiente' }}</span>
      <svg v-if="!isLast" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.next-btn.is-finish {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.next-btn.is-finish:hover:not(:disabled) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}
</style>
