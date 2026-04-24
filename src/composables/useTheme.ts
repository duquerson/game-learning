import { ref } from 'vue'
import { getInitialTheme, applyTheme, persistTheme } from '@/lib/theme'

const theme = ref<'light' | 'dark'>('light')

export function useTheme() {
  function init() {
    theme.value = getInitialTheme()
    applyTheme(theme.value)
  }

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value)
    persistTheme(theme.value)
  }

  return { theme, init, toggle }
}
