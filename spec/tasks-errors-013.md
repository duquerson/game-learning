# TASKS-ERRORS-013: Tareas de Implementación

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas

---

## Lote 1: Tipos y Utilidades Core (sin dependencias)

### TASK-1.1: Refactorizar tipos AppError a 7 códigos clasificados

| Campo | Valor |
|-------|-------|
| **Descripción** | Refactorizar `AppErrorCode` en `src/lib/errors.ts` para usar 7 códigos exactos de ERR-013: CONNECTION_ERROR, SERVER_ERROR, AUTH_ERROR, VALIDATION_ERROR, RATE_LIMIT, TIMEOUT, NOT_FOUND. Alinear `USER_ERROR_MESSAGES`, `createAppError`, `logServerError`, `mapSupabaseError`. Agregar `ERROR_SEVERITY`, `isRecoverable()`, `toUserFacing()`. |
| **Criterio** | 7 códigos definidos, mensajes en español, `mapSupabaseError` cubre todos los códigos Supabase conocidos |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 2h |
| **Archivos** | `src/lib/errors.ts`, `src/lib/user-error.ts` (eliminar si ya no se usa) |

### TASK-1.2: Crear types/errors.ts con interfaces exportables

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear `src/types/errors.ts` con interfaces `AppError`, `UserFacingError`, `ErrorSeverity`, `AppErrorCode`, `RecoverableErrorCode`, `ErrorOccurred` domain event. Exportar `ERROR_SEVERITY` map, `USER_ERROR_MESSAGES` map. Separar types de implementación. |
| **Criterio** | Interfaces TypeScript limpias sin lógica de implementación |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 1h |
| **Archivos** | `src/types/errors.ts` |

### TASK-1.3: Actualizar consumidores existentes de AppErrorCode

| Campo | Valor |
|-------|-------|
| **Descripción** | Buscar y actualizar todos los imports de `AppErrorCode` y `AppError` en el códigobase (actions, middleware, stores, tests) para usar los nuevos 7 códigos. Renombrar `NETWORK_ERROR` → `CONNECTION_ERROR`, `INTERNAL_ERROR` → `SERVER_ERROR`, `UNAUTHORIZED`/`SESSION_EXPIRED`/`FORBIDDEN` → `AUTH_ERROR`. |
| **Criterio** | Ningún archivo referencia códigos viejos |
| **Verificar** | `rg "NETWORK_ERROR\|INTERNAL_ERROR\|UNAUTHORIZED\|SESSION_EXPIRED\|FORBIDDEN" src/` sin resultados |
| **Estimación** | 2h |
| **Archivos** | `src/actions/index.ts`, `src/middleware/index.ts`, `src/stores/auth.ts`, `src/components/**/*.vue` |

---

## Lote 2: Error Store y Composables (depende de Lote 1)

### TASK-2.1: Crear errorStore (Pinia)

| Campo | Valor |
|-------|-------|
| **Descripción** | Store Pinia `errorStore` con: `lastError: AppError \| null`, `toastQueue`, `showError(error, retry?)`, `dismissError(id)`, `clearAll()`. El store es el único punto de entrada para mostrar errores en la UI. Compatible con SSR (singleton solo en cliente). |
| **Criterio** | `showError()` agrega a queue. `dismissError()` remueve. `clearAll()` vacía. |
| **Verificar** | Tests Vitest para `errorStore` |
| **Estimación** | 2h |
| **Archivos** | `src/stores/errors.ts` |

### TASK-2.2: Crear useErrorHandler composable

| Campo | Valor |
|-------|-------|
| **Descripción** | Composable `useErrorHandler()` con `handleError(error, retry?)`, `handleActionError(result, retry?)`, `mapAndShow(error, retry?)`, `wrapAsync(fn)`. Usa `errorStore` para mostrar errores. `wrapAsync` envuelve operaciones async con try/catch automático + mapping + toast. |
| **Criterio** | `wrapAsync` captura errores y muestra toast. `handleActionError` parsea `{ success: false, error }` de Astro actions. |
| **Verificar** | Tests Vitest para `useErrorHandler` |
| **Estimación** | 3h |
| **Archivos** | `src/composables/useErrorHandler.ts` |

### TASK-2.3: Crear useFormError composable

| Campo | Valor |
|-------|-------|
| **Descripción** | Composable `useFormError()` con: `fieldErrors: Ref<Record<string, string[]>>`, `setFieldErrors(errors)`, `getFieldError(field)`, `clearFieldErrors()`, `handleValidationError(result)`. Integra con `isInputError` de Astro actions fieldErrors. Renderiza vía `InlineError.vue`. |
| **Criterio** | `setFieldErrors({ email: ["Ingresa un email válido"] })` → `getFieldError('email')` retorna el mensaje |
| **Verificar** | Tests Vitest para `useFormError` |
| **Estimación** | 2h |
| **Archivos** | `src/composables/useFormError.ts` |

---

## Lote 3: Componentes UI de Error (depende de Lote 2)

### TASK-3.1: Crear ToastError.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente que recibe AppError + retry callback opcional. Usa `vue-sonner` para mostrar toast. Si `isRecoverable` → agrega botón "Reintentar" en el toast action. Si `AUTH_ERROR` → toast + setTimeout redirect a `/login`. Duración: 8s error, 5s info, 3s success. Animación fade-out. Sin información técnica visible. Test: aria-live="polite", role="status". |
| **Criterio** | Toast se muestra con mensaje correcto. Botón Reintentar invoca callback. Redirect funciona. |
| **Verificar** | Test manual + `npm run test:e2e` |
| **Estimación** | 3h |
| **Archivos** | `src/components/ui/ToastError.vue` |

### TASK-3.2: Crear InlineError.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente que recibe `message: string` y `field?: string`. Renderiza `<p>` con mensaje de error debajo del campo. `role="alert"`, `aria-live="polite"`, `aria-describedby` vinculado al input vía `field` prop. Color rojo/anaranjado del design system. Clase CSS: `text-sm text-error mt-1`. Test: WCAG validation. |
| **Criterio** | Mensaje visible debajo del campo. aria-describedby correcto. Color del design system. |
| **Verificar** | Tests Vitest + WCAG audit |
| **Estimación** | 1h |
| **Archivos** | `src/components/ui/InlineError.vue` |

### TASK-3.3: Crear ErrorBoundary.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente wrapper que captura errores de componentes hijos Vue vía `onErrorCaptured`. Muestra toast genérico `SERVER_ERROR` si el hijo falla sin propagar. No rompe el layout del padre. Opcional: slot `fallback` para contenido alternativo. |
| **Criterio** | Error en hijo → toast sin romper la página. Slot fallback se renderiza si se provee. |
| **Verificar** | Forzar error en hijo → ver toast |
| **Estimación** | 1h |
| **Archivos** | `src/components/ui/ErrorBoundary.vue` |

### TASK-3.4: Mejorar 404.astro (página personalizada)

| Campo | Valor |
|-------|-------|
| **Descripción** | La página 404 ya existe en `src/pages/404.astro`. Verificar que cumple con: emoji 🔍, título "Página no encontrada", descripción clara, botón "Volver al inicio" que navega a `/dashboard`. Asegurar min-height 100dvh, diseño responsive, estilo BaseLayout, sin JS requerido. Agregar meta robots noindex. |
| **Criterio** | Página 404 renderiza sin JS, 100dvh, 🔍 visible, botón funcional |
| **Verificar** | Navegar a URL inexistente → 404.astro |
| **Estimación** | 1h |
| **Archivos** | `src/pages/404.astro` |

### TASK-3.5: Mejorar 500.astro (página de error genérico)

| Campo | Valor |
|-------|-------|
| **Descripción** | La página 500 ya existe en `src/pages/500.astro`. Verificar que cumple con: emoji ⚡, título "Algo salió mal", descripción, botones "Reintentar" (reload) y "Volver al inicio" (/dashboard). Sin JS requerido (usar onclick="location.reload()" para reintentar). min-height 100dvh, responsive. |
| **Criterio** | Página 500 renderiza sin JS, ⚡ visible, botones funcionales |
| **Verificar** | Forzar error 500 → 500.astro |
| **Estimación** | 1h |
| **Archivos** | `src/pages/500.astro` |

---

## Lote 4: Integración en Server Actions y Middleware (depende de Lote 1)

### TASK-4.1: Integrar mapSupabaseError + logServerError en server actions

| Campo | Valor |
|-------|-------|
| **Descripción** | En cada server action en `src/actions/index.ts`, envolver llamadas a Supabase con try-catch. Usar `mapSupabaseError()` para traducir errores, `createAppError()` para construir AppError, `logServerError()` para registrar. Retornar `{ success: false, error: toUserFacing(appError) }`. No exponer detail ni path al cliente. |
| **Criterio** | Toda action retorna error mapeado. Ningún error Supabase raw llega al cliente. |
| **Verificar** | Revisar cada action en `src/actions/index.ts` |
| **Estimación** | 3h |
| **Archivos** | `src/actions/index.ts` |

### TASK-4.2: Integrar manejo de errores en middleware

| Campo | Valor |
|-------|-------|
| **Descripción** | En `src/middleware/index.ts`, capturar errores de `getUser()` y otras llamadas. Usar `mapSupabaseError` + `logServerError`. Si AUTH_ERROR → redirect a `/login` con `?toast=auth_error` en query param. Si SERVER_ERROR → redirect a `/500`. Si error de sesión recuperable → reintentar una vez. |
| **Criterio** | Middleware captura errores auth correctamente y redirige. Error de sesión → login + toast. Error server → 500. |
| **Verificar** | Probar con sesión inválida → redirect + query param |
| **Estimación** | 2h |
| **Archivos** | `src/middleware/index.ts` |

### TASK-4.3: Leer toast query param en LoginForm.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | En `LoginForm.vue`, leer query param `?toast=auth_error` al montar. Si está presente, mostrar toast "Tu sesión expiró. Inicia sesión de nuevo." usando `errorStore.showError()`. Limpiar query param de la URL después de mostrar. |
| **Criterio** | Llegar a `/login?toast=auth_error` → toast visible. URL se limpia. |
| **Verificar** | Navegar a `/login?toast=auth_error` |
| **Estimación** | 1h |
| **Archivos** | `src/components/auth/LoginForm.vue` |

---

## Lote 5: Testing (depende de Lotes 1, 2, 3)

### TASK-5.1: Pruebas unitarias de errores

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest: `createAppError` (todos los 7 códigos, detail, path, timestamp), `mapSupabaseError` (todos los casos: 401, 403, 404, 408, 429, 422, 500, null, NETWORK_ERROR, Failed to fetch), `isRecoverable` (todos los códigos), `toUserFacing`, `ERROR_SEVERITY`, `logServerError` output. |
| **Criterio** | Coverage > 90% en `src/lib/errors.ts` y `src/types/errors.ts` |
| **Verificar** | `npm run test -- tests/unit/errors/` |
| **Estimación** | 3h |
| **Archivos** | `tests/unit/errors/errors.test.ts`, `tests/unit/errors/mapSupabaseError.test.ts` |

### TASK-5.2: Pruebas unitarias de stores y composables

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest: `errorStore` (showError, dismissError, clearAll, toastQueue length), `useErrorHandler` (handleError, wrapAsync captura errores, mapAndShow), `useFormError` (setFieldErrors, getFieldError, clearFieldErrors, handleValidationError). |
| **Criterio** | Coverage > 80% en `src/stores/errors.ts`, `src/composables/useErrorHandler.ts`, `src/composables/useFormError.ts` |
| **Verificar** | `npm run test -- tests/unit/errors/` |
| **Estimación** | 3h |
| **Archivos** | `tests/unit/errors/errorStore.test.ts`, `tests/unit/errors/useErrorHandler.test.ts`, `tests/unit/errors/useFormError.test.ts` |

### TASK-5.3: Pruebas unitarias de componentes UI

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest + Vue Test Utils: `ToastError.vue` (renderiza mensaje, botón Reintentar visible para recoverable, oculto para no-recoverable, redirect en AUTH_ERROR), `InlineError.vue` (renderiza mensaje, aria-describedby correcto, role="alert"), `ErrorBoundary.vue` (captura error hijo, muestra toast fallback). |
| **Criterio** | Coverage > 80% en componentes UI de error |
| **Verificar** | `npm run test -- tests/unit/components/` |
| **Estimación** | 3h |
| **Archivos** | `tests/unit/components/ToastError.test.ts`, `tests/unit/components/InlineError.test.ts`, `tests/unit/components/ErrorBoundary.test.ts` |

### TASK-5.4: Pruebas E2E de errores

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: simular desconexión de red (page.route abort), navegar a URL inexistente (verify 404), formulario con datos inválidos (error inline), sesión expirada (manipular cookie), reintentar en toast, volver al inicio en 404, recargar en 500. |
| **Criterio** | Todos los escenarios Gherkin de ERR-013 cubiertos en E2E |
| **Verificar** | `npm run test:e2e` — tests de errores pasan |
| **Estimación** | 4h |
| **Archivos** | `tests/e2e/errors/connection.spec.ts`, `tests/e2e/errors/404.spec.ts`, `tests/e2e/errors/validation.spec.ts`, `tests/e2e/errors/auth.spec.ts` |

---

## Lote 6: Verificación y Ajustes Finales (depende de Lotes 1-5)

### TASK-6.1: Type-check y lint

| Campo | Valor |
|-------|-------|
| **Descripción** | Correr `npm run type-check` y `npm run lint`. Corregir errores. Verificar que todos los imports estén actualizados y no haya referencias a tipos viejos. |
| **Criterio** | 0 errores de type-check, 0 errores de lint |
| **Verificar** | `npm run type-check && npm run lint` |
| **Estimación** | 1h |
| **Archivos** | — (todo el código afectado) |

### TASK-6.2: Prueba de regresión visual

| Campo | Valor |
|-------|-------|
| **Descripción** | Verificar que 404.astro y 500.astro se vean correctamente en mobile y desktop. Que los toasts no rompan el layout existente. Que los errores inline se vean bien en formularios. Correr Lighthouse para CLS. |
| **Criterio** | CLS < 0.1 en páginas de error. Diseño responsive correcto. |
| **Verificar** | Lighthouse + inspección manual |
| **Estimación** | 1h |
| **Archivos** | — (testing manual) |

---

## Resumen de Estimación

| Lote | Tareas | Total |
|------|--------|-------|
| Lote 1: Tipos y Utilidades Core | 3 tareas | 5h |
| Lote 2: Error Store y Composables | 3 tareas | 7h |
| Lote 3: Componentes UI de Error | 5 tareas | 7h |
| Lote 4: Integración Actions/Middleware | 3 tareas | 6h |
| Lote 5: Testing | 4 tareas | 13h |
| Lote 6: Verificación Final | 2 tareas | 2h |
| **Total** | **20 tareas** | **40h** |

## Dependencias (Grafo)

```
TASK-1.1 ──┐
TASK-1.2 ──┼── TASK-1.3
            │
            ├── TASK-2.1 ──┬── TASK-2.2 ──┬── TASK-3.1 ──┐
            │              │              │              ├── TASK-5.x (todos)
            │              │              ├── TASK-3.2 ──┤
            │              │              ├── TASK-3.3 ──┤
            │              │              ├── TASK-3.4 ──┤
            │              │              └── TASK-3.5 ──┘
            │              │
            │              └── TASK-2.3 ──┬── TASK-3.2 (consume InlineError)
            │                            │
            │                            └── TASK-5.2 (tests de useFormError)
            │
            ├── TASK-4.1 ─── TASK-4.3 (depende de Lote 4 + Lote 3)
            │
            └── TASK-4.2 ─── TASK-4.3 (depende de Lote 4 + Lote 3)

TASK-1.x + TASK-2.x + TASK-3.x + TASK-4.x → TASK-5.x
TASK-5.x → TASK-6.x
```

### Dependencias con otros specs

| Spec | Dependencia | Descripción |
|------|-------------|-------------|
| SPEC-AUTH-001 | TASK-1.3 | Actualizar tipos AppErrorCode en acciones de auth |
| SPEC-AUTH-001 | TASK-4.3 | Toast query param en LoginForm |
| SPEC-ONBOARDING-002 | TASK-2.3 | useFormError para formularios de onboarding |
| SPEC-DASHBOARD-007 | TASK-3.3 | ErrorBoundary envolviendo dashboard |
| SPEC-PROFILE-009 | TASK-3.4 | useFormError para formularios de perfil |
