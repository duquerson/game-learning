# SPEC-AUTH-001: Autenticación (Login/Register)

## 1. Propósito y Alcance

**Propósito:** Permitir que visitantes nuevos y usuarios recurrentes accedan al contenido de MicroLearn mediante registro con email+password o autenticación OAuth (Google/GitHub), con soporte para recuperación de contraseña.

**Alcance:**
- Registro con email + password con validación estricta
- Inicio de sesión con email + password
- Inicio de sesión con OAuth (Google, GitHub)
- Recuperación de contraseña vía email
- Manejo de sesión SSR con cookies httpOnly
- Protección de rutas (middleware)
- Redirección post-auth condicional (onboarding vs dashboard)
- Callback OAuth
- Cierre de sesión (cliente + servidor)

**Fuera de alcance:**
- Registro con magic link
- Autenticación multifactor (MFA)
- Roles y permisos avanzados
- SSO empresarial

---

## 2. User Stories

### US-01: Registro exitoso con email
**As a** visitante nuevo de MicroLearn
**I want to** registrarme con email y una contraseña segura
**So that** pueda crear mi cuenta y acceder al contenido

**Acceptance Criteria:**
- Given que estoy en `/register`
- When ingreso un email válido y password (8+ chars, 1 mayúscula, 1 minúscula, 1 número, 1 especial)
- Then se crea la cuenta y soy redirigido a `/onboarding`

### US-02: Login exitoso con email
**As a** usuario recurrente
**I want to** iniciar sesión con mi email y contraseña
**So that** acceda a mi dashboard

**Acceptance Criteria:**
- Given que estoy en `/login`
- When ingreso credenciales correctas
- Then inicio sesión y soy redirigido a `/dashboard` (o `/onboarding` si primera vez)

### US-03: Login con OAuth
**As a** usuario con cuenta Google/GitHub
**I want to** iniciar sesión sin crear una contraseña
**So that** evite fricción y recuerde una credencial más

**Acceptance Criteria:**
- Given que estoy en `/login`
- When hago clic en "Continuar con Google/GitHub" y autorizo
- Then inicio sesión automáticamente vía OAuth callback

### US-04: Recuperación de contraseña
**As a** usuario que olvidó su contraseña
**I want to** recibir instrucciones para restablecerla
**So that** pueda recuperar el acceso a mi cuenta

**Acceptance Criteria:**
- Given que estoy en `/login`
- When hago clic en "Olvidé mi contraseña", ingreso mi email y envío
- Then recibo un email con instrucciones para restablecer mi contraseña

### US-05: Validación rechaza datos inválidos
**As a** visitante
**I want to** recibir feedback inmediato si mis datos no son válidos
**So that** sepa exactamente qué corregir

**Acceptance Criteria:**
- Given que estoy en `/register`
- When intento registrarme con email inválido o password que no cumple requisitos
- Then veo mensajes de error claros y no se crea la cuenta

---

## 3. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El sistema debe permitir registro con email + password | Alta |
| RF-02 | El password debe cumplir: 8+ chars, 1 mayúscula, 1 minúscula, 1 número, 1 especial | Alta |
| RF-03 | El sistema debe validar email con formato estándar | Alta |
| RF-04 | El sistema debe permitir login con email + password | Alta |
| RF-05 | El sistema debe soportar OAuth con Google | Alta |
| RF-06 | El sistema debe soportar OAuth con GitHub | Alta |
| RF-07 | El sistema debe permitir recuperación de contraseña vía email | Alta |
| RF-08 | El sistema debe redirigir al onboarding tras registro exitoso | Alta |
| RF-09 | El sistema debe redirigir al dashboard tras login si onboarding completado | Alta |
| RF-10 | El sistema debe redirigir al onboarding tras login si primera vez | Alta |
| RF-11 | Las rutas protegidas deben redirigir a `/login` si no hay sesión | Alta |
| RF-12 | Las rutas `/login` y `/register` deben redirigir a `/dashboard` si ya hay sesión | Alta |
| RF-13 | El sistema debe persistir la sesión al recargar la página | Alta |
| RF-14 | El sistema debe permitir cerrar sesión (cliente + servidor) | Alta |
| RF-15 | El sistema debe manejar el callback OAuth intercambiando code por session | Alta |
| RF-16 | El sistema debe actualizar la contraseña desde el formulario de reset | Media |

## 4. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | Sesión manejada con cookies httpOnly + Secure + SameSite=Lax | OWASP A02/A07 |
| RNF-02 | Tiempo de respuesta de acciones auth < 2s (p95) | Lighthouse |
| RNF-03 | Validación en servidor y cliente (defensa en profundidad) | Double validation |
| RNF-04 | Errores de autenticación no exponen detalles internos | OWASP A05 |
| RNF-05 | CSP headers configurados en astro.config | Security |
| RNF-06 | Blobs decorativos no afectan CLS (position fixed) | CLS < 0.1 |
| RNF-07 | min-height en contenedores auth evita CLS en hidratación Vue | CLS < 0.1 |
| RNF-08 | Sesión no expuesta al cliente (solo anon key) | OWASP A05 |
| RNF-09 | Validación SSRF en URL de Supabase | OWASP A10 |
| RNF-10 | Tokens de sesión auto-refrescados (autoRefreshToken: true) | UX |

---

## 5. Contratos de Interfaz (TypeScript)

### Value Objects (del DDD)

```typescript
// ---- Auth Contracts ----

// Value Objects
type Email = string // validated: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type Password = string // validated: 8+ chars, 1 upper, 1 lower, 1 digit, 1 special
type UserId = string // UUID v4

// Domain Events
interface UserRegistered {
  userId: UserId
  email: Email
  timestamp: string // ISO 8601
}

interface UserLoggedIn {
  userId: UserId
  method: 'email' | 'oauth'
  timestamp: string
}

interface PasswordRecoveryRequested {
  email: Email
  timestamp: string
}

// Action Inputs (astro:actions contract)
interface LoginInput {
  email: Email
  password: string
}

interface RegisterInput {
  email: Email
  password: Password
}

interface ResetPasswordInput {
  email: Email
}

interface UpdatePasswordInput {
  password: Password
}

// Action Outputs
interface LoginOutput {
  success: true
  redirect: '/dashboard' | '/onboarding'
}

interface RegisterOutput {
  success: true
  redirect: '/onboarding'
}

interface LogoutOutput {
  success: true
  redirect: '/login'
}

interface ResetPasswordOutput {
  success: true
}

interface UpdatePasswordOutput {
  success: true
  redirect: '/login'
}

interface AuthError {
  success: false
  error: AppErrorCode
  message: string
}

// Error codes
type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT'
  | 'TIMEOUT'

interface AppError {
  code: AppErrorCode
  message: string
  detail?: string
  timestamp: string
  path?: string
}
```

### Zod Schemas (server-side validation)

```typescript
// En actions/index.ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener al menos un carácter especial'),
})
```

---

## 6. Escenarios de Error

| Código | Escenario | Mensaje Usuario | HTTP/Acción |
|--------|-----------|-----------------|-------------|
| ERR-01 | Email inválido en registro | "Ingresa un email válido." | Validation error client-side |
| ERR-02 | Password muy corta | "La contraseña debe tener al menos 8 caracteres." | Zod validation |
| ERR-03 | Password sin mayúscula | "Debe tener al menos una mayúscula." | Zod validation |
| ERR-04 | Password sin número | "Debe tener al menos un número." | Zod validation |
| ERR-05 | Email duplicado | "El email puede estar en uso." | Supabase 400 |
| ERR-06 | Credenciales incorrectas | "Email o contraseña incorrectos." | Supabase 400 → UNAUTHORIZED |
| ERR-07 | Sesión expirada | "Tu sesión expiró. Inicia sesión de nuevo." | Middleware redirect |
| ERR-08 | Error de red | "No se pudo conectar. Verifica tu conexión." | Catch en fetch |
| ERR-09 | Rate limit | "Demasiadas solicitudes. Espera un momento." | Supabase 429 |
| ERR-10 | OAuth falla | "Error al iniciar sesión. Inténtalo de nuevo." | OAuth error genérico |
| ERR-11 | Reset token expirado | "El enlace puede haber expirado." | Supabase error |
| ERR-12 | Passwords no coinciden | "Las contraseñas no coinciden." | Client-side validation |
| ERR-13 | Ruta protegida sin sesión | Redirect a `/login` sin mensaje | Middleware 302 |

---

## 7. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Tasa de conversión registro → onboarding | > 80% | Ratio registros exitosos / visitas a `/register` |
| Tasa de login exitoso | > 90% | Ratio login exitoso / intentos de login |
| Tasa de uso OAuth vs email | > 40% OAuth | Provider en evento UserLoggedIn |
| Tasa de recuperación exitosa | > 70% | Reset completado / solicitudes de reset |
| Friction Score (email) | ≤ 3/10 | Taps + campos para completar registro |
| Friction Score (OAuth) | ≤ 1/10 | Clicks para completar OAuth |
| Tasa de abandono en registro | < 30% | Sesiones en `/register` que no completan |
| CLS en páginas auth | < 0.1 | Lighthouse / Web Vitals |
| Tiempo de login (p95) | < 2s | Server timing + RUM |

---

## 8. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | Zod valida email correcto | Pass |
| UT-02 | Zod rechaza email sin @ | Fail con mensaje |
| UT-03 | Zod rechaza password < 8 chars | Fail |
| UT-04 | Zod rechaza password sin mayúscula | Fail |
| UT-05 | Zod rechaza password sin número | Fail |
| UT-06 | Zod rechaza password sin especial | Fail |
| UT-07 | mapSupabaseError con 401 → UNAUTHORIZED | Código correcto |
| UT-08 | mapSupabaseError con 400 + "invalid login credentials" → UNAUTHORIZED | Código correcto |
| UT-09 | mapSupabaseError con 429 → RATE_LIMIT | Código correcto |
| UT-10 | isProtectedRoute('/dashboard') → true | Booleano |
| UT-11 | isProtectedRoute('/login') → false | Booleano |
| UT-12 | isAuthRoute('/login') → true | Booleano |
| UT-13 | isAllowedSupabaseUrl valida HTTPS | true |
| UT-14 | isAllowedSupabaseUrl rechaza HTTP no local | false |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | Login con credenciales válidas → redirect + cookie | 302 + Set-Cookie |
| IT-02 | Login con credenciales inválidas → error | AuthError |
| IT-03 | Registro con datos válidos → redirect a /onboarding | 302 |
| IT-04 | Registro con email existente → error | mensaje genérico |
| IT-05 | Acceso a /dashboard sin sesión → redirect a /login | 302 |
| IT-06 | Acceso a /login con sesión activa → redirect a /dashboard | 302 |
| IT-07 | Logout → elimina cookie + redirect a /login | 302 + Set-Cookie vacía |
| IT-08 | OAuth callback sin code → redirect a /login | 302 |
| IT-09 | Reset password con email válido → success | true |
| IT-10 | Update password desde reset → redirect a /login | 302 |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Flujo completo registro → onboarding → dashboard | Navegación correcta |
| E2E-02 | Flujo login → dashboard | Dashboard visible |
| E2E-03 | Validación en tiempo real email inválido | Toast error |
| E2E-04 | Sesión persistente tras recarga | Sigue logueado |
| E2E-05 | Cerrar sesión → no puede acceder a dashboard | Redirect a /login |
| E2E-06 | OAuth Google redirige a proveedor | URL contiene accounts.google.com |
| E2E-07 | Recuperación de contraseña muestra toast éxito | Toast visible |
| E2E-08 | Registro con password débil muestra error | Toast visible |

### Pruebas de Seguridad

| ID | Caso | Expected |
|----|------|----------|
| SEC-01 | Cookie de sesión marcada httpOnly | true |
| SEC-02 | Cookie de sesión marcada Secure (prod) | true |
| SEC-03 | Cookie de sesión SameSite=Lax | true |
| SEC-04 | Respuesta incluye X-Content-Type-Options: nosniff | Header presente |
| SEC-05 | Respuesta incluye X-Frame-Options: DENY | Header presente |
| SEC-06 | Respuesta incluye X-XSS-Protection | Header presente |
| SEC-07 | SUPABASE_URL no expuesta al cliente | No en PUBLIC_ |
| SEC-08 | Error de login no expone detalle interno | Mensaje genérico |
| SEC-09 | Logout invalida sesión en servidor | Cookie eliminada |
