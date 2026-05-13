# SPEC-A11Y-015: Accesibilidad WCAG 2.1 AAA

## 1. Propósito y Alcance

**Propósito:** Cumplir WCAG 2.1 Level AAA en toda la aplicación MicroLearn — skip link, navegación por teclado, ARIA labels, live regions, contraste 7:1, landmarks semánticos y errores accesibles.

**Alcance:**
- Skip link al contenido principal en todas las páginas
- Navegación por teclado con foco visible en formularios (login, registro, onboarding, perfil)
- ARIA labels descriptivos en todos los elementos interactivos (botones, enlaces, inputs, toggles)
- ARIA live regions (`role="status"`, `aria-live="polite"`) en toasts y notificaciones
- Contraste de color WCAG AAA (7:1 texto normal, 4.5:1 texto grande >18px o >14px bold)
- Roles ARIA en landmarks (`banner`, `navigation`, `main`)
- Mensajes de error accesibles con `aria-describedby` y `role="alert"`
- Iconos decorativos con `aria-hidden="true"`, informativos con `aria-label`
- Imágenes de avatar con `alt` descriptivo
- Tests automatizados con axe-core en E2E
- Animaciones controladas: sin parpadeo (>3 flashes/segundo prohíbido)

**Fuera de alcance:**
- WCAG 2.2 criterios nuevos (focus not obscured, drag-and-drop, target size minimum)
- Traducción multi-idioma de ARIA labels (solo español por ahora)
- Accesibilidad en contenido generado por usuarios
- Pruebas con usuarios reales con discapacidad (fase posterior)

---

## 2. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | Al presionar Tab en cualquier página, debe aparecer un enlace "Saltar al contenido principal" que al activarlo mueva el foco a `<main id="main-content">` | Alta |
| RF-02 | Todos los formularios deben tener orden de tabulación lógico (labels → inputs → botones) con foco visible (outline + box-shadow) | Alta |
| RF-03 | Todos los botones, enlaces, inputs y toggles deben tener `aria-label` o `aria-labelledby` descriptivo | Alta |
| RF-04 | Los toasts y notificaciones deben tener `role="status"` y `aria-live="polite"` para anuncios sin interrupción | Alta |
| RF-05 | El texto normal debe cumplir relación de contraste 7:1 contra su fondo | Alta |
| RF-06 | El texto grande (>18px o >14px bold) debe cumplir 4.5:1 contra su fondo | Alta |
| RF-07 | Los landmarks deben estar correctamente definidos: `<header role="banner">`, `<nav role="navigation">`, `<main role="main">` | Alta |
| RF-08 | Los mensajes de error de validación deben tener `aria-describedby` vinculado al campo correspondiente y `role="alert"` | Alta |
| RF-09 | Los iconos decorativos deben tener `aria-hidden="true"` | Alta |
| RF-10 | Los iconos informativos deben tener `aria-label` descriptivo | Alta |
| RF-11 | Las imágenes de avatar deben tener `alt` con el nombre del usuario | Media |
| RF-12 | Las animaciones (confetti, flip 3D, transiciones) no deben superar 3 flashes por segundo ni interferir con navegación por teclado | Media |
| RF-13 | El contraste debe verificarse con axe-core en los tests E2E (`test:visual-a11y`) | Alta |
| RF-14 | Los colores secondary y muted deben ajustarse en la paleta para cumplir ratio AAA | Alta |

## 3. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | Violaciones axe-core: 0 en severity critical y serious | Todos los tests E2E de accesibilidad pasan |
| RNF-02 | Proporción de contraste mínima: 7:1 para texto normal | Medición con axe-core color-contrast |
| RNF-03 | Sin pérdida de funcionalidad por teclado | Todos los flujos completables solo con Tab + Enter |
| RNF-04 | Los ARIA labels no deben estar vacíos ni duplicados en el mismo contexto | Auditoría axe-core + revisión manual |
| RNF-05 | Skip link debe ser el primer elemento focusable en el DOM | Tab al cargar la página |
| RNF-06 | Animaciones no obstructivas: duración total < 3s, sin parpadeo > 3Hz | prefers-reduced-motion respetado |
| RNF-07 | Compatibilidad con forced-colors (Windows High Contrast Mode) | Media query `forced-colors: active` en accessibility.css |
| RNF-08 | Tiempo de carga no incrementado > 50ms por los cambios de ARIA | Solo atributos HTML, sin JS adicional pesado |

---

## 4. Contratos de Interfaz (TypeScript)

### Value Objects

```typescript
type ContrastRatio = number  // 7.0 | 4.5 | 3.0

interface AriaLabel {
  value: string
  forElement: string  // CSS selector o id del elemento objetivo
}

interface SkipLinkProps {
  href: string        // "#main-content"
  label: string       // "Saltar al contenido principal"
  visibleOnFocus: boolean
}
```

### Domain Events

```typescript
interface FocusMovedToMain {
  timestamp: string
  sourcePage: string
}

interface AriaAnnouncement {
  message: string
  region: 'status' | 'alert' | 'log'
  polite: boolean
}
```

### Validation Contracts

```typescript
interface AccessibleError {
  fieldId: string
  message: string
  ariaDescribedBy: string  // ej. "email-error"
  role: 'alert'
}

interface AccessibleFormField {
  id: string
  label: string
  ariaDescribedBy?: string
  ariaRequired?: boolean
  ariaInvalid?: boolean
}
```

---

## 5. Escenarios de Error

| Código | Escenario | Mensaje Usuario | Acción |
|--------|-----------|-----------------|--------|
| A11Y-ERR-01 | Skip link no visible por CSS sobreescrito | El enlace debe aparecer al hacer Tab | Verificar cascade CSS, `!important` en caso necesario |
| A11Y-ERR-02 | ARIA label duplicado en elementos del mismo rol | Screen reader anuncia nombres ambiguos | Revisar unicidad de labels por contexto |
| A11Y-ERR-03 | Contraste 7:1 no alcanzable con paleta actual sin romper diseño | Ajustar colores secondary/muted | Usar variantes más oscuras/claras manteniendo identidad |
| A11Y-ERR-04 | `aria-describedby` apunta a ID inexistente | Error no anunciado | Validar matching IDs en el DOM |
| A11Y-ERR-05 | focus-trap en modal bloquea skip link | Usuario no puede saltar contenido | Asegurar que skip link está fuera del focus-trap |

---

## 6. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Violaciones axe-core critical+serious | 0 | `npx playwright test --grep @a11y` + axe-core scan |
| Ratio de contraste promedio en textos | ≥ 7:1 | axe-core color-contrast enhanced |
| Elementos interactivos sin ARIA label | 0 | axe-core aria-label scan |
| Landmarks faltantes o incorrectos | 0 | axe-core landmark scan |
| Elementos focusables sin foco visible | 0 | axe-core focusable-content + revisión manual |
| Cobertura de tests de accesibilidad | 100% de flujos críticos | Test mapping por página |
| Friction Score (accesibilidad) | 0/10 | Sin barreras para screen reader ni teclado |

---

## 7. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | skipLink es el primer elemento focusable en BaseLayout | `document.activeElement` después de Tab es skip-link |
| UT-02 | Click en skip-link mueve foco a `#main-content` | `document.activeElement` es `<main>` |
| UT-03 | `aria-label` en ThemeToggle cambia según tema | "Cambiar a tema oscuro" en light, "Cambiar a tema claro" en dark |
| UT-04 | ToasterWrapper tiene `role="status"` y `aria-live="polite"` | Atributos presentes en el DOM |
| UT-05 | Colores `--color-text-secondary` tienen ratio ≥ 7:1 contra fondo | Cálculo de luminancia relativa |
| UT-06 | Colores `--color-text-muted` tienen ratio ≥ 7:1 contra fondo | Cálculo de luminancia relativa |
| UT-07 | `role="alert"` presente en mensajes de error | Atributo renderizado |
| UT-08 | Icono decorativo (OAuth svg) tiene `aria-hidden="true"` | Atributo presente |
| UT-09 | `aria-describedby` en input apunta a ID existente en el DOM | Error message ID coincide |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | Skip link visible al hacer Tab en LoginForm | Enlace visible y focusable |
| IT-02 | Navegación Tab en LoginForm: email → password → forgot link → submit | Orden lógico, todos focusables |
| IT-03 | Navegación Tab en RegisterForm: email → password → confirm → submit | Orden lógico |
| IT-04 | Error de login: toast se anuncia con live region | `role="status"` presente |
| IT-05 | BadgeItem bloqueado tiene icono decorativo con `aria-hidden="true"` | Sin anuncio duplicado |
| IT-06 | Sidebar.nav tiene `role="navigation"` y `aria-label` | Landmark presente |

### Pruebas E2E (Playwright + axe-core)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | `/login` — axe-core scan sin violations critical/serious | Pasa |
| E2E-02 | `/register` — axe-core scan sin violations critical/serious | Pasa |
| E2E-03 | `/dashboard` — axe-core scan sin violations critical/serious | Pasa |
| E2E-04 | `/library` — axe-core scan sin violations critical/serious | Pasa |
| E2E-05 | `/review` — axe-core scan sin violations critical/serious | Pasa |
| E2E-06 | `/badges` — axe-core scan sin violations critical/serious | Pasa |
| E2E-07 | `/profile` — axe-core scan sin violations critical/serious | Pasa |
| E2E-08 | Tab navigation full flow: login → dashboard → library → review → badges → profile | Todos los elementos focusables accesibles |
| E2E-09 | Skip link aparece al primer Tab y mueve foco a `<main>` | Foco en main |
| E2E-10 | Contraste de todos los textos medido con axe-core color-contrast enhanced | Todos ≥ 7:1 |
| E2E-11 | Landmarks scan: banner, navigation, main presentes | axe-core landmark-one-main, landmark-banner, landmark-complementary |
| E2E-12 | prefers-reduced-motion: reduce activado → animaciones desactivadas | transition-duration: 0.01ms |
| E2E-13 | forced-colors activo → outline 2px solid CanvasText | Estilo computado correcto |
| E2E-14 | Error de formulario con `aria-describedby` y `role="alert"` | axe-core aria-valid-attr-value pasa |
| E2E-15 | Dark mode contrast scan | Todos los textos ≥ 7:1 en dark |
| E2E-16 | Light mode contrast scan | Todos los textos ≥ 7:1 en light |
| E2E-17 | ReviewCard flip animación no interfiere con teclado | Foco manejable tras flip |
| E2E-18 | Confetti en badge unlock no bloquea foco | Foco permanece en elemento activo |

### Pruebas de Regresión Visual

| ID | Caso | Expected |
|----|------|----------|
| VIS-01 | Screenshot login page con skip link visible | Skip link visible al hacer focus |
| VIS-02 | Screenshot formulario con error accesible | `aria-describedby` y `role="alert"` visibles en DOM |
| VIS-03 | Screenshot en forced-colors mode | Todos los outlines visibles |

---

## 8. Reglas de axe-core a Verificar

| Regla axe-core | Target | Impacto |
|----------------|--------|---------|
| `color-contrast-enhanced` | Todos los textos | critical |
| `aria-label` | Elementos interactivos | serious |
| `aria-valid-attr-value` | Todos los ARIA attributes | serious |
| `landmark-one-main` | Estructura de página | serious |
| `landmark-banner-is-top-level` | Header | moderate |
| `landmark-complementary-is-top-level` | Sidebar | moderate |
| `skip-link` | Enlace de salto | critical |
| `focusable-content` | Elementos focusables | serious |
| `button-name` | Botones con texto accesible | critical |
| `link-name` | Enlaces con texto accesible | critical |
| `image-alt` | Imágenes con alt text | critical |
| `meta-viewport` | Viewport no restrictivo | low |
| `scrollable-region-focusable` | Regiones scrolleables | moderate |
| `nested-interactive` | Elementos interactivos anidados | critical |
