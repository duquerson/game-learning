<script setup lang="ts">
import { computed } from 'vue'

const current = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
})

const links = [
  { href: '/dashboard', icon: '🏠', label: 'Inicio' },
  { href: '/library', icon: '📚', label: 'Biblioteca' },
  { href: '/review', icon: '🔄', label: 'Repasar' },
  { href: '/badges', icon: '🏆', label: 'Insignias' },
  { href: '/profile', icon: '👤', label: 'Perfil' },
]
</script>

<template>
  <nav class="bottom-nav" role="navigation" aria-label="Navegación móvil">
    <a
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      class="nav-item"
      :class="{ active: current === link.href }"
      :aria-label="link.label"
    >
      <span class="icon">{{ link.icon }}</span>
      <span v-if="current === link.href" class="label">{{ link.label }}</span>
    </a>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-top: 1px solid var(--glass-border);
  padding: 0.5rem 0 env(safe-area-inset-bottom, 0.5rem);
  z-index: 50;
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.5rem;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.625rem;
  transition: color 0.2s;
}
.nav-item.active { color: var(--color-primary); }
.icon { font-size: 1.25rem; }
.label { font-size: 0.625rem; font-weight: 600; }
</style>
