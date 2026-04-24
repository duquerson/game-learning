import { GENERIC_USER_ERROR_MESSAGE } from './user-error'

export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'
  | 'SESSION_EXPIRED'

export interface AppError {
  code: AppErrorCode
  message: string
  detail?: string
  timestamp: string
  path?: string
}

export const USER_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  UNAUTHORIZED: GENERIC_USER_ERROR_MESSAGE,
  FORBIDDEN: GENERIC_USER_ERROR_MESSAGE,
  NOT_FOUND: GENERIC_USER_ERROR_MESSAGE,
  VALIDATION_ERROR: GENERIC_USER_ERROR_MESSAGE,
  NETWORK_ERROR: GENERIC_USER_ERROR_MESSAGE,
  INTERNAL_ERROR: GENERIC_USER_ERROR_MESSAGE,
  SESSION_EXPIRED: GENERIC_USER_ERROR_MESSAGE,
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
  return 'INTERNAL_ERROR'
}
