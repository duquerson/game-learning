import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from '../lib/supabase'
import { createAppError, logServerError } from '../lib/errors'

// Rutas que requieren sesión activa (R1.9, R14.2, R18.8)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/library',
  '/review',
  '/results',
  '/badges',
  '/profile',
  '/onboarding',
]

// Rutas públicas donde un usuario autenticado debe ser redirigido al dashboard
const AUTH_ROUTES = ['/login', '/register']

// Rutas completamente públicas (sin verificación de sesión)
const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context
  const pathname = url.pathname

  // Rutas de auth (/login, /register): redirigir al dashboard si ya hay sesión
  if (isAuthRoute(pathname)) {
    try {
      const supabase = createSupabaseServerClient(cookies)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return redirect('/dashboard')
    } catch {
      // Si falla la verificación, dejar pasar a la ruta pública
    }
    return next()
  }

  // Rutas públicas que no son de auth (ej. /auth/callback): pasar sin verificación
  if (isPublicRoute(pathname)) {
    return next()
  }

  // Rutas no protegidas (ej. /, assets, etc.): pasar sin verificación
  if (!isProtectedRoute(pathname)) {
    return next()
  }

  // Rutas protegidas: verificar sesión (R1.9, R14.2, R18.1, R18.8)
  try {
    const supabase = createSupabaseServerClient(cookies)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      const appErr = createAppError('INTERNAL_ERROR', error.message, pathname)
      logServerError(appErr)
      return redirect('/login')
    }

    // Sin sesión → redirigir a login sin exponer la ruta solicitada (R18.8)
    if (!user) {
      const appErr = createAppError('UNAUTHORIZED', `Unauthenticated access to ${pathname}`, pathname)
      logServerError(appErr)
      return redirect('/login')
    }

    // Verificar onboarding completado (excepto en /onboarding)
    if (pathname !== '/onboarding' && !pathname.startsWith('/onboarding/')) {
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prefsError) {
        const appErr = createAppError('INTERNAL_ERROR', prefsError.message, pathname)
        logServerError(appErr)
      }

      if (prefs && !prefs.onboarding_completed) {
        return redirect('/onboarding')
      }
    }

    return next()

  } catch (err) {
    const appErr = createAppError(
      'INTERNAL_ERROR',
      err instanceof Error ? err.message : 'Unknown middleware error',
      pathname
    )
    logServerError(appErr)
    return redirect('/login')
  }
})
