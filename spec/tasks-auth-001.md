# TASKS-AUTH-001: Tareas de Implementación

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas

---

## Lote 1: Infraestructura Base (sin dependencias)

### TASK-1.1: Configurar Supabase Auth

| Campo | Valor |
|-------|-------|
| **Descripción** | Habilitar Email/Password + Google + GitHub en Supabase Dashboard. Configurar redirect URLs para auth callback en local y producción. |
| **Criterio** | Proveedores OAuth activos, redirect URLs configuradas |
| **Verificar** | Navegar a Supabase Dashboard → Authentication → Providers |
| **Estimación** | 1h |
| **Archivos** | — (configuración externa en Supabase) |

### TASK-1.2: Variables de Entorno

| Campo | Valor |
|-------|-------|
| **Descripción** | Configurar `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` en `.env` local y en Vercel/Doppler. |
| **Criterio** | Variables disponibles en servidor y cliente según corresponda |
| **Verificar** | `import.meta.env.SUPABASE_URL` no es placeholder |
| **Estimación** | 1h |
| **Archivos** | `.env`, `doppler.yaml`, Vercel dashboard |

---

## Lote 2: Cliente Supabase SSR (depende de Lote 1)

### TASK-2.1: Crear cliente Supabase SSR

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar `createSupabaseClient` con `@supabase/ssr` usando `parseCookieHeader` para lectura y `cookies.set` para escritura con httpOnly + Secure + SameSite=Lax. Incluir validación SSRF. |
| **Criterio** | Factory function retorna `createServerClient` configurado |
| **Verificar** | `npm run test:security` pasa (si hay tests de SSRF) |
| **Estimación** | 2h |
| **Archivos** | `src/lib/supabase.ts` |

### TASK-2.2: Middleware de protección de rutas

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar `onRequest` en middleware: rutas protegidas redirigen a `/login`, rutas de auth redirigen a `/dashboard` si hay sesión, verificar onboarding_completed. Implementar `onRequestAfter` con security headers. |
| **Criterio** | Acceso a `/dashboard` sin sesión → 302 a `/login`. Acceso a `/login` con sesión → 302 a `/dashboard`. |
| **Verificar** | Probar con `curl -v http://localhost:4321/dashboard` sin cookie |
| **Estimación** | 3h |
| **Archivos** | `src/middleware/index.ts`, `src/lib/supabase.ts` (referenciado) |

### TASK-2.3: Server Actions de Auth

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar actions: `auth.login`, `auth.register`, `auth.logout`, `auth.getSession`, `auth.resetPassword`, `auth.updatePassword`, `auth.updateTheme`. Cada action: validación Zod, createSupabaseClient, manejo de errores con mapSupabaseError, logging. |
| **Criterio** | Todas las actions retornan `{ success, redirect }` o `{ success, error, message }` |
| **Verificar** | `npm run type-check` sin errores en `src/actions/index.ts` |
| **Estimación** | 4h |
| **Archivos** | `src/actions/index.ts` |

---

## Lote 3: Sistema de Errores (independiente)

### TASK-3.1: Tipos y utilidades de error

| Campo | Valor |
|-------|-------|
| **Descripción** | Definir `AppErrorCode`, `AppError` interface, `USER_ERROR_MESSAGES`, `createAppError`, `logServerError`, `mapSupabaseError`. |
| **Criterio** | 9 códigos de error definidos, mensajes en español, mapeo de errores Supabase |
| **Verificar** | `npm run test` — tests unitarios de mapSupabaseError |
| **Estimación** | 1h |
| **Archivos** | `src/lib/errors.ts`, `src/lib/user-error.ts` |

---

## Lote 4: Componentes UI de Auth (depende de Lote 2)

### TASK-4.1: LoginForm.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Formulario login: email + password + "Olvidé contraseña" + submit. Llama `actions.auth.login`. Incluye OAuthButtons. Maneja loading, errores, toast. Min-height fijo para CLS. |
| **Criterio** | Login exitoso → toast + redirect. Error → toast. |
| **Verificar** | `npm run test:e2e` — E2E login test |
| **Estimación** | 3h |
| **Archivos** | `src/components/auth/LoginForm.vue`, `src/pages/login.astro` |

### TASK-4.2: RegisterForm.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Formulario registro: email + password + confirm password + submit. Validación client-side (regex email, 8+ chars, match). Llama `actions.auth.register`. Incluye OAuthButtons. |
| **Criterio** | Registro exitoso → toast + redirect a `/onboarding`. Error → toast. |
| **Verificar** | Probar registro con datos válidos → redirect a /onboarding |
| **Estimación** | 3h |
| **Archivos** | `src/components/auth/RegisterForm.vue`, `src/pages/register.astro` |

### TASK-4.3: OAuthButtons.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Botones Google y GitHub con íconos SVG. Llama `supabase.auth.signInWithOAuth` con `redirectTo: /auth/callback`. Divider "O continúa con". |
| **Criterio** | Click en Google → redirect a accounts.google.com. Click en GitHub → redirect a github.com. |
| **Verificar** | Inspeccionar URL de redirección en devtools |
| **Estimación** | 2h |
| **Archivos** | `src/components/auth/OAuthButtons.vue` |

### TASK-4.4: ResetPasswordForm.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Formulario para nueva contraseña (desde email recovery). Extrae hash de URL. Llama `actions.auth.updatePassword`. Validación client-side. |
| **Criterio** | Password actualizada → toast + redirect a `/login`. |
| **Verificar** | Probar con token de reset válido |
| **Estimación** | 2h |
| **Archivos** | `src/components/auth/ResetPasswordForm.vue`, `src/pages/reset-password.astro` |

### TASK-4.5: Auth Callback

| Campo | Valor |
|-------|-------|
| **Descripción** | Página server-side `/auth/callback` que intercambia code por session via `exchangeCodeForSession`, verifica onboarding, redirige a `/dashboard` o `/onboarding`. |
| **Criterio** | OAuth flow completo: login → callback → dashboard |
| **Verificar** | Probar OAuth Google/GitHub completo |
| **Estimación** | 2h |
| **Archivos** | `src/pages/auth/callback.astro` |

---

## Lote 5: Estado Cliente (depende de Lote 2)

### TASK-5.1: Auth Store (Pinia)

| Campo | Valor |
|-------|-------|
| **Descripción** | Store Pinia con `user`, `session`, `loading`. Métodos: `init()` (getSession + onAuthStateChange), `logout()` (servidor → limpiar estado local → cookies → navegar), `setUser`, `clearUser`. |
| **Criterio** | `init()` carga sesión existente. `logout()` limpia todo y redirige. |
| **Verificar** | Recargar página mantiene sesión. Logout redirige a `/login`. |
| **Estimación** | 2h |
| **Archivos** | `src/stores/auth.ts` |

### TASK-5.2: AuthInitializer.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente no-op que llama `auth.init()` en `onMounted`. Se monta en app entrypoint para inicializar sesión. |
| **Criterio** | Al cargar cualquier página, el store se inicializa con la sesión actual |
| **Verificar** | Console log muestra sesión cargada |
| **Estimación** | 1h |
| **Archivos** | `src/components/AuthInitializer.vue`, `src/entrypoint.ts` |

---

## Lote 6: Páginas (depende de Lote 4)

### TASK-6.1: Páginas auth (login, register)

| Campo | Valor |
|-------|-------|
| **Descripción** | Páginas Astro con `BaseLayout`. Layout auth: blobs decorativos (position fixed), brand "🧠 MicroLearn", min-height contenedor para evitar CLS. |
| **Criterio** | Páginas renderizan sin CLS, blobs decorativos no interfieren |
| **Verificar** | Lighthouse CLS < 0.1 |
| **Estimación** | 1h |
| **Archivos** | `src/pages/login.astro`, `src/pages/register.astro` |

---

## Lote 7: Seguridad y Testing (depende de Lotes 2, 3, 5)

### TASK-7.1: Pruebas unitarias de auth

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest: validación Zod (email, password con todas las reglas), `mapSupabaseError` (todos los casos), `isAllowedSupabaseUrl`, helpers de middleware, `createAppError`. |
| **Criterio** | Coverage de al menos 80% en `src/lib/errors.ts` y validaciones |
| **Verificar** | `npm run test -- tests/unit/auth` |
| **Estimación** | 3h |
| **Archivos** | `tests/unit/auth/validation.test.ts`, `tests/unit/auth/errors.test.ts` |

### TASK-7.2: Pruebas E2E de auth

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: registro exitoso, login, login fallido, protección de rutas, sesión persistente, logout, validación de formularios. |
| **Criterio** | Todos los escenarios Gherkin cubiertos en E2E |
| **Verificar** | `npm run test:e2e` — tests de auth pasan |
| **Estimación** | 4h |
| **Archivos** | `tests/e2e/auth/login.spec.ts`, `tests/e2e/auth/register.spec.ts`, `tests/e2e/auth/protection.spec.ts` |

### TASK-7.3: Políticas RLS en Supabase

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear migración SQL con políticas RLS para `user_preferences`, `user_stats`, `user_progress`, `user_badges`. Cada política: `auth.uid() = user_id`. |
| **Criterio** | Usuario A no puede leer/escribir datos de usuario B |
| **Verificar** | `supabase db diff` muestra las políticas |
| **Estimación** | 2h |
| **Archivos** | `supabase/migrations/XXXXXX_rls_policies.sql` |

---

## Resumen de Estimación

| Lote | Tareas | Total |
|------|--------|-------|
| Lote 1: Infraestructura | 2 tareas | 2h |
| Lote 2: Cliente SSR | 3 tareas | 9h |
| Lote 3: Errores | 1 tarea | 1h |
| Lote 4: Componentes UI | 5 tareas | 12h |
| Lote 5: Estado Cliente | 2 tareas | 3h |
| Lote 6: Páginas | 1 tarea | 1h |
| Lote 7: Seguridad + Tests | 3 tareas | 9h |
| **Total** | **17 tareas** | **37h** |

## Dependencias (Grafo)

```
TASK-1.1 ──┐
TASK-1.2 ──┤
            ├── TASK-2.1 ──┬── TASK-2.2 ──┬── TASK-4.x (todos)
            │              └── TASK-2.3 ──┤
            │                              └── TASK-5.x (todos)
            │
            └── TASK-3.1 (independiente, puede ser paralelo)

TASK-4.x → TASK-6.1
TASK-2.x + TASK-3.x + TASK-5.x → TASK-7.x
```
