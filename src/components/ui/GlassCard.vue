<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'interactive'
}>(), {
  variant: 'default',
})
</script>

<template>
  <div
    class="glass data-[theme=light]:glass-light rounded-xl p-5 md:p-7"
    :class="[
      variant === 'interactive' ? 'btn-tactile cursor-pointer hover:-translate-y-0.5' : '',
    ]"
  >
    <slot />
  </div>
</template>
