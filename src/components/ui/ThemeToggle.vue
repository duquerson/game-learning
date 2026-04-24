<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '../../composables/useTheme'

const { theme, init, toggle } = useTheme()
onMounted(init)
</script>

<template>
  <button class="theme-toggle" @click="toggle" :aria-label="`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`">
    <span v-if="theme === 'light'">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1;
  transition: all 0.2s;
}
.theme-toggle:hover { transform: scale(1.1); }
</style>
