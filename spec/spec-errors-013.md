# SPEC-ERRORS-013: Manejo de errores y estados de conexión

## 1. Propósito y Alcance

**Propósito:** Proveer un sistema transversal de manejo de errores que clasifique 7 tipos de error, muestre mensajes claros al usuario según el canal adecuado (toast, inline, página dedicada), y registre detalles técnicos sin exponerlos al cliente.

**Alcance:**
- Definición de tipos AppError, UserFacingError, ErrorSeverity
- 7 tipos de error clasificados (conexión, servidor, auth, validación, rate limit, timeout, no encontrado)
- Toast con duraciones diferenciadas (3s success, 5s info, 8s error)
- Botón "Reintentar" en errores recuperables
- Errores inline en formularios (validación)
- Página 404 personalizada
- Página 500 con botones Reintentar + Volver al inicio
- `mapSupabaseError()` para traducir errores de Supabase
- `logServerError()` para registro server-side
- AppError como value object estándar en toda la app

**Fuera de alcance:**
- Monitoreo externo (Sentry, Datadog)
- Notificaciones push de errores
- Dashboard de errores para administradores
- Rate limiting server-side (se maneja en Supabase/Vercel)

---

## 2. User Stories

### US-01: Error de conexión con reintento
**As a** usuario de MicroLearn
**I want to** recibir un mensaje claro cuando pierdo conexión y poder reintentar
**So that** no pierda el contexto y pueda recuperar la operación

**Acceptance Criteria:**
- Given que mi conexión a internet se pierde
- When intento cargar datos o enviar una respuesta
- Then veo un toast "Sin conexión. Verifica tu internet." con botón "Reintentar"

### US-02: Error del servidor con reintento
**As a** usuario
**I want to** saber que el servidor falló y poder reintentar
**So that** no asuma que el problema es mío

**Acceptance Criteria:**
- Given que el servidor responde con un error interno
- When realizo una acción
- Then veo un toast "Error del servidor. Intenta de nuevo." con botón "Reintentar"
- And el servidor registra el error con `logServerError()` (code, detail, path, timestamp)

### US-03: Error de autenticación
**As a** usuario con sesión expirada
**I want to** ser notificado y redirigido al login
**So that** pueda renovar mi sesión sin confusión

**Acceptance Criteria:**
- Given que mi sesión expiró o el token es inválido
- When intento acceder a una ruta protegida o realizar una acción
- Then veo un toast "Tu sesión expiró. Inicia sesión de nuevo."
- And soy redirigido a `/login`

### US-04: Error de validación en formularios
**As a** usuario llenando un formulario
**I want to** ver errores específicos debajo de cada campo
**So that** sepa exactamente qué corregir

**Acceptance Criteria:**
- Given que estoy llenando un formulario (registro, login, onboarding)
- When envío datos inválidos
- Then veo mensajes inline debajo de cada campo
- And no se muestra toast (la validación es inline)

### US-05: Página 404 personalizada
**As a** usuario
**I want to** ver una página de error con el diseño de la app cuando navego a una URL inexistente
**So that** sepa que la página no existe y pueda volver al inicio

**Acceptance Criteria:**
- Given que navego a una URL que no existe
- When la página no se encuentra
- Then veo una página con emoji 🔍, mensaje "Página no encontrada", y botón "Volver al inicio"

### US-06: Página de error genérico 500
**As a** usuario
**I want to** ver una página de error con opciones cuando ocurre un error inesperado
**So that** pueda reintentar o volver al inicio

**Acceptance Criteria:**
- Given que ocurre un error inesperado en el servidor
- When la aplicación no puede renderizar la página
- Then veo una página con emoji ⚡, mensaje "Algo salió mal", y botones "Reintentar" y "Volver al inicio"

### US-07: Rate limiting / timeout
**As a** usuario
**I want to** saber si estoy haciendo demasiadas solicitudes o si una solicitud tardó mucho
**So that** pueda esperar o reintentar

**Acceptance Criteria:**
- Given que recibo un error 429 (rate limit)
- Then veo un toast "Demasiadas solicitudes. Espera un momento." con botón "Reintentar"
- Given que recibo un error 408 (timeout)
- Then veo un toast "La solicitud tardó demasiado. Intenta de nuevo." con botón "Reintentar"

---

## 3. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El sistema debe clasificar errores en 7 tipos: conexión, servidor, auth, validación, rate limit, timeout, no encontrado | Alta |
| RF-02 | Los errores de conexión deben mostrar toast con mensaje "Sin conexión. Verifica tu internet." y botón "Reintentar" | Alta |
| RF-03 | Los errores de servidor deben mostrar toast con mensaje "Error del servidor. Intenta de nuevo." y botón "Reintentar" | Alta |
| RF-04 | Los errores de autenticación deben mostrar toast "Tu sesión expiró. Inicia sesión de nuevo." y redirigir a `/login` | Alta |
| RF-05 | Los errores de validación deben mostrarse inline debajo del campo correspondiente, no en toast | Alta |
| RF-06 | La página 404 debe mostrar emoji 🔍, título "Página no encontrada", descripción y botón "Volver al inicio" | Alta |
| RF-07 | La página 500 debe mostrar emoji ⚡, título "Algo salió mal", botones "Reintentar" y "Volver al inicio" | Alta |
| RF-08 | Los errores rate limit deben mostrar toast "Demasiadas solicitudes. Espera un momento." con botón "Reintentar" | Alta |
| RF-09 | Los errores timeout deben mostrar toast "La solicitud tardó demasiado. Intenta de nuevo." con botón "Reintentar" | Alta |
| RF-10 | Los errores NUNCA deben mostrar stack traces, UUIDs internos o mensajes de base de datos al usuario | Alta |
| RF-11 | El sistema debe implementar `mapSupabaseError()` para traducir errores de Supabase a códigos de aplicación | Alta |
| RF-12 | El sistema debe implementar `logServerError()` para registrar errores con code, detail, path y timestamp | Alta |
| RF-13 | Los toasts deben tener duración: 3s (success), 5s (info), 8s (error) | Media |
| RF-14 | El botón "Reintentar" debe estar disponible solo en errores recuperables (conexión, servidor, timeout, rate limit) | Alta |
| RF-15 | Los errores de Supabase deben mapearse antes de mostrarse al usuario, nunca en crudo | Alta |

---

## 4. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | AppError debe ser serializable (JSON) para logs y almacenamiento | `JSON.stringify(appError)` produce objeto válido |
| RNF-02 | `mapSupabaseError()` debe cubrir todos los códigos de error conocidos de Supabase | Mapeo completo sin default a INTERNAL_ERROR |
| RNF-03 | Toasts no deben bloquear la interacción del usuario | `vue-sonner` no bloqueante por defecto |
| RNF-04 | Errores inline deben estar asociados al campo vía `aria-describedby` | WCAG SC 4.1.2 |
| RNF-05 | Las páginas de error (404, 500) deben tener `min-height: 100dvh` para evitar CLS | CLS < 0.1 |
| RNF-06 | Los mensajes de error no deben contener información técnica | Stack trace nunca en UI |
| RNF-07 | `logServerError()` debe ser invocable desde server actions y middleware | Sin dependencia de runtime específico |
| RNF-08 | El sistema debe soportar errores anidados (error dentro de error) preservando el código original | AppError.code siempre el más específico |
| RNF-09 | El toast de error debe persistir hasta que el usuario lo descarte o presione "Reintentar" | Duración 8s + acción |
| RNF-10 | La página 500 debe funcionar sin JavaScript (server-rendered) | HTML estático con botón sin JS |

---

## 5. Contratos de Interfaz (TypeScript)

### Value Objects (del DDD)

```typescript
// ---- Error Contracts ----

// 7 códigos de error clasificados
type AppErrorCode =
  | 'CONNECTION_ERROR'
  | 'SERVER_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'NOT_FOUND'

// AppError — Value object canónico
interface AppError {
  code: AppErrorCode
  message: string       // Mensaje para el usuario, sin info técnica
  detail?: string      // Detalle técnico solo para logs, nunca para UI
  path?: string        // Ruta donde ocurrió el error
  timestamp: string    // ISO 8601
}

// UserFacingError — Derivado de AppError, seguro para UI
interface UserFacingError {
  code: AppErrorCode
  message: string
}

// ErrorSeverity — Nivel de severidad
type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

// Mapa de severidad por código de error
const ERROR_SEVERITY: Record<AppErrorCode, ErrorSeverity> = {
  CONNECTION_ERROR: 'error',
  SERVER_ERROR: 'critical',
  AUTH_ERROR: 'warning',
  VALIDATION_ERROR: 'info',
  RATE_LIMIT: 'warning',
  TIMEOUT: 'error',
  NOT_FOUND: 'info',
}

// Mensajes para el usuario (nunca expuestos directamente desde el servidor)
const USER_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  CONNECTION_ERROR: 'Sin conexión. Verifica tu internet.',
  SERVER_ERROR: 'Error del servidor. Intenta de nuevo.',
  AUTH_ERROR: 'Tu sesión expiró. Inicia sesión de nuevo.',
  VALIDATION_ERROR: 'Corrige los campos marcados.',
  RATE_LIMIT: 'Demasiadas solicitudes. Espera un momento.',
  TIMEOUT: 'La solicitud tardó demasiado. Intenta de nuevo.',
  NOT_FOUND: 'El recurso solicitado no existe.',
}

// Errores recuperables (pueden tener botón Reintentar)
type RecoverableErrorCode = 'CONNECTION_ERROR' | 'SERVER_ERROR' | 'RATE_LIMIT' | 'TIMEOUT'
```

### Services

```typescript
// logServerError — Registra el error en consola/servicio de monitoreo
function logServerError(error: AppError): void {
  console.error(JSON.stringify({
    level: error.code === 'SERVER_ERROR' ? 'CRITICAL' : 'ERROR',
    timestamp: error.timestamp,
    code: error.code,
    path: error.path,
    detail: error.detail,
  }))
}

// mapSupabaseError — Traduce errores de Supabase a AppErrorCode
function mapSupabaseError(error: {
  code?: string
  status?: number
  message?: string
}): AppErrorCode {
  if (!error) return 'SERVER_ERROR'

  // Conexión
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Failed to fetch')) {
    return 'CONNECTION_ERROR'
  }

  // Autenticación
  if (error.status === 401 || error.code === 'PGRST301') return 'AUTH_ERROR'
  if (error.status === 403 || error.code === 'PGRST116') return 'AUTH_ERROR'
  if (error.status === 400 && error.message?.toLowerCase().includes('invalid login credentials')) return 'AUTH_ERROR'
  if (error.status === 400 && error.message?.toLowerCase().includes('email not confirmed')) return 'AUTH_ERROR'

  // No encontrado
  if (error.status === 404 || error.code === 'PGRST204') return 'NOT_FOUND'

  // Timeout
  if (error.status === 408) return 'TIMEOUT'

  // Rate limit
  if (error.status === 429) return 'RATE_LIMIT'

  // Validación
  if (error.status === 422 || error.status === 400) return 'VALIDATION_ERROR'

  // Default
  return 'SERVER_ERROR'
}

// createAppError — Factory
function createAppError(
  code: AppErrorCode,
  detail?: string,
  path?: string
): AppError {
  return {
    code,
    message: USER_ERROR_MESSAGES[code],
    detail,
    path,
    timestamp: new Date().toISOString(),
  }
}

// isRecoverable — Determina si un error puede tener botón Reintentar
function isRecoverable(code: AppErrorCode): code is RecoverableErrorCode {
  return ['CONNECTION_ERROR', 'SERVER_ERROR', 'RATE_LIMIT', 'TIMEOUT'].includes(code)
}

// toUserFacing — Transforma AppError a UserFacingError (seguro para UI)
function toUserFacing(error: AppError): UserFacingError {
  return { code: error.code, message: error.message }
}
```

### Domain Event

```typescript
interface ErrorOccurred {
  code: AppErrorCode
  path?: string
  userId?: string
  timestamp: string
}
```

---

## 6. Escenarios de Error

| Código | Tipo | Canal | Mensaje Usuario | Reintentar | HTTP/Supabase |
|--------|------|-------|-----------------|------------|---------------|
| ERR-01 | CONNECTION_ERROR | Toast error | "Sin conexión. Verifica tu internet." | Sí | Failed to fetch / NETWORK_ERROR |
| ERR-02 | SERVER_ERROR | Toast error | "Error del servidor. Intenta de nuevo." | Sí | 5xx / INTERNAL_ERROR |
| ERR-03 | AUTH_ERROR | Toast + Redirect /login | "Tu sesión expiró. Inicia sesión de nuevo." | No | 401 / PGRST301 |
| ERR-04 | VALIDATION_ERROR | Inline | Mensaje específico del campo | No | 422 / 400 |
| ERR-05 | RATE_LIMIT | Toast error | "Demasiadas solicitudes. Espera un momento." | Sí | 429 |
| ERR-06 | TIMEOUT | Toast error | "La solicitud tardó demasiado. Intenta de nuevo." | Sí | 408 |
| ERR-07 | NOT_FOUND | Página 404 | "Página no encontrada" | No | 404 / PGRST204 |

---

## 7. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Tasa de reintento exitoso | > 60% | Reintentos que resultan en operación exitosa / total reintentos |
| Tasa de abandono post-error | < 20% | Usuarios que cierran la app tras ver un error |
| Tiempo medio para reintentar | < 10s | Tiempo entre mostrar error y click en Reintentar |
| Cobertura de mapeo de errores | 100% | Todo error de Supabase pasa por `mapSupabaseError()` antes de UI |
| Errores sin clasificar | 0% | `logServerError()` nunca recibe un código `unknown` |
| CLS en páginas de error | < 0.1 | Lighthouse |
| Toasts mostrados vs errores reales | 1:1 | Cada error de conexión/servidor/auth produce exactamente 1 toast |
| Errores validación inline vs toast | 100% inline | Ningún error de validación aparece como toast |

---

## 8. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | createAppError(CONNECTION_ERROR) → message correcto | message = "Sin conexión. Verifica tu internet." |
| UT-02 | createAppError(SERVER_ERROR) → message correcto | message = "Error del servidor. Intenta de nuevo." |
| UT-03 | createAppError(AUTH_ERROR) → message correcto | message = "Tu sesión expiró. Inicia sesión de nuevo." |
| UT-04 | createAppError(NOT_FOUND) → message correcto | message = "El recurso solicitado no existe." |
| UT-05 | createAppError con detail y path | detail y path presentes en objeto |
| UT-06 | createAppError genera timestamp ISO | `/^\d{4}-\d{2}-\d{2}T/` |
| UT-07 | toUserFacing() elimina detail y path | Solo code + message |
| UT-08 | isRecoverable(CONNECTION_ERROR) → true | true |
| UT-09 | isRecoverable(AUTH_ERROR) → false | false |
| UT-10 | isRecoverable(VALIDATION_ERROR) → false | false |
| UT-11 | isRecoverable(NOT_FOUND) → false | false |
| UT-12 | isRecoverable(RATE_LIMIT) → true | true |
| UT-13 | isRecoverable(TIMEOUT) → true | true |
| UT-14 | isRecoverable(SERVER_ERROR) → true | true |
| UT-15 | mapSupabaseError(401) → AUTH_ERROR | AUTH_ERROR |
| UT-16 | mapSupabaseError(403) → AUTH_ERROR | AUTH_ERROR |
| UT-17 | mapSupabaseError(404) → NOT_FOUND | NOT_FOUND |
| UT-18 | mapSupabaseError(408) → TIMEOUT | TIMEOUT |
| UT-19 | mapSupabaseError(429) → RATE_LIMIT | RATE_LIMIT |
| UT-20 | mapSupabaseError(422) → VALIDATION_ERROR | VALIDATION_ERROR |
| UT-21 | mapSupabaseError("NETWORK_ERROR") → CONNECTION_ERROR | CONNECTION_ERROR |
| UT-22 | mapSupabaseError("Failed to fetch") → CONNECTION_ERROR | CONNECTION_ERROR |
| UT-23 | mapSupabaseError(500) → SERVER_ERROR | SERVER_ERROR |
| UT-24 | mapSupabaseError(null) → SERVER_ERROR | SERVER_ERROR |
| UT-25 | logServerError() output contiene level, timestamp, code, path, detail | JSON.stringify válido |
| UT-26 | ERROR_SEVERITY[SERVER_ERROR] → 'critical' | critical |
| UT-27 | ERROR_SEVERITY[VALIDATION_ERROR] → 'info' | info |
| UT-28 | ERROR_SEVERITY[NOT_FOUND] → 'info' | info |
| UT-29 | ERROR_SEVERITY[CONNECTION_ERROR] → 'error' | error |
| UT-30 | ERROR_SEVERITY[RATE_LIMIT] → 'warning' | warning |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | ToastError.vue recibe AppError CONNECTION_ERROR → muestra mensaje + botón | Toast visible con texto y botón |
| IT-02 | ToastError.vue recibe AppError AUTH_ERROR → muestra mensaje + redirect a /login | Toast + window.location = '/login' |
| IT-03 | InlineError.vue recibe mensaje → se renderiza debajo del campo | DOM contiene mensaje |
| IT-04 | InlineError.vue con aria-describedby vinculado al input | WCAG validación pasa |
| IT-05 | Click en "Reintentar" → ejecuta callback proporcionado | Función invocada |
| IT-06 | Error de servidor en action de Astro → logServerError se llama | Log en consola server |
| IT-07 | Error de Supabase en action → pasa por mapSupabaseError antes de responder | Código mapeado |
| IT-08 | 404 en ruta inexistente → renderiza 404.astro | Página con 🔍 y "Volver al inicio" |
| IT-09 | 500 en server → renderiza 500.astro | Página con ⚡ y "Reintentar" + "Volver al inicio" |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Simular desconexión de red → toast "Sin conexión" + botón Reintentar | Toast visible |
| E2E-02 | Navegar a URL inexistente → página 404 | 🔍 + "Volver al inicio" |
| E2E-03 | Enviar formulario con datos inválidos → error inline en cada campo | Mensajes debajo de campos |
| E2E-04 | Sesión expirada → toast + redirect a /login | Redirección ocurre |
| E2E-05 | Click "Reintentar" en toast → operación se re-ejecuta | Función callback invocada |
| E2E-06 | Clic en "Volver al inicio" en 404 → navega a /dashboard | URL cambia |
| E2E-07 | Clic en "Reintentar" en 500 → recarga la página | Page reload |

### Pruebas de Seguridad

| ID | Caso | Expected |
|----|------|----------|
| SEC-01 | Error de servidor no expone stack trace en HTML | Sin `at `, `Error:`, `node_modules` en respuesta |
| SEC-02 | Error de Supabase no expone detalle interno en UI | Mensaje genérico siempre |
| SEC-03 | mapSupabaseError nunca retorna el mensaje original como user-facing | toUserFacing() filtra detail |
| SEC-04 | 500.astro no renderiza información sensible | HTML solo contiene ⚡ y texto estático |
