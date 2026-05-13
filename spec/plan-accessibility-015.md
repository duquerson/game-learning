# PLAN-A11Y-015: Plan Técnico — Accesibilidad WCAG 2.1 AAA

## 1. Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | Astro 5 | ^6.1.6 | SSR, layouts con skip link y landmarks |
| UI Framework | Vue 3 | ^3.4.0 | Componentes con ARIA dinámico |
| State | Pinia / composables | — | Estado accesible reactivo |
| CSS | TailwindCSS v4 + CSS custom properties | ^4.0.0 | accessibility.css con focus indicators, sr-only, reduced-motion |
| Testing a11y automation | Playwright + axe-core | latest | Scans automatizados de accesibilidad |
| Testing visual | Playwright screenshot | — | Regresión visual de skip link y focus states |
| Screen reader | NVDA / VoiceOver (prueba manual) | — | Validación manual complementaria |
| Contraste | axe-core `color-contrast-enhanced` | — | Verificación 7:1 |

---

## 2. Arquitectura

### 2.1 Mapa de Archivos Afectados

```
src/
├── layouts/
│   ├── BaseLayout.astro               ← ✅ Skip link HTML ya existe (<a class="skip-link">)
│   │                                     ⚠️ Mejorar: usar .skip-to-main, verificar href="#main-content"
│   └── AppLayout.astro                ← ✅ <main id="main-content" role="main"> ya existe
│                                        ⚠️ Agregar <header role="banner">
├── components/
│   ├── layout/
│   │   ├── Sidebar.vue                ← ✅ Nav con role="navigation" y aria-label
│   │   │                                ⚠️ Iconos decorativos: agregar aria-hidden="true"
│   │   └── BottomNav.vue              ← ✅ Nav con role="navigation" y aria-label
│   │                                     ⚠️ Iconos decorativos: aria-hidden="true"
│   ├── auth/
│   │   ├── LoginForm.vue              ← ⚠️ Agregar aria-describedby en errores, role="alert" en toasts
│   │   ├── RegisterForm.vue           ← ⚠️ Idem LoginForm
│   │   ├── ResetPasswordForm.vue      ← ⚠️ Idem LoginForm (inline en LoginForm)
│   │   └── OAuthButtons.vue           ← ✅ Iconos SVG con aria-hidden="true"
│   ├── ui/
│   │   ├── ThemeToggle.vue            ← ✅ aria-label dinámico
│   │   ├── ToasterWrapper.vue         ← ✅ role="status" aria-live="polite"
│   │   ├── GlassButton.vue            ← ⚠️ Falta aria-label cuando no hay slot text
│   │   ├── GlassCard.vue              ← ⚠️ Verificar role region si es interactivo
│   │   ├── EmptyState.vue             ← ⚠️ Anunciar con role="status"
│   │   └── SkeletonLoader.vue         ← ⚠️ aria-busy="true"
│   ├── cards/
│   │   ├── ReviewCard.vue             ← ⚠️ Botones "Ver respuesta", "No lo sabía", "Lo sabía" sin aria-label
│   │   │                                ⚠️ Quiz options sin aria-label
│   │   ├── CardItem.vue               ← ⚠️ Verificar foco y ARIA
│   │   ├── CardLibrary.vue            ← ⚠️ Verificar landmarks
│   │   └── ReviewResults.vue          ← ⚠️ Anunciar resultados con live region
│   ├── badges/
│   │   ├── BadgeItem.vue              ← ⚠️ Agregar aria-label descriptivo, alt en iconos
│   │   └── BadgeGrid.vue              ← ⚠️ role="list" + role="listitem"
│   ├── profile/
│   │   └── ProfileView.vue            ← ⚠️ Avatar sin alt, topic buttons sin aria-label
│   ├── onboarding/
│   │   └── OnboardingForm.vue         ← ⚠️ Idem formularios
│   └── AuthInitializer.vue            ← (sin cambios, no tiene UI)
├── styles/
│   ├── accessibility.css              ← ✅ Focus indicators, sr-only, skip-link, reduced-motion,
│   │                                     forced-colors, landmarks, contrast utilities, focus-trap
│   │                                  ⚠️ Ratios de contraste actuales son AA → ajustar a AAA (7:1)
│   └── global.css                     ← ⚠️ Ajustar --color-text-secondary y --color-text-muted
│                                        para cumplir 7:1 en ambos temas
├── composables/
│   └── useTheme.ts                    ← (sin cambios, no afecta accesibilidad directa)
├── stores/
│   └── review.ts / auth.ts           ← (sin cambios estructurales de a11y)
└── pages/                             ← ⚠️ Verificar que todas usen AppLayout o BaseLayout
```

### 2.2 Componentes Auditados por Prioridad WCAG AAA

| Prioridad | Componente | Criterio WCAG |
|-----------|-----------|---------------|
| P0 | BaseLayout.astro | 2.4.1 Skip Link, 4.1.1 Landmarks |
| P0 | LoginForm.vue | 2.4.3 Focus Order, 3.3.1 Error ID, 4.1.2 ARIA |
| P0 | RegisterForm.vue | 2.4.3 Focus Order, 3.3.1 Error ID |
| P0 | ToasterWrapper.vue | 4.1.3 Live Regions |
| P0 | global.css (contraste) | 1.4.6 Contrast Enhanced |
| P1 | Sidebar.vue | 1.1.1 Non-text Content, 4.1.2 ARIA |
| P1 | BottomNav.vue | 1.1.1 Non-text Content |
| P1 | ReviewCard.vue | 2.1.1 Keyboard, 4.1.2 Button Name |
| P1 | BadgeItem.vue | 1.1.1 Non-text Content |
| P1 | ProfileView.vue | 1.1.1 Avatar alt |
| P2 | GlassButton.vue | 4.1.2 Button Name |
| P2 | EmptyState.vue | 4.1.3 Status |
| P2 | SkeletonLoader.vue | 4.1.2 aria-busy |
| P2 | OnboardingForm.vue | 3.3.1 Error ID |
| P2 | CardLibrary.vue | 1.3.1 Info and Relationships |

---

## 3. Estrategia de Contraste WCAG AAA (7:1)

### 3.1 Análisis de Paleta Actual

| Variable CSS | Light (fondo oklch(97% 0.005 270)) | Dark (fondo oklch(13% 0.02 270)) |
|-------------|-------------------------------------|-----------------------------------|
| `--color-text-primary` | oklch(15% 0.02 270) ≈ #2B2B3D | oklch(100% 0 0) ≈ #FFFFFF |
| `--color-text-secondary` | oklch(40% 0.02 270) ≈ #5A5A7A | oklch(75% 0 0) ≈ #BFBFBF |
| `--color-text-muted` | oklch(55% 0.02 270) ≈ #7D7D9E | oklch(60% 0 0) ≈ #999999 |

### 3.2 Ratios Calculados (Light)

| Texto | Ratio vs fondo claro | WCAG AAA (7:1) |
|-------|---------------------|----------------|
| primary (15%) | ~13.5:1 | ✅ Pasa |
| secondary (40%) | ~5.2:1 | ❌ Falla (necesita ≥7:1) |
| muted (55%) | ~3.4:1 | ❌ Falla (necesita ≥7:1) |

### 3.3 Ratios Calculados (Dark)

| Texto | Ratio vs fondo oscuro | WCAG AAA (7:1) |
|-------|---------------------|----------------|
| primary (100%) | ~18.5:1 | ✅ Pasa |
| secondary (75%) | ~5.8:1 | ❌ Falla (necesita ≥7:1) |
| muted (60%) | ~4.1:1 | ❌ Falla (necesita ≥7:1) |

### 3.4 Ajustes Propuestos

#### Light Mode

```css
[data-theme="light"] {
  /* Actual → Nuevo */
  --color-text-secondary: oklch(30% 0.02 270);  /* era 40%, nuevo ratio ~8.5:1 */
  --color-text-muted:    oklch(40% 0.02 270);    /* era 55%, nuevo ratio ~5.2:1 → solo para texto grande (>18px) */
  /* O: si se usa muted para texto normal, subir a oklch(35% 0.02 270) */
}
```

#### Dark Mode

```css
[data-theme="dark"] {
  --color-text-secondary: oklch(82% 0 0);     /* era 75%, nuevo ratio ~7.5:1 */
  --color-text-muted:    oklch(72% 0 0);       /* era 60%, nuevo ratio ~5.5:1 → solo grande */
  /* O para texto normal: oklch(78% 0 0) → ratio ~7.2:1 */
}
```

**Nota:** Los ratios se verifican empíricamente con axe-core. Los valores oklch son aproximaciones; se debe iterar hasta que `color-contrast-enhanced` pase en todos los textos.

---

## 4. Implementación ARIA Detallada

### 4.1 Skip Link

```html
<!-- BaseLayout.astro - YA EXISTE con clase .skip-link -->
<!-- Mejora: cambiar a .skip-to-main (clase existente en accessibility.css) -->
<a class="skip-to-main" href="#main-content">Saltar al contenido principal</a>
```

### 4.2 Landmarks

```html
<!-- AppLayout.astro -->
<body>
  <header role="banner">
    <!-- logo, título de página -->
  </header>

  <nav role="navigation" aria-label="Navegación principal">
    <!-- Sidebar/BottomNav -->
  </nav>

  <main id="main-content" role="main" tabindex="-1">
    <!-- Contenido principal -->
  </main>

  <!-- Footer no requerido por ahora -->
</body>
```

### 4.3 Formularios con Errores Accesibles

```html
<!-- Patrón para todos los formularios -->
<div class="field">
  <label for="email">Email</label>
  <input
    id="email"
    aria-describedby="email-error"
    aria-invalid="true"
    aria-required="true"
  />
  <p id="email-error" role="alert" class="sr-only">
    Ingresa un email válido
  </p>
</div>
```

### 4.4 Live Regions para Toasts

```html
<!-- ToasterWrapper.vue - ✅ YA IMPLEMENTADO -->
<Toaster role="status" aria-live="polite" />

<!-- Para notificaciones de logro/insignia: -->
<div role="status" aria-live="polite" class="sr-only">
  ¡Has desbloqueado la insignia "Aprendiz"!
</div>
```

### 4.5 Iconos

```html
<!-- Decorativos (✅ YA EN OAuth SVGs) -->
<svg aria-hidden="true">...</svg>

<!-- Informativos -->
<button aria-label="Cerrar modal de detalle de tarjeta">✕</button>
```

### 4.6 Avatar

```html
<!-- ProfileView.vue - ⚠️ PENDIENTE -->
<img :src="avatarUrl" :alt="`Avatar de ${userName}`" />
<!-- O si es letra inicial: -->
<div role="img" :aria-label="`Avatar de ${email}`">A</div>
```

---

## 5. Testing Automation

### 5.1 Configuración de axe-core en Playwright

```typescript
// tests/e2e/visual-and-accessibility.spec.ts → ya existe
// Agregar helper de scan axe-core por página:

import { injectAxe, checkA11y } from 'axe-playwright'  // o getViolations

test.describe('@a11y WCAG AAA Scan', () => {
  const PAGES = ['/login', '/register', '/dashboard', '/library', '/review', '/badges', '/profile']

  for (const pagePath of PAGES) {
    test(`${pagePath} sin violaciones critical/serious`, async ({ page }) => {
      await page.goto(pagePath)
      await injectAxe(page)
      const violations = await checkA11y(page, null, {
        includedImpacts: ['critical', 'serious'],
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      })
      expect(violations.length).toBe(0)
    })
  }
})
```

### 5.2 Reglas Críticas de axe-core

| Regla | Qué detecta |
|-------|-------------|
| `color-contrast-enhanced` | Ratio 7:1 (AAA). Automático en todos los textos |
| `aria-allowed-attr` | Atributos ARIA válidos para cada rol |
| `aria-valid-attr-value` | Valores ARIA correctos |
| `button-name` | Botones con texto accesible |
| `link-name` | Enlaces con texto accesible |
| `image-alt` | Imágenes con alt text |
| `landmark-one-main` | Exactamente un `<main>` |
| `page-has-heading-one` | Un `<h1>` por página |
| `region` | Contenido en landmarks |
| `skip-link` | Enlace skip presente y funcional |

### 5.3 Pipeline CI

```yaml
# .github/workflows/a11y.yml (propuesto)
test:a11y:
  script: npx playwright test --grep @a11y
  artifacts:
    reports: playwright-report/a11y/
```

---

## 6. Dependencias Externas

| Paquete | Uso | Estado |
|---------|-----|--------|
| `axe-core` (vía `@axe-core/playwright`) | Scans automatizados de accesibilidad | Nueva dependencia requerida |
| `vue-sonner` | Toaster con role="status" ya incluido | Ya existe |
| `@playwright/test` | Tests E2E + axe-core integration | Ya existe |

---

## 7. Variables de Entorno

No se requieren nuevas variables de entorno. Toda la implementación es frontend + testing.

---

## 8. Estrategia de Implementación por Fases

| Fase | Sprint | Componentes | Duración estimada |
|------|--------|-------------|-------------------|
| Fase 1: Contraste | Sprint actual | global.css colores, accessibility.css | 1 día |
| Fase 2: Skip Link + Landmarks | Sprint actual | BaseLayout, AppLayout | 0.5 día |
| Fase 3: ARIA en formularios | Sprint actual | LoginForm, RegisterForm, OnboardingForm, ProfileView | 1.5 días |
| Fase 4: ARIA en componentes | Sprint +1 | ReviewCard, BadgeItem, CardItem, EmptyState, SkeletonLoader | 2 días |
| Fase 5: Testing axe-core | Sprint +1 | tests/e2e/visual-and-accessibility.spec.ts | 2 días |
