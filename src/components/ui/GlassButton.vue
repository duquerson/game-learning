<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'error'
}>()
</script>

<template>
  <button 
    :type="type || 'button'" 
    :disabled="disabled"
    class="glass-btn"
    :class="[`variant-${variant || 'primary'}`]"
  >
    <slot />
  </button>
</template>

<style scoped>
.glass-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-btn);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.glass-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.glass-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.variant-secondary {
  background: var(--color-secondary);
}

.variant-success {
  background: var(--color-success);
}

.variant-error {
  background: var(--color-error);
}
</style>