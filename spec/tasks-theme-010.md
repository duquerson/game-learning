# TASKS-THEME-010: Tareas de Implementación

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas
- **✅ = YA IMPLEMENTADO**

---

## Lote 1: Infraestructura Base (YA IMPLEMENTADO)

### TASK-1.1 ✅: Inline script en BaseLayout

| Campo | Valor |
|-------|-------|
| **Descripción** | Script síncrono en `<head>` que lee localStorage → prefers-color-scheme → dark default. Aplica `data-theme` antes del primer paint. CSP hash generado con `createHash`. |
| **Criterio** | No hay flash del tema incorrecto. CSP no bloquea el script. |
| **Verificar** | `data-theme` presente en `document.documentElement` al cargar cualquier página |
| **Estimación** | 1h |
| **Archivos** | `src/layouts/BaseLayout.astro:14-16` |

### TASK-1.2 ✅: Variables CSS de tema en global.css

| Campo | Valor |
|-------|-------|
| **Descripción** | Definir `[data-theme="light"]` y `[data-theme="dark"]` con CSS custom properties para glassmorphism, colores de texto y fondos. Fondo oscuro por defecto en html/body. |
| **Criterio** | `data-theme="light"` cambia fondo a claro, `data-theme="dark"` a oscuro |
| **Verificar** | Inspeccionar estilos computados al cambiar `data-theme` |
| **Estimación** | 1h |
| **Archivos** | `src/styles/global.css:174-239` |

### TASK-1.3 ✅: Lib theme.ts

| Campo | Valor |
|-------|-------|
| **Descripción** | Funciones `getInitialTheme()` (localStorage → prefers-color-scheme), `applyTheme()` (setAttribute), `persistTheme()` (localStorage.setItem). SSR-safe. |
| **Criterio** | `getInitialTheme` retorna tema correcto en cliente y SSR |
| **Verificar** | `npm run test` — UT-01 a UT-05 pasan |
| **Estimación** | 1h |
| **Archivos** | `src/lib/theme.ts` |

---

## Lote 2: Composable y Componente Toggle (YA IMPLEMENTADO)

### TASK-2.1 ✅: useTheme composable

| Campo | Valor |
|-------|-------|
| **Descripción** | Composable Vue con `theme` reactivo (ref), `init()` (obtiene tema inicial y aplica), `toggle()` (alterna tema, persiste en localStorage + DB via action). |
| **Criterio** | `toggle()` cambia data-theme, localStorage, y llama `actions.auth.updateTheme` |
| **Verificar** | Click toggle → data-theme cambia, localStorage.setItem llamado |
| **Estimación** | 1h |
| **Archivos** | `src/composables/useTheme.ts` |

### TASK-2.2 ✅: ThemeToggle.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Botón toggle con iconos 🌙/☀️. Llama `useTheme().toggle()`. aria-label descriptivo. `onMounted(init)`. |
| **Criterio** | Click cambia icono y tema. Accesible vía teclado. |
| **Verificar** | Tab + Enter cambia el tema |
| **Estimación** | 1h |
| **Archivos** | `src/components/ui/ThemeToggle.vue` |

### TASK-2.3 ✅: Integrar toggle en Sidebar

| Campo | Valor |
|-------|-------|
| **Descripción** | Importar `ThemeToggle` en `Sidebar.vue` y renderizar en `.sidebar-footer`. |
| **Criterio** | Toggle visible en sidebar desktop |
| **Verificar** | Navegar a cualquier página con AppLayout → toggle visible |
| **Estimación** | 0.5h |
| **Archivos** | `src/components/layout/Sidebar.vue:3,55` |

---

## Lote 3: Action de Servidor (YA IMPLEMENTADO)

### TASK-3.1 ✅: Server action auth.updateTheme

| Campo | Valor |
|-------|-------|
| **Descripción** | DefineAction en `actions/index.ts`: recibe `{ theme: 'light' | 'dark' }`, upserta en `user_preferences` con `onConflict: 'user_id'`. Retorna `{ success: true }` o `{ success: false }` silencioso si no hay sesión. |
| **Criterio** | Usuario autenticado → DB actualizada. No autenticado → success false sin error. |
| **Verificar** | Llamar acción desde Playwright → consultar DB |
| **Estimación** | 1h |
| **Archivos** | `src/actions/index.ts:543-559` |

---

## Lote 4: Selector de Tema en Perfil (PENDIENTE)

### TASK-4.1: Agregar theme en UserPreferences type

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar campo `theme: 'light' | 'dark'` en interface `UserPreferences` en `src/types/app.ts`. |
| **Criterio** | Type incluye `theme` |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 0.5h |
| **Archivos** | `src/types/app.ts:38-42` |

### TASK-4.2: Selector de tema en ProfileView

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar sección de selector de tema en ProfileView.vue usando `useTheme()`. Mostrar botones/radio para light/dark con indicador visual del tema actual. El cambio debe llamar `toggle()` del composable. |
| **Criterio** | Perfil muestra selector de tema. Click cambia tema globalmente. |
| **Verificar** | Navegar a /profile → cambiar tema → sidebar refleja cambio |
| **Estimación** | 2h |
| **Archivos** | `src/components/profile/ProfileView.vue` |

### TASK-4.3: Pasar tema en profile page

| Campo | Valor |
|-------|-------|
| **Descripción** | En `profile.astro`, leer `user_preferences.theme` desde la DB y pasarlo como prop a ProfileView, o inicializar `useTheme` si no se persiste server-side. |
| **Criterio** | ProfileView muestra el tema actual correctamente |
| **Verificar** | Perfil refleja tema guardado en DB |
| **Estimación** | 1h |
| **Archivos** | `src/pages/profile.astro` |

---

## Lote 5: Testing (PENDIENTE)

### TASK-5.1: Tests unitarios de theme

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest para `getInitialTheme`, `applyTheme`, `persistTheme`, toggle logic. Mockear localStorage y matchMedia. Cubrir SSR (window undefined). |
| **Criterio** | 100% coverage en `src/lib/theme.ts`. TODOS los casos de UT pasan. |
| **Verificar** | `npm run test -- tests/unit/theme` |
| **Estimación** | 2h |
| **Archivos** | `tests/unit/theme/theme.test.ts` |

### TASK-5.2: Tests E2E de theme

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: toggle cambia tema, recarga mantiene tema, incógnito respeta prefers-color-scheme, screenshot sin flash, navegación SPA mantiene tema. |
| **Criterio** | Todos los escenarios Gherkin cubiertos en E2E |
| **Verificar** | `npm run test:e2e` — tests de theme pasan |
| **Estimación** | 3h |
| **Archivos** | `tests/e2e/theme/theme.spec.ts` |

---

## Resumen de Estimación

| Lote | Tareas | Estado | Total |
|------|--------|--------|-------|
| Lote 1: Infraestructura | 3 tareas | ✅ Implementado | 3h |
| Lote 2: Composable + Toggle | 3 tareas | ✅ Implementado | 2.5h |
| Lote 3: Action servidor | 1 tarea | ✅ Implementado | 1h |
| Lote 4: Selector en perfil | 3 tareas | ⏳ Pendiente | 3.5h |
| Lote 5: Testing | 2 tareas | ⏳ Pendiente | 5h |
| **Total** | **12 tareas** | 7 ✅ + **5 ⏳** | **15h** |

## Dependencias (Grafo)

```
Lote 1 ──┬── Lote 2 ──┬── TASK-4.x (perfil)
          │             └── TASK-5.x (tests)
          │
          └── Lote 3 ──┘

TASK-4.1 (types) → TASK-4.2 (ProfileView) → TASK-4.3 (page)

TASK-5.1 (unit) ── (independiente, puede ser paralelo)
TASK-5.2 (e2e)  ── (depende de Lote 4 completo)
```
