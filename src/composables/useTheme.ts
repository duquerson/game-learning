import { ref } from 'vue'
import { actions } from 'astro:actions'
import { getInitialTheme, applyTheme, persistTheme } from '@/lib/theme'

const theme = ref<'light' | 'dark'>('light')

export function useTheme() {
  function init() {
    theme.value = getInitialTheme()
    applyTheme(theme.value)
  }

  function toggle() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme
    applyTheme(newTheme)
    persistTheme(newTheme)
    actions.auth.updateTheme({ theme: newTheme }).catch(() => {})
  }

  return { theme, init, toggle }
}
