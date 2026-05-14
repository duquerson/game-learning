<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', confidence: number): void
}>()

const confidenceLevels = [
  { value: 0, label: 'No lo sabía', icon: '❌', color: 'var(--color-error)' },
  { value: 1, label: 'Dudé', icon: '⚠️', color: 'var(--color-accent)' },
  { value: 2, label: 'Fácil', icon: '✅', color: 'var(--color-success)' }
]
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row">
    <button
      v-for="level in confidenceLevels"
      :key="level.value"
      class="confidence-btn touch-target btn-tactile flex flex-1 items-center justify-center gap-2 rounded-[--radius-btn] border px-4 py-3 text-sm font-semibold transition-all"
      :style="{ '--hover-color': level.color }"
      :disabled="disabled"
      @click="emit('select', level.value)"
    >
      <span class="text-lg">{{ level.icon }}</span>
      {{ level.label }}
    </button>
  </div>
</template>

<style scoped>
.confidence-btn {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: var(--color-text-primary);
}

.confidence-btn:hover:not(:disabled) {
  border-color: var(--hover-color);
  background: color-mix(in srgb, var(--hover-color), transparent 90%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--hover-color), transparent 80%);
}

.confidence-btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>
