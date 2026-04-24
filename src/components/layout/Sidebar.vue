<script setup lang="ts">
import { computed } from 'vue'
import ThemeToggle from '../ui/ThemeToggle.vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const current = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
})

const links = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/library', icon: '📚', label: 'Biblioteca' },
  { href: '/review', icon: '🔄', label: 'Repasar' },
  { href: '/badges', icon: '🏆', label: 'Insignias' },
  { href: '/profile', icon: '👤', label: 'Perfil' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">🧠</span>
      <span class="logo-text">MicroLearn</span>
    </div>

    <nav class="nav">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="nav-item"
        :class="{ active: current === link.href }"
      >
        <span class="icon">{{ link.icon }}</span>
        <span>{{ link.label }}</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <ThemeToggle />
      <button class="logout-btn" @click="auth.logout()">Cerrar sesión</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-right: 1px solid var(--glass-border);
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}
.logo-icon { font-size: 1.5rem; }
.nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-btn);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: var(--color-text-primary); }
.nav-item.active { background: rgba(124,58,237,0.15); color: var(--color-primary); }
.icon { font-size: 1.125rem; }
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}
.logout-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-btn);
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}
.logout-btn:hover { color: var(--color-error); border-color: var(--color-error); }
</style>
