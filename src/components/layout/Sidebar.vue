<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ThemeToggle from '../ui/ThemeToggle.vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const collapsed = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved === 'true') collapsed.value = true
})

function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('sidebar-collapsed', String(collapsed.value))
}

const current = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
})

const icons = {
  dashboard: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  library: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  review: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  badges: '<path d="M12 15l-2-2m0 0l-2 2m2-2l2 2m-2-2V7m0 8l2 2m-2-2l-2-2M12 3a9 9 0 100 18 9 9 0 000-18z"/>',
  profile: '<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
}

const links = [
  { href: '/dashboard', icon: icons.dashboard, label: 'Dashboard' },
  { href: '/library', icon: icons.library, label: 'Biblioteca' },
  { href: '/review', icon: icons.review, label: 'Repasar' },
  { href: '/badges', icon: icons.badges, label: 'Insignias' },
  { href: '/profile', icon: icons.profile, label: 'Perfil' },
]
</script>

<template>
  <aside
    class="flex min-h-dvh w-[220px] flex-col gap-6 border-r border-(--glass-border) bg-(--glass-bg) p-6 backdrop-blur-(--glass-blur) transition-all duration-300"
    :class="{ 'w-16 items-center px-3': collapsed }"
  >
    <div class="flex items-center gap-2 font-heading text-lg font-bold text-(--color-text-primary) tracking-tight whitespace-nowrap">
      <svg class="h-6 w-6 shrink-0 text-(--color-accent-green) drop-shadow-[0_0_8px_oklch(75%_0.2_145/0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      <span v-if="!collapsed" class="font-heading">MicroLearn</span>
    </div>

    <nav class="flex flex-1 flex-col gap-1" role="navigation" aria-label="Navegacion principal">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="flex items-center gap-3 rounded-(--radius-btn) px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) no-underline transition-all duration-200 hover:bg-white/10 hover:text-(--color-text-primary) whitespace-nowrap"
        :class="{ '!text-(--color-primary) !bg-(--color-primary)/10': current === link.href }"
        :aria-label="link.label"
      >
        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="link.icon"></svg>
        <span v-if="!collapsed">{{ link.label }}</span>
      </a>
    </nav>

    <div class="flex flex-col gap-2 border-t border-(--glass-border) pt-4">
      <ThemeToggle />
      <button
        class="touch-target btn-tactile w-full rounded-(--radius-btn) border border-(--glass-border) bg-transparent px-3 py-2 text-xs text-(--color-text-secondary) transition-all duration-200 hover:border-(--color-error) hover:text-(--color-error) whitespace-nowrap"
        @click="auth.logout()"
        aria-label="Cerrar sesion"
      >
        <svg v-if="collapsed" class="mx-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span v-else>Cerrar sesion</span>
      </button>
    </div>

    <button
      class="btn-tactile absolute -right-3 bottom-6 flex h-6 w-6 items-center justify-center rounded-full border border-(--glass-border) bg-(--glass-bg) text-xs text-(--color-text-secondary) transition-all duration-200 hover:bg-white/10"
      @click="toggleCollapse"
      :aria-label="collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
    >
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path v-if="collapsed" d="M9 18l6-6-6-6"/>
        <path v-else d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
  </aside>
</template>
