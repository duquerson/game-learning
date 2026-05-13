<script setup lang="ts">
import { computed } from 'vue'

const current = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
})

const links = [
  { href: '/dashboard', icon: 'dashboard', label: 'Inicio' },
  { href: '/library', icon: 'library', label: 'Biblioteca' },
  { href: '/review', icon: 'review', label: 'Repasar' },
  { href: '/badges', icon: 'badges', label: 'Insignias' },
  { href: '/profile', icon: 'profile', label: 'Perfil' },
]
</script>

<template>
  <nav
    class="glass border-x-0 border-b-0 fixed bottom-0 left-0 right-0 z-50 flex safe-area-pb"
    role="navigation"
    aria-label="Navegación móvil"
  >
    <a
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      class="touch-target flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.625rem] no-underline text-(--color-text-secondary) transition-colors hover:text-(--color-primary) focus-visible:text-(--color-primary)"
      :class="current === link.href && 'text-(--color-primary)'"
      :aria-label="link.label"
    >
      <svg
        v-if="link.icon === 'dashboard'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      <svg
        v-else-if="link.icon === 'library'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 12h6" />
        <path d="M8 8h6" />
      </svg>
      <svg
        v-else-if="link.icon === 'review'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <svg
        v-else-if="link.icon === 'badges'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
      <svg
        v-else-if="link.icon === 'profile'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>

      <span v-if="current === link.href" class="font-semibold">{{ link.label }}</span>
    </a>
  </nav>
</template>
