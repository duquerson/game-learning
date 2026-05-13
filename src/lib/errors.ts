import { GENERIC_USER_ERROR_MESSAGE } from './user-error'

export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT'
  | 'TIMEOUT'

export interface AppError {
  code: AppErrorCode
  message: string
  detail?: string
  timestamp: string
  path?: string
}

export const USER_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  UNAUTHORIZED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  FORBIDDEN: GENERIC_USER_ERROR_MESSAGE,
  NOT_FOUND: GENERIC_USER_ERROR_MESSAGE,
  VALIDATION_ERROR: GENERIC_USER_ERROR_MESSAGE,
  NETWORK_ERROR: 'Sin conexión. Verifica tu internet.',
  INTERNAL_ERROR: GENERIC_USER_ERROR_MESSAGE,
  SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  RATE_LIMIT: 'Demasiadas solicitudes. Espera un momento.',
  TIMEOUT: 'La solicitud tardó demasiado. Intenta de nuevo.',
}

export function createAppError(code: AppErrorCode, detail?: string, path?: string): AppError {
  return { code, message: USER_ERROR_MESSAGES[code], detail, timestamp: new Date().toISOString(), path }
}

export function logServerError(error: AppError): void {
  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp: error.timestamp,
    code: error.code,
    path: error.path,
    detail: error.detail,
  }))
}

export function mapSupabaseError(error: { code?: string; status?: number; message?: string }): AppErrorCode {
  if (error.status === 401 || error.code === 'PGRST301') return 'UNAUTHORIZED'
  if (error.status === 403 || error.code === 'PGRST116') return 'FORBIDDEN'
  if (error.status === 404 || error.code === 'PGRST204') return 'NOT_FOUND'
  if (error.status === 408) return 'TIMEOUT'
  if (error.status === 429) return 'RATE_LIMIT'
  // 400 con mensaje de credenciales inválidas → UNAUTHORIZED (no INTERNAL_ERROR)
  if (error.status === 400 && error.message?.toLowerCase().includes('invalid login credentials')) return 'UNAUTHORIZED'
  if (error.status === 400 && error.message?.toLowerCase().includes('email not confirmed')) return 'UNAUTHORIZED'
  return 'INTERNAL_ERROR'
}
