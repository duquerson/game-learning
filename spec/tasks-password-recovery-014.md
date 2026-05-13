# TASKS-PWR-014: Tareas de Implementación — Recuperación de Contraseña

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas

---

## Lote 1: Configuración y Acciones SSR (depende de AUTH-001 infraestructura)

### TASK-1.1: Configurar Supabase Email Templates

| Campo | Valor |
|-------|-------|
| **Descripción** | Configurar template de "Reset Password" en Supabase Dashboard: personalizar HTML con marca MicroLearn, definir redirect URL a `{PUBLIC_SITE_URL}/reset-password`. Verificar expiración de token (1h default). |
| **Criterio** | Template configurado, redirect URL correcta, expiración 3600s |
| **Verificar** | Supabase Dashboard → Authentication → Email Templates → Reset Password |
| **Estimación** | 0.5h |
| **Archivos** | — (configuración externa en Supabase) |
| **Dependencias** | AUTH-001 TASK-1.1 (Supabase Auth habilitado) |

### TASK-1.2: Agregar action `auth.resetPassword`

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar action `auth.resetPassword` en `src/actions/index.ts`: valida email con Zod, llama `supabase.auth.resetPasswordForEmail(email, { redirectTo })`, retorna `{ success: true }` siempre (mensaje genérico). No exponer si el email existe o no. |
| **Criterio** | Action retorna success siempre. No revela si email existe. Maneja errores Supabase con mapSupabaseError. |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 1h |
| **Archivos** | `src/actions/index.ts` |
| **Dependencias** | AUTH-001 TASK-2.3 (Server Actions de Auth) |

### TASK-1.3: Agregar action `auth.updatePassword`

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar action `auth.updatePassword` en `src/actions/index.ts`: valida password con Zod (8+ chars, mayúscula, minúscula, número), llama `supabase.auth.updateUser({ password })`, retorna `{ success: true, redirect: '/login' }`. Manejar error de token expirado/inválido. |
| **Criterio** | Password actualizada correctamente. Token expirado → error SESSION_EXPIRED. |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 1h |
| **Archivos** | `src/actions/index.ts` |
| **Dependencias** | AUTH-001 TASK-2.3 (Server Actions de Auth) |

---

## Lote 2: Componente UI de Reset (depende de Lote 1)

### TASK-2.1: Crear ResetPasswordForm.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente Vue con 4 estados: LOADING (verificando hash), INVALID_TOKEN (error + botón volver), FORM (campos password + confirmación + validación inline), SUBMITTING (spinner). Extraer `access_token` de `window.location.hash`. Limpiar hash post-extracción. Validación en tiempo real: 8+ chars, mayúscula, minúscula, número, match confirmación. Toggle visibility en inputs. Llama `actions.auth.updatePassword`. |
| **Criterio** | Transición entre todos los estados. Errores inline visibles. Password actualizada → toast + redirect a `/login`. |
| **Verificar** | Probar flujo completo con token válido en local |
| **Estimación** | 3h |
| **Archivos** | `src/components/auth/ResetPasswordForm.vue` |
| **Dependencias** | TASK-1.3, AUTH-001 TASK-4.4 (estructura base existente) |

### TASK-2.2: Crear página reset-password.astro

| Campo | Valor |
|-------|-------|
| **Descripción** | Página Astro pública `/reset-password` con BaseLayout. Renderiza ResetPasswordForm.vue con `client:load`. No requiere sesión activa (excluir de middleware de protección). min-height fijo para evitar CLS. |
| **Criterio** | Página accesible sin sesión. ResetPasswordForm hidrata correctamente. CLS < 0.1. |
| **Verificar** | Navegar a `/reset-password` sin sesión → formulario visible |
| **Estimación** | 1h |
| **Archivos** | `src/pages/reset-password.astro` |
| **Dependencias** | TASK-2.1 |

### TASK-2.3: Agregar "¿Olvidaste tu contraseña?" en LoginForm.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar enlace "¿Olvidaste tu contraseña?" debajo del campo de password en LoginForm.vue. Al hacer clic, mostrar formulario inline de email (o redirigir a modal). Alternativa: mostrar formulario inline dentro del mismo GlassCard. El formulario llama `actions.auth.resetPassword`. Mostrar toast genérico al enviar. |
| **Criterio** | Click en enlace → formulario email visible. Envío → toast "Revisa tu email...". |
| **Verificar** | Clic en "¿Olvidaste tu contraseña?" → formulario visible |
| **Estimación** | 2h |
| **Archivos** | `src/components/auth/LoginForm.vue` |
| **Dependencias** | TASK-1.2 |

---

## Lote 3: Middleware y Seguridad (independiente)

### TASK-3.1: Excluir `/reset-password` de protección de rutas

| Campo | Valor |
|-------|-------|
| **Descripción** | Verificar que `/reset-password` está en la lista de rutas públicas en el middleware (no requiere sesión activa). Si no existe, agregarla. |
| **Criterio** | Acceso a `/reset-password` sin sesión → 200 (no redirect) |
| **Verificar** | `curl -v http://localhost:4321/reset-password` sin cookie → 200 |
| **Estimación** | 0.5h |
| **Archivos** | `src/middleware/index.ts` |
| **Dependencias** | AUTH-001 TASK-2.2 |

### TASK-3.2: Verificar CSP en página de recovery

| Campo | Valor |
|-------|-------|
| **Descripción** | Asegurar que Content-Security-Policy incluye nonce o bloquea scripts inline no autorizados en `/reset-password`. Verificar que Astro configura CSP correctamente en `astro.config.mjs`. |
| **Criterio** | Sin errores de CSP en consola al cargar `/reset-password` |
| **Verificar** | `curl -I http://localhost:4321/reset-password` → header CSP presente |
| **Estimación** | 1h |
| **Archivos** | `astro.config.mjs`, `src/middleware/index.ts` |
| **Dependencias** | AUTH-001 TASK-2.2 |

---

## Lote 4: Pruebas (depende de Lotes 1, 2, 3)

### TASK-4.1: Pruebas unitarias de recovery

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest: Zod schemas (resetPasswordSchema, updatePasswordSchema con todas las reglas), extracción de token desde hash URL, `mapRecoveryError` (token expirado, rate limit, etc.), estados del componente (LOADING → FORM, LOADING → INVALID_TOKEN). |
| **Criterio** | Coverage > 80% en nuevas validaciones y helpers |
| **Verificar** | `npm run test -- tests/unit/auth/recovery.test.ts` |
| **Estimación** | 2h |
| **Archivos** | `tests/unit/auth/recovery.test.ts` |
| **Dependencias** | TASK-1.2, TASK-1.3 |

### TASK-4.2: Pruebas E2E de recovery

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: click en "¿Olvidaste tu contraseña?" → formulario visible, envío de email → toast, navegación a `/reset-password` → formulario, contraseña débil → errores inline, confirmación no coincide → error, flujo exitoso (mock de token válido), link expirado → mensaje + botón. |
| **Criterio** | Todos los escenarios Gherkin cubiertos |
| **Verificar** | `npm run test:e2e` — tests de recovery pasan |
| **Estimación** | 3h |
| **Archivos** | `tests/e2e/auth/recovery.spec.ts` |
| **Dependencias** | TASK-2.1, TASK-2.2, TASK-2.3 |

---

## Resumen de Estimación

| Lote | Tareas | Total |
|------|--------|-------|
| Lote 1: Configuración + Actions SSR | 3 tareas | 2.5h |
| Lote 2: Componentes UI | 3 tareas | 6h |
| Lote 3: Middleware + Seguridad | 2 tareas | 1.5h |
| Lote 4: Pruebas | 2 tareas | 5h |
| **Total** | **10 tareas** | **15h** |

## Dependencias (Grafo)

```
AUTH-001 ──┬── TASK-1.1 (config template)
           ├── TASK-1.2 (resetPassword action)
           ├── TASK-1.3 (updatePassword action)
           ├── TASK-3.1 (excluir ruta middleware)
           └── TASK-3.2 (CSP)

TASK-1.2 ──┬── TASK-2.3 (forgot link en LoginForm)
           └── TASK-4.1 (unit tests)

TASK-1.3 ──┬── TASK-2.1 (ResetPasswordForm.vue)
           └── TASK-4.1 (unit tests)

TASK-2.1 ──┬── TASK-2.2 (reset-password.astro)
           └── TASK-4.2 (E2E tests)

TASK-2.3 ──→ TASK-4.2 (E2E tests)
TASK-3.1 ──→ TASK-3.2 (CSP verification)
```

## Paralelizable

| Grupo | Tareas | Razón |
|-------|--------|-------|
| Grupo A | TASK-1.1 + TASK-3.1 + TASK-3.2 | No dependen entre sí |
| Grupo B | TASK-2.1 + TASK-2.3 | Dependen de diferentes actions |
| Grupo C | TASK-4.1 + TASK-4.2 | Unitarias y E2E son independientes |
