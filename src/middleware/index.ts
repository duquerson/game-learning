import { defineMiddleware } from 'astro:middleware'
import { createSupabaseClient } from '../lib/supabase'
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
const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback', '/reset-password']

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
  const { url, cookies, redirect, request } = context
  const pathname = url.pathname
  
  // Rutas de auth (/login, /register): redirigir al dashboard si ya hay sesión
  if (isAuthRoute(pathname)) {
    try {
      const supabase = createSupabaseClient(request, cookies)
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
    const supabase = createSupabaseClient(request, cookies)
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

      // Redirigir a onboarding si: no hay fila de preferencias (usuario nuevo)
      // o si onboarding_completed es false explícitamente.
      if (!prefs || !prefs.onboarding_completed) {
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

// Agregar headers de seguridad a la respuesta final
export const onRequestAfter = defineMiddleware(async (context, next) => {
  const response = await next()
  
  // Agregar headers de seguridad si la respuesta no es un redirect
  if (response.status !== 302) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  }
  
  return response
})
