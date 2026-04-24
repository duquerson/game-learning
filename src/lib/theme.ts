/**
 * Browser-only theme utilities.
 * These functions must only be called in client-side contexts (not during SSR).
 * Implements: R13.9, R17.1, R17.2
 */

/**
 * Reads the persisted theme from localStorage.
 * Falls back to system preference (prefers-color-scheme) if no value is stored.
 * Matches SSR behavior in BaseLayout.astro to avoid hydration mismatch.
 */
export function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'
  // Fallback to system preference (matches SSR bootstrap)
  const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

/**
 * Applies the given theme to the document root via the `data-theme` attribute.
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Persists the given theme value to localStorage.
 */
export function persistTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem('theme', theme)
}
