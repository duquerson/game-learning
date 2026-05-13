<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}>(), {
  type: 'button',
  disabled: false,
  variant: 'primary',
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="touch-target inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-sm"
    :class="[
      variant === 'primary' ? 'bg-(--color-primary) text-(--color-primary-foreground) border-none hover:brightness-110 transition-shadow duration-300 hover:shadow-(--shadow-glow-green)' : '',
      variant === 'secondary' ? 'glass-strong data-[theme=light]:glass-light text-(--color-text-primary) hover:border-(--color-accent-green)/40' : '',
      variant === 'ghost' ? 'bg-transparent text-(--color-text-primary) border-none hover:bg-(--glass-bg)' : '',
      disabled ? 'opacity-60 cursor-not-allowed' : 'btn-tactile',
    ]"
  >
    <slot />
  </button>
</template>
