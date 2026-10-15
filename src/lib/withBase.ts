/**
 * Prefija rutas internas con el base path del despliegue.
 * Local: '/' · GitHub Pages: '/game-learning/'.
 * Centraliza el cambio para no esparcir `import.meta.env.BASE_URL`.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
