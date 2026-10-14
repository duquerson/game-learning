/**
 * Utilidades de tema (solo cliente).
 * Tema claro por defecto; tema oscuro derivado de slate-map (design.md).
 */

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'light'
  }
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function persistTheme(theme: 'light' | 'dark'): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme)
  }
}
