# TASKS-A11Y-015: Tareas de Implementación — Accesibilidad WCAG 2.1 AAA

## Convenciones
- **Estimación:** 0.5-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas
- **✅ = YA IMPLEMENTADO** en `src/styles/accessibility.css`
- **⚠️ = PENDIENTE** (identificado como brecha)

---

## Lote 0: Inventario de lo que YA EXISTE en accessibility.css

| Recurso | Estado | Detalle |
|---------|--------|---------|
| `:focus` / `:focus-visible` outline + box-shadow | ✅ | Líneas 9-23. Tema accent-blue |
| `.sr-only` | ✅ | Líneas 30-40. Clip rect standard |
| `.sr-only-focusable` | ✅ | Líneas 43-53 |
| `.visually-hidden` | ✅ | Líneas 60-70 |
| `.visually-hidden-focusable` | ✅ | Líneas 73-83 |
| `.focus-visible-ring` | ✅ | Líneas 90-94 |
| `@media (prefers-reduced-motion: reduce)` | ✅ | Líneas 97-106 |
| `.skip-link` (CSS clase) | ✅ | Líneas 108-124. Posición absolute, top: -40px, aparece con :focus |
| `.focus-trap` | ✅ | Líneas 127-129 |
| `.focus-visible` / `.focus-ring-offset` / `.focus-ring-no-offset` | ✅ | Líneas 132-150 |
| `@media (forced-colors: active)` | ✅ | Líneas 153-163 |
| `.error-message` / `.success-message` / `.loading-indicator` | ✅ | Líneas 170-206 (sr-only) |
| `.sr-text` / `.sr-text-focusable` | ✅ | Líneas 213-236 |
| `.skip-to-main` (segunda clase skip) | ✅ | Líneas 243-259. top: -100px, z-index 1000 |
| Landmark regions outline none | ✅ | Líneas 262-266 |
| `.text-high-contrast` / `.bg-high-contrast` / `.border-high-contrast` | ✅ | Líneas 273-285 |
| Mobile focus indicators | ✅ | Líneas 354-366 |
| Print styles | ✅ | Líneas 372-392 |

### Brechas en accessibility.css

| Brecha | Impacto |
|--------|---------|
| Ratios de contraste actuales son AA, no AAA | P0 — especificar colores en global.css, no en accessibility.css |
| No hay clase `.focus-visible-ring--aaa` con outline más grueso | P2 — opcional |
| No hay estilos específicos para `role="alert"` visible | P2 — sr-only es suficiente |

---

## Lote 1: Contraste WCAG AAA (7:1) — global.css

### TASK-1.1: Ajustar --color-text-secondary en light y dark

| Campo | Valor |
|-------|-------|
| **Descripción** | Modificar `--color-text-secondary` en `[data-theme="light"]` y `[data-theme="dark"]` para cumplir ratio 7:1 contra fondo. Light: pasar de oklch(40% ...) a oklch(30% ...). Dark: pasar de oklch(75% ...) a oklch(82% ...). |
| **Criterio** | axe-core `color-contrast-enhanced` pasa en todos los textos con clase secondary |
| **Depende de** | — |
| **Verificar** | `npx playwright test --grep "contrast"` |
| **Estimación** | 1h |
| **Archivos** | `src/styles/global.css:226,237` |

### TASK-1.2: Ajustar --color-text-muted en light y dark

| Campo | Valor |
|-------|-------|
| **Descripción** | Modificar `--color-text-muted` para cumplir 7:1 cuando se usa como texto normal. Light: oklch(40% ...). Dark: oklch(78% ...). Si muted solo se usa para texto decorativo/grande (>18px), documentar la excepción. |
| **Criterio** | axe-core pasa en muted usado como texto normal |
| **Depende de** | TASK-1.1 |
| **Verificar** | `npx playwright test --grep "contrast"` |
| **Estimación** | 1h |
| **Archivos** | `src/styles/global.css:227,238` |

### TASK-1.3: Verificar contraste de colores funcionales (destructive, warning, info, success)

| Campo | Valor |
|-------|-------|
| **Descripción** | Medir con axe-core que los textos sobre fondos destructive/warning/info/success cumplen 7:1 (o 4.5:1 si son >18px). Ajustar si es necesario. |
| **Criterio** | Sin violaciones de contraste en botones de variante error/success |
| **Depende de** | TASK-1.2 |
| **Verificar** | axe-core scan en páginas con botones de acción |
| **Estimación** | 1h |
| **Archivos** | `src/styles/global.css:33-37` |

---

## Lote 2: Skip Link + Landmarks — Layouts

### TASK-2.1: Mejorar skip link HTML en BaseLayout

| Campo | Valor |
|-------|-------|
| **Descripción** | El skip link existe en `BaseLayout.astro:30` con clase `.skip-link`. Cambiar a `.skip-to-main` (tiene mejor z-index y posicionamiento). Verificar que `href="#main-content"` coincide con el id en `AppLayout.astro:24`. Agregar `tabindex="-1"` al `<main>` para que reciba foco. |
| **Criterio** | Tab → skip link visible → Enter → foco en `<main tabindex="-1">` |
| **Depende de** | — |
| **Verificar** | `page.keyboard.press('Tab')` + `document.activeElement` |
| **Estimación** | 0.5h |
| **Archivos** | `src/layouts/BaseLayout.astro:30`, `src/layouts/AppLayout.astro:24` |

### TASK-2.2: Agregar header role="banner" en AppLayout

| Campo | Valor |
|-------|-------|
| **Descripción** | Envolver el logo y título de página (si existe) en `<header role="banner">` en AppLayout. Astro permite pasar slots named o agregar un header semántico que contenga el branding. |
| **Criterio** | axe-core landmark-banner-is-top-level pasa |
| **Depende de** | — |
| **Verificar** | axe-core scan en dashboard |
| **Estimación** | 0.5h |
| **Archivos** | `src/layouts/AppLayout.astro` |

### TASK-2.3: Verificar <main> único por página

| Campo | Valor |
|-------|-------|
| **Descripción** | Confirmar que AppLayout tiene exactamente un `<main>` con `role="main"`. Las páginas que usen BaseLayout directamente deben tener su propio `<main>`. |
| **Criterio** | axe-core landmark-one-main pasa en todas las páginas |
| **Depende de** | TASK-2.1 |
| **Verificar** | axe-core scan en todas las rutas |
| **Estimación** | 0.5h |
| **Archivos** | `src/layouts/*.astro`, revisión de páginas |

---

## Lote 3: ARIA en Formularios

### TASK-3.1: Agregar aria-describedby + role="alert" en LoginForm

| Campo | Valor |
|-------|-------|
| **Descripción** | En `LoginForm.vue`, agregar `aria-describedby="[field]-error"` en cada input. Crear `<p :id="[field]-error" role="alert" class="sr-only">` con el mensaje de error cuando `isInputError` devuelva errores. El toast.error actual se mantiene pero se complementa con error vinculado al campo. |
| **Criterio** | Error de login: input tiene aria-describedby apuntando al mensaje, mensaje tiene role="alert" |
| **Depende de** | — |
| **Verificar** | axe-core aria-valid-attr-value pasa. Screen reader anuncia el error. |
| **Estimación** | 2h |
| **Archivos** | `src/components/auth/LoginForm.vue` |

### TASK-3.2: Agregar aria-describedby + role="alert" en RegisterForm

| Campo | Valor |
|-------|-------|
| **Descripción** | Mismo patrón que TASK-3.1 para RegisterForm: email, password, confirmPassword. |
| **Criterio** | Cada input con error tiene su mensaje vinculado |
| **Depende de** | TASK-3.1 (mismo patrón) |
| **Verificar** | axe-core scan en /register con submit vacío |
| **Estimación** | 1.5h |
| **Archivos** | `src/components/auth/RegisterForm.vue` |

### TASK-3.3: Agregar aria-describedby + role="alert" en ResetPasswordForm (inline LoginForm)

| Campo | Valor |
|-------|-------|
| **Descripción** | El formulario de reset está inline en LoginForm.vue. Agregar aria-describedby en input reset-email. |
| **Criterio** | Error de reset anunciado correctamente |
| **Depende de** | TASK-3.1 |
| **Verificar** | Submit reset vacío → error vinculado |
| **Estimación** | 1h |
| **Archivos** | `src/components/auth/LoginForm.vue` (reset form) |

### TASK-3.4: Agregar ARIA en OnboardingForm

| Campo | Valor |
|-------|-------|
| **Descripción** | Leer OnboardingForm.vue y agregar aria-describedby/role="alert" a sus campos. Agregar aria-label en botones si no tienen texto visible. |
| **Criterio** | Formulario de onboarding completamente accesible |
| **Depende de** | TASK-3.1 (patrón) |
| **Verificar** | axe-core scan en /onboarding |
| **Estimación** | 1.5h |
| **Archivos** | `src/components/onboarding/OnboardingForm.vue` |

---

## Lote 4: ARIA en Componentes de UI

### TASK-4.1: Iconos decorativos en Sidebar y BottomNav

| Campo | Valor |
|-------|-------|
| **Descripción** | Los iconos emoji en Sidebar.vue (🏠, 📚, etc.) y BottomNav.vue (🏠, 📚, etc.) son decorativos. Agregar `aria-hidden="true"` en los `<span class="icon">`. Los `aria-label` en los enlaces ya existen. |
| **Criterio** | Iconos no son anunciados por screen reader |
| **Depende de** | — |
| **Verificar** | axe-core scan sin violaciones de aria-hidden |
| **Estimación** | 0.5h |
| **Archivos** | `src/components/layout/Sidebar.vue:49`, `src/components/layout/BottomNav.vue:28` |

### TASK-4.2: ARIA en ReviewCard (botones y quiz options)

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar `aria-label` en: botón "Ver respuesta", "No lo sabía", "Lo sabía", cada opción de quiz. El timer countdown debe tener `aria-live="polite"` o `role="timer"`. El área de flip card debe ser focusable. |
| **Criterio** | Todos los botones tienen nombre accesible. Timer anunciado. |
| **Depende de** | — |
| **Verificar** | axe-core button-name pasa. Tab navigates todas las opciones. |
| **Estimación** | 2h |
| **Archivos** | `src/components/cards/ReviewCard.vue` |

### TASK-4.3: ARIA en BadgeItem y BadgeGrid

| Campo | Valor |
|-------|-------|
| **Descripción** | BadgeGrid: agregar `role="list"` en el contenedor y `role="listitem"` en cada BadgeItem. BadgeItem: los iconos emoji son decorativos → `aria-hidden="true"`. El candado 🔒 también decorativo (ya tiene `aria-hidden="true"`). Agregar `aria-label` descriptivo en el contenedor: "Insignia [nombre] - [nivel] - [estado]". |
| **Criterio** | Lista de insignias navegable y comprensible con screen reader |
| **Depende de** | — |
| **Verificar** | axe-core scan en /badges |
| **Estimación** | 1.5h |
| **Archivos** | `src/components/badges/BadgeItem.vue`, `src/components/badges/BadgeGrid.vue` |

### TASK-4.4: ARIA en ProfileView (avatar + topic buttons)

| Campo | Valor |
|-------|-------|
| **Descripción** | Avatar con letra inicial: cambiar a `<div role="img" aria-label="Avatar de {{ email }}">`. Los topic buttons: son toggle buttons, agregar `aria-pressed` dinámico. Botón "Guardar temas" ya tiene texto visible (ok). Agregar `aria-label` en cada topic button. |
| **Criterio** | Avatar tiene aria-label. Topics tienen aria-pressed. |
| **Depende de** | — |
| **Verificar** | axe-core image-alt (si aplica), button-name |
| **Estimación** | 1.5h |
| **Archivos** | `src/components/profile/ProfileView.vue` |

### TASK-4.5: ARIA en GlassButton (aria-label cuando sin slot text)

| Campo | Valor |
|-------|-------|
| **Descripción** | GlassButton acepta un prop `ariaLabel` opcional. Si no hay slot text visible, el botón debe tener aria-label. |
| **Criterio** | Botones sin texto visible tienen aria-label |
| **Depende de** | — |
| **Verificar** | axe-core button-name |
| **Estimación** | 1h |
| **Archivos** | `src/components/ui/GlassButton.vue` |

### TASK-4.6: ARIA en EmptyState y SkeletonLoader

| Campo | Valor |
|-------|-------|
| **Descripción** | EmptyState: agregar `role="status"` para anunciar "No hay elementos". SkeletonLoader: agregar `aria-busy="true"` en el contenedor y `aria-label="Cargando..."`. |
| **Criterio** | Estados vacíos y de carga son anunciados |
| **Depende de** | — |
| **Verificar** | axe-core scan |
| **Estimación** | 1h |
| **Archivos** | `src/components/ui/EmptyState.vue`, `src/components/ui/SkeletonLoader.vue` |

---

## Lote 5: Live Regions y Notificaciones

### TASK-5.1: Verificar ToasterWrapper live regions

| Campo | Valor |
|-------|-------|
| **Descripción** | ✅ ToasterWrapper.vue YA tiene `role="status"` y `aria-live="polite"`. Verificar que vue-sonner los respeta y no los sobreescribe. Agregar test E2E que confirme atributos en el DOM. |
| **Criterio** | Toaster tiene ambos atributos renderizados |
| **Depende de** | — |
| **Verificar** | `page.locator('[role="status"]')` existe |
| **Estimación** | 0.5h |
| **Archivos** | `src/components/ui/ToasterWrapper.vue` (verificación) |

### TASK-5.2: Anunciar resultados de review con live region

| Campo | Valor |
|-------|-------|
| **Descripción** | En ReviewResults.vue, agregar un div `role="status" aria-live="polite"` que anuncie "Repaso completado: X de Y correctas" al cargar los resultados. |
| **Criterio** | Screen reader anuncia resultados automáticamente |
| **Depende de** | — |
| **Verificar** | Navegar a /results después de un review |
| **Estimación** | 1h |
| **Archivos** | `src/components/cards/ReviewResults.vue` |

---

## Lote 6: Testing Automatizado con axe-core

### TASK-6.1: Instalar @axe-core/playwright

| Campo | Valor |
|-------|-------|
| **Descripción** | `pnpm add -D @axe-core/playwright`. Configurar helper para inyectar axe en tests E2E. |
| **Criterio** | `import { injectAxe, checkA11y } from '@axe-core/playwright'` funciona |
| **Depende de** | Lotes 1-5 |
| **Verificar** | `pnpm exec playwright test --grep @a11y` corre sin errores de import |
| **Estimación** | 0.5h |
| **Archivos** | `package.json`, `tests/e2e/visual-and-accessibility.spec.ts` |

### TASK-6.2: Tests axe-core por página

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar test.describe('@a11y WCAG AAA') en visual-and-accessibility.spec.ts que recorra /login, /register, /dashboard, /library, /review, /badges, /profile. En cada página: injectAxe, checkA11y con `includedImpacts: ['critical', 'serious']` y `runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']`. |
| **Criterio** | 0 violaciones critical/serious en todas las páginas |
| **Depende de** | TASK-6.1, Lotes 1-5 |
| **Verificar** | `npx playwright test --grep @a11y` |
| **Estimación** | 3h |
| **Archivos** | `tests/e2e/visual-and-accessibility.spec.ts` |

### TASK-6.3: Tests de contraste específicos AAA

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar test que ejecute axe-core `color-contrast-enhanced` rule específicamente en modo light y dark. Reportar cualquier elemento que no cumpla 7:1. |
| **Criterio** | Todos los textos pasan color-contrast-enhanced |
| **Depende de** | TASK-1.1, TASK-1.2 |
| **Verificar** | `npx playwright test --grep "contrast.*AAA"` |
| **Estimación** | 1h |
| **Archivos** | `tests/e2e/visual-and-accessibility.spec.ts` |

### TASK-6.4: Test de skip link E2E

| Campo | Valor |
|-------|-------|
| **Descripción** | Test que verifica: Tab → skip link visible → Enter → foco en `<main>`. Medir que el skip link es el primer elemento focusable. |
| **Criterio** | Skip link funcional en todas las páginas |
| **Depende de** | TASK-2.1 |
| **Verificar** | `npx playwright test --grep "skip.link"` |
| **Estimación** | 1h |
| **Archivos** | `tests/e2e/visual-and-accessibility.spec.ts` |

### TASK-6.5: Test de landmarks E2E

| Campo | Valor |
|-------|-------|
| **Descripción** | Test axe-core que verifica landmark-one-main, landmark-banner-is-top-level, landmark-complementary-is-top-level. |
| **Criterio** | Todos los landmarks correctos |
| **Depende de** | TASK-2.2, TASK-2.3 |
| **Verificar** | axe-core landmark rules pasan |
| **Estimación** | 1h |
| **Archivos** | `tests/e2e/visual-and-accessibility.spec.ts` |

### TASK-6.6: Test de teclado completo

| Campo | Valor |
|-------|-------|
| **Descripción** | Test E2E que navega todo el flujo crítico solo con teclado: login → dashboard → library → review → (interactuar con card) → badges → profile. Cada página debe ser completamente operable. |
| **Criterio** | Flujo completo sin usar mouse |
| **Depende de** | Lotes 3, 4 |
| **Verificar** | `npx playwright test --grep "keyboard"` |
| **Estimación** | 2h |
| **Archivos** | `tests/e2e/visual-and-accessibility.spec.ts` |

---

## Lote 7: Animaciones y forced-colors

### TASK-7.1: Verificar prefers-reduced-motion en animaciones

| Campo | Valor |
|-------|-------|
| **Descripción** | ✅ YA IMPLEMENTADO en accessibility.css:97-106 y global.css:158-166. Verificar que el flip 3D de ReviewCard y animaciones de confetti (BadgeItem) respetan la media query. Agregar test E2E que mida `transition-duration` con `prefers-reduced-motion: reduce`. |
| **Criterio** | Sin animaciones visibles con reduced-motion |
| **Depende de** | — |
| **Verificar** | `page.emulateMedia({ reducedMotion: 'reduce' })` |
| **Estimación** | 0.5h |
| **Archivos** | `src/styles/accessibility.css` (verificar), `src/styles/global.css` (verificar) |

### TASK-7.2: Verificar forced-colors

| Campo | Valor |
|-------|-------|
| **Descripción** | ✅ YA IMPLEMENTADO en accessibility.css:153-163. Verificar que outline usa `CanvasText` en High Contrast Mode. Agregar test E2E que emule forced-colors. |
| **Criterio** | forced-colors:active aplica outline 2px solid CanvasText |
| **Depende de** | — |
| **Verificar** | `page.emulateMedia({ forcedColors: 'active' })` |
| **Estimación** | 0.5h |
| **Archivos** | `src/styles/accessibility.css:153-163` (verificar) |

---

## Resumen de Estimación

| Lote | Tareas | Estado | Total |
|------|--------|--------|-------|
| Lote 0: Inventario | — | ✅ accessibility.css completo | 0h |
| Lote 1: Contraste | 3 tareas | ⏳ Pendiente | 3h |
| Lote 2: Skip link + Landmarks | 3 tareas | ⏳ Pendiente | 1.5h |
| Lote 3: ARIA formularios | 4 tareas | ⏳ Pendiente | 6h |
| Lote 4: ARIA componentes UI | 6 tareas | ⏳ Pendiente | 7.5h |
| Lote 5: Live regions | 2 tareas | ⏳ Pendiente | 1.5h |
| Lote 6: Testing axe-core | 6 tareas | ⏳ Pendiente | 8.5h |
| Lote 7: Animaciones/forced-colors | 2 tareas | ⏳ Pendiente | 1h |
| **Total** | **26 tareas** | ✅ 0 + **⏳ 26** | **29h** |

## Grafo de Dependencias

```
Lote 1 (contraste) ──────────────────────────────────────────────┐
                                                                  │
Lote 2 (skip/landmarks) ──┐                                      │
                          ├── Lote 6 (testing axe-core) ←────────┤
Lote 3 (form ARIA) ───────┤                                      │
                          │                                      │
Lote 4 (component ARIA) ──┤                                      │
                          │                                      │
Lote 5 (live regions) ────┘                                      │
                                                                  │
Lote 7 (animations) ── (independiente) ──────────────────────────┘

Paralelizables:
  Lote 7 (anim/forced-color) ←→ Cualquier otro lote
  Lote 1 (contraste) ←→ Lote 2 (layout) ←→ Lote 3+4+5 pueden solaparse
  TASK-6.1 (instalar axe) puede ir en paralelo con Lotes 1-5
```
