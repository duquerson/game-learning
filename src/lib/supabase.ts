/**
 * Supabase SSR client para Astro.
 *
 * Patrón oficial de @supabase/ssr para Astro (v0.10.x):
 *   - getAll: parseCookieHeader(request.headers.get("Cookie"))
 *   - setAll: cookies.set(name, value, options)
 *
 * Referencia: https://supabase.com/docs/guides/auth/quickstarts/astrojs
 *
 * OWASP:
 *   - Las cookies de sesión se marcan httpOnly + secure en producción (A02, A07)
 *   - No se exponen variables de entorno al cliente (A05)
 *   - Se valida la URL de Supabase para evitar SSRF (A10)
 */
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'

// ── Env vars — solo disponibles en el servidor ────────────────────────────────
const supabaseUrl = import.meta.env.SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY as string

// ── Validaciones de arranque ──────────────────────────────────────────────────

function isPlaceholder(value: string): boolean {
  return [
    'https://your-project.supabase.co',
    'your-anon-key',
    'test-anon-key',
  ].includes(value)
}

/** OWASP A10 — valida que la URL sea HTTPS o localhost para evitar SSRF */
function isAllowedSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
    const isLocalPort = url.port === '54321' || url.port === '54323'
    return url.protocol === 'https:' ||
      (url.protocol === 'http:' && (isLocal || isLocalPort))
  } catch {
    return false
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridas (variables de servidor, sin prefijo PUBLIC_)')
}
if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  throw new Error('Reemplaza los valores placeholder de SUPABASE_URL y SUPABASE_ANON_KEY')
}
if (!isAllowedSupabaseUrl(supabaseUrl)) {
  throw new Error(`SUPABASE_URL inválida: ${supabaseUrl}`)
}

/** Detectado una sola vez al cargar el módulo */
const IS_LOCAL = (() => {
  try {
    const url = new URL(supabaseUrl)
    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1' ||
      url.port === '54321' ||
      url.port === '54323'
    )
  } catch {
    return false
  }
})()

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Crea un cliente Supabase server-side.
 *
 * @param request  El objeto Request nativo de Astro (Astro.request)
 * @param cookies  El objeto AstroCookies (Astro.cookies)
 *
 * Ambos son necesarios:
 *   - request → leer las cookies entrantes del header HTTP (getAll)
 *   - cookies → escribir cookies en la respuesta (setAll)
 */
export function createSupabaseClient(request: Request, cookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      /**
       * Lee las cookies de la petición HTTP entrante.
       * parseCookieHeader devuelve { name, value }[] que es exactamente
       * lo que espera @supabase/ssr.
       */
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '')
      },

      /**
       * Escribe las cookies de sesión en la respuesta.
       * OWASP A02/A07: httpOnly + secure en producción previenen
       * robo de sesión via XSS y ataques de red.
       */
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          // Si el valor es vacío o maxAge es 0, eliminar la cookie
          // Esto es necesario para el logout correcto
          if (!value || options?.maxAge === 0) {
            cookies.delete(name, { path: '/' })
          } else {
            cookies.set(name, value, {
              ...options,
              path: '/',
              httpOnly: true,
              secure: !IS_LOCAL,
              sameSite: 'lax',
            })
          }
        }
      },
    },
  })
}

// ── Helpers públicos (solo para uso en cliente público si se necesita) ────────
export const getSupabaseUrl = () => supabaseUrl
export const getSupabaseAnonKey = () => supabaseAnonKey
