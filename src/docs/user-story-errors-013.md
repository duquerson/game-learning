# User Story ERR-013: Manejo de errores y estados de conexión

- **Summary:** Errores manejados con 7 tipos clasificados, mostrados en toast + inline + páginas dedicadas (404, 500), con opción de reintentar

## Use Case:
- **As a** usuario de MicroLearn
- **I want to** recibir mensajes de error claros y contextuales cuando algo falla (conexión, servidor, auth, validación, rate limit, timeout, no encontrado), con opción de reintentar cuando sea posible, sin información técnica visible
- **so that** pueda entender qué pasó y cómo solucionarlo sin frustrarme ni exponerme a detalles internos

## Acceptance Criteria:

### Scenario 1: Error de conexión con reintento
- **Given** que estoy usando la aplicación
- **and Given** mi conexión a internet se pierde
- **When** intento cargar datos o enviar una respuesta
- **Then** veo un toast con el mensaje "Sin conexión. Verifica tu internet." y un botón "Reintentar"

### Scenario 2: Error del servidor (500) con reintento
- **Given** que estoy usando la aplicación
- **and Given** el servidor responde con un error interno
- **When** realizo una acción
- **Then** veo un toast con "Error del servidor. Intenta de nuevo." y botón "Reintentar". En la consola del servidor se registra el error con código, detalle y timestamp (sin exponer al cliente)

### Scenario 3: Error de autenticación
- **Given** que mi sesión expiró o el token es inválido
- **When** intento acceder a una ruta protegida o realizar una acción
- **Then** veo un toast "Tu sesión expiró. Inicia sesión de nuevo." y soy redirigido a `/login`

### Scenario 4: Error de validación en formularios
- **Given** que estoy llenando un formulario (registro, login, onboarding)
- **When** envío datos inválidos
- **Then** veo mensajes de error inline debajo de cada campo específico, indicando exactamente qué corregir

### Scenario 5: Página 404 personalizada
- **Given** que navego a una URL que no existe
- **When** la página no se encuentra
- **Then** veo una página diseñada con el estilo de la app, mensaje "Página no encontrada", un emoji ilustrativo, y un botón "Volver al inicio"

### Scenario 6: Página de error genérico (500)
- **Given** que ocurre un error inesperado en el servidor
- **When** la aplicación no puede renderizar la página
- **Then** veo una página de error genérico con el diseño de la app, mensaje "Algo salió mal", y botones "Reintentar" y "Volver al inicio"

### Scenario 7: Rate limiting / timeout
- **Given** que estoy haciendo muchas solicitudes rápidas
- **and Given** el servidor limita la tasa de solicitudes
- **When** recibo un error 429 (rate limit) o 408 (timeout)
- **Then** veo un toast "Demasiadas solicitudes. Espera un momento." o "La solicitud tardó demasiado. Intenta de nuevo." con botón "Reintentar"

## Validaciones adicionales
- Los errores NUNCA muestran stack traces, UUIDs internos o mensajes de base de datos al usuario
- Los errores del servidor se registran con `logServerError()` con código, detalle, path y timestamp
- Los errores de Supabase se mapean a códigos de aplicación con `mapSupabaseError()` antes de mostrarse
- Toasts con duración: 5s (info), 8s (error), 3s (success)
- Botón "Reintentar" disponible en errores recuperables (conexión, servidor, timeout, rate limit)
- Errores de validación son inline, no en toast

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario se sienta seguro y no abandone la app cuando ocurre un error.

### Behavioral Barriers Removed
- **Uncertainty aversion**: Mensajes claros sin jerga técnica reducen la ansiedad de "¿qué pasó?"
- **Fear of data loss**: Botón "Reintentar" da sensación de control y recuperación

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Reducir fricción** | Botón "Reintentar" = 1 clic para resolver, no tener que navegar de nuevo |
| **Feedback inmediato** | Toasts aparecen sin recargar la página |
| **Transparencia controlada** | Mensajes claros pero sin exponer implementación interna |
| **Defaults** | Errores de validación inline guían al usuario a la solución |

### Friction Score: 0/10 (el error es la fricción; el manejo debe reducirla al mínimo)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`ErrorHandling` — Contexto transversal que aplica a toda la aplicación. No es un bounded context de dominio sino un cross-cutting concern.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| AppError | Tipo de error estándar con code, message, detail, path, timestamp |
| Toast | Notificación temporal no bloqueante |
| Error inline | Mensaje de error junto a un campo específico del formulario |
| Reintentar | Acción del usuario para repetir la operación fallida |

### Value Objects
- `AppError` — Value object que encapsula todos los errores de la aplicación:
  - `code`: string (CONNECTION_ERROR | SERVER_ERROR | AUTH_ERROR | VALIDATION_ERROR | RATE_LIMIT | TIMEOUT | NOT_FOUND)
  - `message`: string (mensaje para el usuario, sin info técnica)
  - `detail`: string (detalle técnico solo para logs, nunca para UI)
  - `path`: string (ruta donde ocurrió el error)
  - `timestamp`: string (ISO)
- `UserFacingError` — Value object derivado de AppError, seguro para mostrar al usuario (solo message + code)
- `ErrorSeverity` — Value object enum (info | warning | error | critical)

### Services
- `logServerError(err: AppError): void` — Registra el error en consola/servicio de monitoreo
- `mapSupabaseError(error: SupabaseError): AppErrorCode` — Mapea errores de Supabase a códigos de aplicación
- `createAppError(code, detail, path): AppError` — Factory para crear errores estandarizados

### Domain Events
- `ErrorOccurred` — Ocurre cuando se produce un error. Datos: code, path, userId, timestamp. Puede usarse para monitoreo y alertas.

### Anti-Patterns Evitados
- ❌ Exponer stack traces al usuario → Mensajes limpios sin info técnica
- ❌ Errores genéricos sin acción → Botón "Reintentar" cuando es posible
- ❌ Logs sin contexto → `logServerError()` registra code + detail + path + timestamp
- ❌ Errores de Supabase sin mapear → `mapSupabaseError()` traduce a códigos de aplicación
