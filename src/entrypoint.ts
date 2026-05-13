/**
 * Vue app entrypoint para @astrojs/vue.
 *
 * Este archivo se ejecuta una vez por cada instancia de Vue que Astro crea,
 * tanto en SSR (servidor) como en el cliente. Es el lugar correcto para
 * registrar plugins globales como Pinia.
 *
 * Referencia: https://docs.astro.build/en/guides/integrations-guide/vue/#appentrypoint
 */
import { createPinia } from 'pinia'
import type { App } from 'vue'

export default (app: App) => {
  // Crear una instancia de Pinia por cada render (SSR-safe).
  // No reutilizamos un singleton porque en SSR cada request debe tener
  // su propio estado para evitar contaminación entre usuarios.
  app.use(createPinia())
}
