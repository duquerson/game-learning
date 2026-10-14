/**
 * Vue app entrypoint para @astrojs/vue.
 *
 * Este archivo se ejecuta una vez por cada instancia de Vue que Astro crea,
 * tanto en SSR (servidor) como en el cliente. Es el lugar correcto para
 * registrar plugins globales como Pinia.
 *
 * Referencia: https://docs.astro.build/en/guides/integrations-guide/vue/#appentrypoint
 */
import type { App } from 'vue'

export default (_app: App) => {
  // No se usa Pinia en preview estática
  // app.use(createPinia())
}
