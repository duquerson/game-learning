import { createClient } from '@supabase/supabase-js'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createSupabaseServerClient(cookies: AstroCookies) {
  const safeCookies = parseCookieHeader(cookies.toString())
    .filter((cookie): cookie is { name: string; value: string } => typeof cookie.value === 'string')
    .map(({ name, value }) => ({ name, value }))

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => safeCookies,
      setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Parameters<AstroCookies['set']>[2] }>) => {
        cookiesToSet.map(({ name, value, options }) => cookies.set(name, value, options))
      },
    },
  })
}
