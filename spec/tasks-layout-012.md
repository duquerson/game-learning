# TASKS-LAYOUT-012: Tareas de Implementación

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **✅ = YA IMPLEMENTADO** | **⚠️ = REQUIERE CAMBIOS** | **★ = NUEVO**

---

## Lote 1: Infraestructura de Layout (⚠️ MODIFICAR)

### TASK-1.1 ⚠️: Cambiar breakpoint en AppLayout (768px → 1024px)

| Campo | Valor |
|-------|-------|
| **Descripción** | En `AppLayout.astro`, cambiar `md:flex`/`md:hidden` a `lg:flex`/`lg:hidden` para que el breakpoint de sidebar vs bottom nav sea 1024px (tailwindcss `lg`). Agregar `ViewTransitions` import de `astro:transitions`. |
| **Criterio** | Sidebar visible desde 1024px, bottom nav visible bajo 1024px. Navegación usa View Transitions sin recarga. |
| **Dependencias** | — |
| **Verificar** | Resize viewport: 1023px → bottom nav visible; 1024px → sidebar visible |
| **Estimación** | 1h |
| **Archivos** | `src/layouts/AppLayout.astro` |

### TASK-1.2 ★: Crear transitions.css

| Campo | Valor |
|-------|-------|
| **Descripción** | Archivo CSS con animaciones `fade-in` y `fade-out` para `::view-transition-old(root)` y `::view-transition-new(root)`. Duración: 150ms fade-out, 200ms fade-in. Importar en BaseLayout.astro. |
| **Criterio** | Navegación entre secciones muestra transición suave. Fallback sin animación si no soportado. |
| **Dependencias** | TASK-1.1 (AppLayout con ViewTransitions) |
| **Verificar** | Click en enlace → animación fade visible |
| **Estimación** | 0.5h |
| **Archivos** | `src/styles/transitions.css` (★), `src/layouts/BaseLayout.astro` (import) |

### TASK-1.3 ⚠️: Ajustar padding-bottom en main para bottom nav

| Campo | Valor |
|-------|-------|
| **Descripción** | En `global.css` o en `AppLayout.astro`, asegurar que `<main>` tenga `padding-bottom: 5rem` (80px) en mobile para evitar solapamiento con bottom nav. Usar `env(safe-area-inset-bottom)`. |
| **Criterio** | Contenido scrolleable sin quedar oculto detrás del bottom nav |
| **Dependencias** | — |
| **Verificar** | Resize a 375px, scroll al fondo → último elemento visible |
| **Estimación** | 0.5h |
| **Archivos** | `src/layouts/AppLayout.astro:26`, `src/styles/global.css` |

---

## Lote 2: HeaderGlobal (★ NUEVO)

### TASK-2.1 ★: Crear HeaderGlobal.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente Vue fijo en la parte superior (z-40, h-14) con glassmorphism. Muestra: logo "🧠 MicroLearn", puntos "⭐ {totalPoints}", racha "🔥 {currentStreak}" y ThemeToggle. Stats desde `useGamificationStore`. SkeletonLoader mientras carga. Si no autenticado, solo logo + toggle. |
| **Criterio** | Header visible en todas las páginas y breakpoints. Stats se actualizan reactivamente. |
| **Dependencias** | TASK-3.1 (gamification store) |
| **Verificar** | Navegar cualquier ruta → header con stats y toggle visibles |
| **Estimación** | 2h |
| **Archivos** | `src/components/layout/HeaderGlobal.vue` (★) |

### TASK-2.2 ⚠️: Integrar HeaderGlobal en AppLayout

| Campo | Valor |
|-------|-------|
| **Descripción** | Importar y renderizar `HeaderGlobal` con `client:idle` en `AppLayout.astro` antes del contenedor flex. Ajustar layout para que sidebar y main queden debajo del header (flex-col en contenedor exterior). |
| **Criterio** | Header está arriba, sidebar y contenido abajo. No hay duplicación de ThemeToggle visuals. |
| **Dependencias** | TASK-2.1 |
| **Verificar** | Layout visual: Header → [Sidebar + Main] |
| **Estimación** | 1h |
| **Archivos** | `src/layouts/AppLayout.astro` |

---

## Lote 3: Store de Gamificación (★ NUEVO + ⚠️ MODIFICAR)

### TASK-3.1 ★: Crear gamification store (Pinia)

| Campo | Valor |
|-------|-------|
| **Descripción** | Pinia store `useGamificationStore` con `totalPoints`, `currentStreak`, `loading`. Método `fetchStats(userId)` que llama `actions.auth.getUserStats`. Valores iniciales 0. |
| **Criterio** | Store reactiva, `fetchStats` actualiza valores desde la DB |
| **Dependencias** | TASK-3.2 (action getUserStats) |
| **Verificar** | `useGamificationStore().totalPoints` > 0 después de fetch |
| **Estimación** | 1h |
| **Archivos** | `src/stores/gamification.ts` (★) |

### TASK-3.2 ★: Server action getUserStats

| Campo | Valor |
|-------|-------|
| **Descripción** | Nueva action `auth.getUserStats` en `actions/index.ts`. Recibe `userId`, consulta `user_stats` en Supabase, retorna `{ success: true, stats: { totalPoints, currentStreak } }` o `{ success: false }`. Input validado con zod. |
| **Criterio** | Action autenticada devuelve stats correctos del usuario |
| **Dependencias** | — |
| **Verificar** | Llamar action con userId válido → stats numéricos |
| **Estimación** | 1.5h |
| **Archivos** | `src/actions/index.ts` |

### TASK-3.3 ★: Añadir HeaderStats type en app.ts

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar `HeaderStats` interface en `src/types/app.ts` con `totalPoints: number` y `currentStreak: number`. |
| **Criterio** | Type exportable, usado por store y action |
| **Dependencias** | — |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 0.25h |
| **Archivos** | `src/types/app.ts` |

---

## Lote 4: Sidebar — Stats y Ajustes (⚠️ MODIFICAR)

### TASK-4.1 ⚠️: Agregar stats en Sidebar

| Campo | Valor |
|-------|-------|
| **Descripción** | Sidebar.vue: agregar visualización de puntos totales y racha actual en el footer (arriba del logout). Consumir `useGamificationStore`. Mostrar "⭐ {totalPoints}" y "🔥 {currentStreak}". Oculto cuando sidebar está colapsado. |
| **Criterio** | Sidebar expandido muestra stats. Colapsado solo muestra íconos. |
| **Dependencias** | TASK-3.1 |
| **Verificar** | Sidebar expandido → "⭐ 1,240 🔥 7" visible |
| **Estimación** | 1h |
| **Archivos** | `src/components/layout/Sidebar.vue` |

### TASK-4.2 ✅: Sidebar state persistence (YA IMPLEMENTADO)

| Campo | Valor |
|-------|-------|
| **Descripción** | Sidebar.vue ya implementa `localStorage.getItem('sidebar-collapsed')` en `onMounted` y `localStorage.setItem` en `toggleCollapse`. Collapsible con CSS transition de 220px ↔ 64px. |
| **Criterio** | ✅ No require cambios |
| **Verificar** | Colapsar → recargar → sigue colapsado |
| **Archivos** | `src/components/layout/Sidebar.vue:9-16,84-88` |

---

## Lote 5: Testing (★ NUEVO)

### TASK-5.1 ★: Tests unitarios de layout

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest: `getInitialSidebarState` (localStorage/null/corrupto), `isActiveRoute`, `NavItems` unique hrefs, toggleSidebarState. |
| **Criterio** | 100% coverage en lógica de sidebar state y active route |
| **Verificar** | `npm run test -- tests/unit/layout` |
| **Estimación** | 2h |
| **Archivos** | `tests/unit/layout/sidebar.test.ts` (★) |

### TASK-5.2 ★: Tests E2E de layout y navegación

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: resize viewport (360px → bottom nav, 1280px → sidebar), sidebar toggle y persistencia, click en enlace cambia ruta + active state, header stats visibles, bottom nav ítem activo con texto, padding-bottom evita solapamiento, View Transitions no causan recarga. |
| **Criterio** | Todos los escenarios Gherkin cubiertos en E2E |
| **Verificar** | `npm run test:e2e` — tests de layout pasan |
| **Estimación** | 3h |
| **Archivos** | `tests/e2e/layout/navigation.spec.ts` (★) |

### TASK-5.3 ★: Tests unitarios de gamification store

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest para `useGamificationStore`: valores iniciales (0), fetchStats mockeado actualiza valores, loading state. |
| **Criterio** | Store testea estados: idle, loading, loaded, error |
| **Verificar** | `npm run test -- tests/unit/stores/gamification.test.ts` |
| **Estimación** | 1.5h |
| **Archivos** | `tests/unit/stores/gamification.test.ts` (★) |

---

## Resumen de Estado Actual

| Componente/Lógica | Estado | Archivo |
|-------------------|--------|---------|
| Sidebar colapsable + toggle | ✅ IMPLEMENTADO | `Sidebar.vue` |
| Sidebar state persistence (localStorage) | ✅ IMPLEMENTADO | `Sidebar.vue` |
| Bottom nav con ítems | ✅ IMPLEMENTADO | `BottomNav.vue` |
| Bottom nav active state (ícono + texto) | ✅ IMPLEMENTADO | `BottomNav.vue` |
| ThemeToggle componente | ✅ IMPLEMENTADO | `ThemeToggle.vue` |
| useTheme composable | ✅ IMPLEMENTADO | `useTheme.ts` |
| Auth store | ✅ IMPLEMENTADO | `auth.ts` |
| HeaderGlobal (stats + logo) | ★ NO IMPLEMENTADO | — |
| Gamification store (puntos, racha) | ★ NO IMPLEMENTADO | — |
| Server action getUserStats | ★ NO IMPLEMENTADO | — |
| View Transitions | ★ NO IMPLEMENTADO | — |
| transitions.css | ★ NO IMPLEMENTADO | — |
| Breakpoint 1024px | ⚠️ REQUIERE CAMBIO | `AppLayout.astro` (usa 768px) |
| Padding-bottom main | ⚠️ REQUIERE VERIFICACIÓN | `AppLayout.astro` |

---

## Resumen de Estimación

| Lote | Tareas | Estado | Total |
|------|--------|--------|-------|
| Lote 1: Infraestructura layout | 3 tareas | ⚠️ Modificar | 2h |
| Lote 2: HeaderGlobal | 2 tareas | ★ Nuevo | 3h |
| Lote 3: Store gamificación | 3 tareas | ★ Nuevo | 2.75h |
| Lote 4: Sidebar stats | 2 tareas | 1 ✅ + 1 ⚠️ | 1h |
| Lote 5: Testing | 3 tareas | ★ Nuevo | 6.5h |
| **Total** | **13 tareas** | 2 ✅ + 4 ⚠️ + **7 ★** | **15.25h** |

## Grafo de Dependencias

```
Lote 1 (infraestructura)
├── 1.1 (breakpoint + ViewTransitions)
│   └── 1.2 (transitions.css) — depende de 1.1
│
Lote 3 (store)
├── 3.2 (server action getUserStats)
│   └── 3.1 (gamification store) — depende de 3.2
│       ├── 2.1 (HeaderGlobal) — depende de 3.1
│       │   └── 2.2 (integrar en AppLayout) — depende de 2.1
│       └── 4.1 (sidebar stats) — depende de 3.1
│
Lote 5 (testing)
├── 5.1 (unit layout) — independiente
├── 5.2 (e2e) — depende de Lotes 1-4 completos
└── 5.3 (unit store) — depende de 3.1

Orden recomendado:
1.1 → 1.2 → 1.3 (infraestructura base)
3.2 → 3.1 → 3.3 (store y action)
3.1 → 2.1 → 2.2 (HeaderGlobal)
3.1 → 4.1 (sidebar stats)
5.1 + 5.3 → 5.2 (tests)
```
