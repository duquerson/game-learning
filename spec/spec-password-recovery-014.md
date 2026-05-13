# SPEC-PWR-014: Recuperación de Contraseña

## 1. Propósito y Alcance

**Propósito:** Permitir que usuarios de MicroLearn que olvidaron su contraseña recuperen el acceso a su cuenta mediante un flujo de email con link único y temporal, sin perder su progreso (puntos, rachas, insignias).

**Alcance:**
- Enlace "¿Olvidaste tu contraseña?" en la página de login
- Formulario de solicitud de recuperación (ingreso de email)
- Envío de email con link único y temporal vía Supabase Auth
- Página `/reset-password` con formulario de nueva contraseña
- Validación de contraseña: 8+ chars, 1 mayúscula, 1 minúscula, 1 número
- Confirmación de contraseña (campo duplicado)
- Manejo de link expirado o inválido
- Mensaje genérico anti-enumeración de emails
- Redirección post-reset a `/login`

**Fuera de alcance:**
- Recuperación vía SMS o códigos de respaldo
- Preguntas de seguridad
- Autenticación multifactor (MFA)
- Magic links para login

---

## 2. User Story

### US-PWR-01: Recuperación completa de contraseña
**As a** usuario que olvidó su contraseña
**I want to** solicitar un email con un link de recuperación, crear una nueva contraseña (8+ chars, mayúscula, minúscula, número) confirmándola, y luego iniciar sesión con la nueva contraseña
**So that** pueda recuperar el acceso a mi cuenta sin perder mi progreso

**Acceptance Criteria:**
- **Scenario 1:** Dado que estoy en `/login` y olvidé mi contraseña, cuando hago clic en "¿Olvidaste tu contraseña?", ingreso mi email y envío, entonces veo "Si el email existe, recibirás instrucciones..." (mensaje genérico independientemente de si el email existe).
- **Scenario 2:** Dado que solicité recuperación y mi email está registrado, cuando el sistema procesa la solicitud, entonces recibo un email con link único y temporal para restablecer.
- **Scenario 3:** Dado que recibí el email y hago clic en el link (a `/reset-password`), cuando ingreso nueva contraseña válida y la confirmo, entonces mi contraseña se actualiza, veo mensaje de éxito y soy redirigido a `/login`.
- **Scenario 4:** Dado que estoy en `/reset-password`, cuando intento usar contraseña que no cumple requisitos, entonces veo errores inline y no se actualiza.
- **Scenario 5:** Dado que estoy en `/reset-password`, cuando los campos no coinciden, entonces veo error "Las contraseñas no coinciden".
- **Scenario 6:** Dado que uso un link expirado o inválido, cuando intento resetear, entonces veo "El enlace ha expirado o no es válido" con botón "Volver al inicio de sesión".

---

## 3. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El sistema debe mostrar un enlace "¿Olvidaste tu contraseña?" en la página de login | Alta |
| RF-02 | El sistema debe mostrar un formulario para ingresar el email de recuperación | Alta |
| RF-03 | El sistema debe mostrar un mensaje genérico "Si el email existe, recibirás instrucciones..." independientemente de si el email está registrado | Alta |
| RF-04 | El sistema debe enviar un email con link único y temporal vía Supabase Auth cuando el email existe | Alta |
| RF-05 | El sistema debe proporcionar una ruta pública `/reset-password` accesible desde el link del email | Alta |
| RF-06 | El sistema debe extraer el token de recuperación del hash de la URL (`#access_token=...`) | Alta |
| RF-07 | El sistema debe validar que la nueva contraseña cumpla: 8+ chars, 1 mayúscula, 1 minúscula, 1 número | Alta |
| RF-08 | El sistema debe requerir un campo de confirmación de contraseña que coincida exactamente | Alta |
| RF-09 | El sistema debe mostrar errores inline por cada requisito de contraseña incumplido | Alta |
| RF-10 | El sistema debe mostrar error "Las contraseñas no coinciden" si confirmación difiere | Alta |
| RF-11 | El sistema debe actualizar la contraseña en Supabase Auth mediante `supabase.auth.updateUser` | Alta |
| RF-12 | El sistema debe redirigir a `/login` tras actualizar la contraseña exitosamente | Alta |
| RF-13 | El sistema debe mostrar mensaje de error "El enlace ha expirado o no es válido" con botón "Volver al inicio de sesión" si el token es inválido | Alta |
| RF-14 | El sistema debe mantener la sesión existente hasta que se cambie la contraseña | Media |
| RF-15 | El sistema debe limpiar el hash de la URL después de extraer el token | Media |

---

## 4. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | El mensaje de éxito tras solicitar recuperación debe ser genérico (no revelar si el email existe) | OWASP A05 — Prevención de enumeración |
| RNF-02 | El token de recuperación debe expirar (default Supabase: 1 hora) | Seguridad |
| RNF-03 | El link de recovery debe usar hash de URL (`#access_token=`) y no query params | Seguridad (no logged en servidor) |
| RNF-04 | Validación de contraseña en servidor (Zod) y cliente (doble capa) | Defensa en profundidad |
| RNF-05 | La página `/reset-password` no requiere sesión activa (ruta pública) | UX |
| RNF-06 | CSP headers deben bloquear scripts inline no autorizados en `/reset-password` | Seguridad |
| RNF-07 | Rate limiting en solicitudes de recuperación (Supabase maneja 429) | Prevención de abuso |
| RNF-08 | Tiempo de respuesta de `auth.resetPassword` y `auth.updatePassword` < 2s (p95) | UX |
| RNF-09 | CLS en página `/reset-password` < 0.1 (min-height en contenedor) | Core Web Vitals |
| RNF-10 | El formulario de reset debe mantener proporción de aspecto estable para evitar layout shift | CLS < 0.1 |

---

## 5. Contratos de Interfaz (TypeScript)

### Value Objects (DDD)

```typescript
// ---- Password Recovery Contracts ----

// Value Objects
type Email = string // validated: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type Password = string // validated: 8+ chars, 1 upper, 1 lower, 1 digit, 1 special (@$!%*?&)
type UserId = string // UUID v4
type ResetToken = string // JWT generado por Supabase Auth (no por la app)
type ResetLink = string // URL: {origin}/reset-password#access_token={token}

// NewPassword — Value Object con validación explícita
interface NewPassword {
  password: Password
  confirmPassword: Password
}

// Domain Events
interface PasswordRecoveryRequested {
  email: Email
  timestamp: string // ISO 8601
}

interface PasswordUpdated {
  userId: UserId
  timestamp: string
}
```

### Action Inputs (astro:actions contract)

```typescript
interface ResetPasswordInput {
  email: Email
}

interface UpdatePasswordInput {
  password: Password
}
```

### Action Outputs

```typescript
interface ResetPasswordOutput {
  success: true
}

interface UpdatePasswordOutput {
  success: true
  redirect: '/login'
}

interface PasswordRecoveryError {
  success: false
  error: AppErrorCode
  message: string
}
```

### Error Codes (reutiliza AppErrorCode de AUTH-001)

```typescript
type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
```

### Zod Schemas (server-side)

```typescript
// En actions/index.ts
const resetPasswordSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
})

const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
})
```

---

## 6. Escenarios de Error

| Código | Escenario | Mensaje Usuario | Acción |
|--------|-----------|-----------------|--------|
| PWR-ERR-01 | Email inválido en formulario de solicitud | "Ingresa un email válido." | Client-side validation |
| PWR-ERR-02 | Contraseña < 8 caracteres | "La contraseña debe tener al menos 8 caracteres." | Zod validation |
| PWR-ERR-03 | Contraseña sin mayúscula | "Debe tener al menos una mayúscula." | Zod validation |
| PWR-ERR-04 | Contraseña sin minúscula | "Debe tener al menos una minúscula." | Zod validation |
| PWR-ERR-05 | Contraseña sin número | "Debe tener al menos un número." | Zod validation |
| PWR-ERR-06 | Contraseñas no coinciden | "Las contraseñas no coinciden." | Client-side validation |
| PWR-ERR-07 | Link expirado o inválido | "El enlace ha expirado o no es válido. Solicita uno nuevo." | Supabase error → UI |
| PWR-ERR-08 | Rate limit exceeded | "Demasiadas solicitudes. Espera un momento." | Supabase 429 |
| PWR-ERR-09 | Error de red | "No se pudo conectar. Verifica tu conexión." | Catch en fetch |
| PWR-ERR-10 | Token no presente en URL | "Enlace inválido. Solicita uno nuevo." | Client-side check |

---

## 7. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Tasa de recuperación exitosa | > 70% | Reset completado / solicitudes de reset |
| Tasa de abandono en formulario de reset | < 30% | Sesiones en `/reset-password` que no completan |
| Tiempo de envío de email (p95) | < 5s | Server timing |
| Tiempo de actualización de password (p95) | < 2s | Server timing |
| CLS en `/reset-password` | < 0.1 | Lighthouse / Web Vitals |
| Friction Score (flujo completo) | ≤ 3/10 | Taps + campos para completar recuperación |

---

## 8. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | Zod valida email correcto en resetPasswordSchema | Pass |
| UT-02 | Zod rechaza email sin @ en resetPasswordSchema | Fail |
| UT-03 | Zod valida password 8+ chars + mayúscula + minúscula + número | Pass |
| UT-04 | Zod rechaza password < 8 chars | Fail |
| UT-05 | Zod rechaza password sin mayúscula | Fail |
| UT-06 | Zod rechaza password sin minúscula | Fail |
| UT-07 | Zod rechaza password sin número | Fail |
| UT-08 | Zod acepta password con caracteres especiales (opcional) | Pass |
| UT-09 | mapSupabaseError con 429 en reset → RATE_LIMIT | Código correcto |
| UT-10 | mapSupabaseError con error de token expirado → SESSION_EXPIRED | Código correcto |
| UT-11 | Extracción de token desde URL hash | Token string correcto |
| UT-12 | URL sin hash retorna null | null |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | Reset password con email válido → success | true, email enviado |
| IT-02 | Reset password con email no registrado → success (genérico) | true, no se envía email |
| IT-03 | Update password con token válido → redirect a /login | 302 |
| IT-04 | Update password con token expirado → error | AuthError mensaje |
| IT-05 | Update password sin token en URL → error | Error "Enlace inválido" |
| IT-06 | Acceso a `/reset-password` sin hash → formulario visible (modo inválido) | UI muestra error |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Click en "¿Olvidaste tu contraseña?" desde `/login` → formulario email visible | Transición suave |
| E2E-02 | Envío de email de recuperación → toast éxito | Toast "Revisa tu email" |
| E2E-03 | Navegación directa a `/reset-password` → formulario de nueva contraseña | Formulario renderizado |
| E2E-04 | Reset con contraseña débil → errores inline por cada regla | 3+ mensajes visibles |
| E2E-05 | Confirmación no coincide → error "Las contraseñas no coinciden" | Error inline visible |
| E2E-06 | Reset exitoso → redirect a `/login` + toast | URL cambia a /login |
| E2E-07 | Link expirado → mensaje error + botón "Volver al inicio de sesión" | UI de error con botón |

### Pruebas de Seguridad

| ID | Caso | Expected |
|----|------|----------|
| SEC-01 | Respuesta de reset password no revela si email existe | Mismo mensaje ambos casos |
| SEC-02 | Token de recovery solo en hash URL (no query params) | No en `?access_token=` |
| SEC-03 | CSP bloquea scripts inline en página `/reset-password` | No errors de CSP |
| SEC-04 | Rate limit en solicitudes de reset (múltiples intentos) | 429 después de N intentos |
| SEC-05 | Token recovery expira después de 1 hora | Supabase configuración |
