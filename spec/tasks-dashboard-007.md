# TASKS-DSH-007: Tareas de Implementación — Dashboard Principal

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas

---

## Lote 1: Read Model SSR (depende de TASKS-AUTH-001 Lote 2)

### TASK-1.1: Refactor dashboard.astro con queries paralelas

| Campo | Valor |
|-------|-------|
| **Descripción** | Refactorizar `dashboard.astro` para ejecutar 5 queries SSR en paralelo con `Promise.all`: user_stats, user_preferences, user_progress (DISTINCT count), cards (count por topics), user_badges + badges join. Manejar errores individuales sin bloquear queries restantes. Construir DashboardReadModel. |
| **Criterio** | 5 queries ejecutadas en paralelo. Si una falla, las demás continúan. Props tipadas llegan a DashboardView. |
| **Verificar** | `npm run type-check` sin errores en `src/pages/dashboard.astro` |
| **Estimación** | 3h |
| **Archivos** | `src/pages/dashboard.astro` |

### TASK-1.2: Tipos DashboardReadModel

| Campo | Valor |
|-------|-------|
| **Descripción** | Definir interfaces TypeScript: `DashboardReadModel`, `GreetingVO`, `ProgressRatio`, `QuickAction`, `BadgeDTO`. Incluir tipos para eventos de integración (PointsAwarded, StreakUpdated, BadgeUnlocked, SessionCompleted). |
| **Criterio** | Interfaces definidas en `src/types/dashboard.ts`. Todos los campos tipados con readonly donde corresponda. |
| **Verificar** | `npm run type-check` sin errores en `src/types/dashboard.ts` |
| **Estimación** | 1h |
| **Archivos** | `src/types/dashboard.ts` |

### TASK-1.3: Value Objects (GreetingVO, ProgressRatio)

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar factory functions para `GreetingVO.create(email, hour)` que devuelva saludo con franja horaria, y `ProgressRatio.create(reviewed, total)` que calcule porcentaje (0 si total=0, clamped a 100 si reviewed>total). Tests unitarios incluidos. |
| **Criterio** | Greeting devuelve correcto según hora del día. ProgressRatio maneja división por cero. |
| **Verificar** | `npm run test -- tests/unit/dashboard/value-objects.test.ts` pasa |
| **Estimación** | 2h |
| **Archivos** | `src/lib/dashboard/value-objects.ts`, `tests/unit/dashboard/value-objects.test.ts` |

---

## Lote 2: Componentes Vue (depende de Lote 1)

### TASK-2.1: DashboardView.vue — saludo dinámico

| Campo | Valor |
|-------|-------|
| **Descripción** | Computed `greeting` que extrae nombre del email (primera parte, capitalizada) y combina con franja horaria del lado cliente. Formato: "Buenos días, Juan 👋". |
| **Criterio** | `userEmail = "juan@example.com"` → "Buenos días, Juan 👋" (dependiendo hora). Sin email → "Buenos días 👋". |
| **Verificar** | Storybook o prueba visual cambiando hora del sistema |
| **Estimación** | 1h |
| **Archivos** | `src/components/layout/Dashboard.vue` |

### TASK-2.2: DashboardView.vue — barra de progreso

| Campo | Valor |
|-------|-------|
| **Descripción** | Computed `progressPercent` que calcula `Math.round(uniqueReviewed / totalCards * 100)`. Barra visual con `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`. Animación `transition: width 0.5s ease`. Manejo de totalCards=0 (no muestra barra). |
| **Criterio** | uniqueReviewed=15, totalCards=30 → barra al 50%. totalCards=0 → sin barra. Accesibilidad ok. |
| **Verificar** | Inspeccionar DOM: atributos aria presentes |
| **Estimación** | 2h |
| **Archivos** | `src/components/layout/Dashboard.vue` |

### TASK-2.3: DashboardView.vue — sección insignias con empty state

| Campo | Valor |
|-------|-------|
| **Descripción** | Renderizar todas las insignias desbloqueadas (sin límite) usando `BadgeItem.vue` existente. Si `allBadges.length === 0`, mostrar `EmptyState.vue` con icono "🏆", título "Aún no tienes insignias", descripción "Completa sesiones de repaso para desbloquear tus primeras insignias." y CTA "Empezar a repasar" → `/review`. |
| **Criterio** | Con badges → lista completa. Sin badges → EmptyState con CTA. |
| **Verificar** | Probar con usuario sin badges. Probar con 10+ badges. |
| **Estimación** | 1h |
| **Archivos** | `src/components/layout/Dashboard.vue` |

### TASK-2.4: DashboardView.vue — botones de acción rápida

| Campo | Valor |
|-------|-------|
| **Descripción** | Botón primario "Continuar estudiando" (navega a `/review`) y botón secundario "Ir a biblioteca" (navega a `/library`). Usar `GlassButton.vue` con variants. Navegación con `window.location.href`. |
| **Criterio** | Clic en "Continuar estudiando" → URL `/review`. Clic en "Ir a biblioteca" → URL `/library`. |
| **Verificar** | `npm run test:e2e` — tests de navegación dashboard |
| **Estimación** | 1h |
| **Archivos** | `src/components/layout/Dashboard.vue` |

### TASK-2.5: Animaciones de entrada con prefers-reduced-motion

| Campo | Valor |
|-------|-------|
| **Descripción** | Añadir animaciones fade-in-up secuenciales en stat-cards con delays escalonados (0ms, 100ms, 150ms, 200ms). Respetar `prefers-reduced-motion`: si activo, opacity=1, transform=none inmediato. Usar `@media (prefers-reduced-motion: reduce)` y animaciones vía CSS `@keyframes`. |
| **Criterio** | Sin preferencia: fade-in-up escalonado. Con `prefers-reduced-motion`: estático sin animación. |
| **Verificar** | Activar "Reduce motion" en SO → animaciones desactivadas |
| **Estimación** | 1h |
| **Archivos** | `src/components/layout/Dashboard.vue` |

### TASK-2.6: Skeleton loader durante carga

| Campo | Valor |
|-------|-------|
| **Descripción** | Cuando `loading=true`, mostrar `SkeletonLoader variant="stat" count={4}` en lugar de stats grid. Usar `min-height` fijo en contenedores para evitar CLS. |
| **Criterio** | loading=true → skeleton visible. loading=false → datos reales. CLS < 0.1. |
| **Verificar** | Lighthouse CLS < 0.1 en dashboard |
| **Estimación** | 1h |
| **Archivos** | `src/components/layout/Dashboard.vue` |

---

## Lote 3: Testing (depende de Lotes 1, 2)

### TASK-3.1: Pruebas unitarias de Dashboard

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest para: GreetingVO (3 franjas horarias, extracción de nombre, email vacío), ProgressRatio (cálculo normal, división por cero, clamping), streak label (0, 1, N), construcción de BadgeDTO, mapeo de datos SSR a DashboardReadModel. |
| **Criterio** | Coverage ≥ 80% en `src/lib/dashboard/` y lógica de Dashboard.vue (computed properties). |
| **Verificar** | `npm run test -- tests/unit/dashboard` |
| **Estimación** | 3h |
| **Archivos** | `tests/unit/dashboard/value-objects.test.ts`, `tests/unit/dashboard/dashboard-view.test.ts` |

### TASK-3.2: Pruebas E2E de Dashboard

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: dashboard carga con datos (saludo visible, stats > 0), navegación CTA (Continuar estudiando → /review, Ir a biblioteca → /library), sin badges muestra empty state, barra de progreso muestra porcentaje correcto, recarga mantiene datos, redirección a /login sin sesión. |
| **Criterio** | Todos los escenarios Gherkin de la user story cubiertos en E2E. |
| **Verificar** | `npm run test:e2e` — tests de dashboard pasan |
| **Estimación** | 4h |
| **Archivos** | `tests/e2e/dashboard/dashboard.spec.ts` |

### TASK-3.3: Pruebas de accesibilidad

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests axe-core Playwright: barra de progreso con role="progressbar", contraste de colores, navegación teclado, prefers-reduced-motion. |
| **Criterio** | axe-core sin violaciones en /dashboard. |
| **Verificar** | `npm run test:e2e -- --grep @a11y` |
| **Estimación** | 2h |
| **Archivos** | `tests/e2e/dashboard/a11y.spec.ts` |

---

## Lote 4: RLS y Seguridad (depende de Lotes 1)

### TASK-4.1: Políticas RLS para tablas del dashboard

| Campo | Valor |
|-------|-------|
| **Descripción** | Verificar/crear migración SQL con políticas RLS para `user_stats`, `user_progress`, `user_badges`, `user_preferences`: cada usuario solo ve sus propios datos (`auth.uid() = user_id`). |
| **Criterio** | Usuario A no puede leer datos de usuario B desde dashboard. |
| **Verificar** | Probar con `supabase.from('user_stats').select('*')` como usuario A |
| **Estimación** | 1h |
| **Archivos** | `supabase/migrations/XXXXXX_rls_policies.sql` |

---

## Resumen de Estimación

| Lote | Tareas | Total |
|------|--------|-------|
| Lote 1: Read Model SSR | 3 tareas | 6h |
| Lote 2: Componentes Vue | 6 tareas | 7h |
| Lote 3: Testing | 3 tareas | 9h |
| Lote 4: RLS | 1 tarea | 1h |
| **Total** | **13 tareas** | **23h** |

## Dependencias (Grafo)

```
TASKS-AUTH-001 (Lote 2: Supabase SSR, Middleware, Actions)
  │
  └── TASK-1.1 (dashboard.astro refactor)
      ├── TASK-1.3 (value objects)
      │
      ├── TASK-1.2 (tipos)
      │   └── TASK-2.x (todos los componentes Vue)
      │       └── TASK-3.2 (E2E)
      │
      ├── TASK-3.1 (unit tests) ── paralelo con Lote 2
      └── TASK-4.1 (RLS) ── paralelo con Lote 2

TASK-2.x → TASK-3.2 (E2E depende de componentes terminados)
TASK-1.3 + TASK-2.x → TASK-3.1 (unit tests)
TASK-2.5 + TASK-2.6 → TASK-3.3 (a11y tests)
```
