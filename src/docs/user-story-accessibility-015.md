# User Story A11Y-015: Accesibilidad (WCAG 2.1 AAA)

- **Summary:** Cumplir WCAG 2.1 Level AAA con ARIA completo, skip link, navegación por teclado básica y contraste 7:1 ajustando la paleta de colores

## Use Case:
- **As a** usuario con discapacidad visual, motriz o cognitiva
- **I want to** poder usar toda la funcionalidad de MicroLearn mediante teclado, screen reader con ARIA completo y contraste suficiente
- **so that** pueda aprender sin barreras de accesibilidad

## Acceptance Criteria:

### Scenario 1: Skip link al contenido principal
- **Given** que estoy en cualquier página de la app
- **When** presiono Tab al cargar la página
- **Then** veo un enlace "Saltar al contenido principal" que al activarlo mueve el foco al `<main>` de la página

### Scenario 2: Navegación por teclado en formularios
- **Given** que estoy en un formulario (login, registro, onboarding, perfil)
- **When** navego con la tecla Tab
- **Then** puedo acceder a todos los campos, botones y enlaces en orden lógico, y veo un indicador de foco visible (outline + box-shadow) en cada elemento

### Scenario 3: ARIA labels en elementos interactivos
- **Given** que estoy usando un screen reader
- **When** interactúo con botones, enlaces, inputs y toggles
- **Then** cada elemento tiene un `aria-label` o `aria-labelledby` descriptivo (ej. "Cerrar modal de detalle de tarjeta", "Alternar tema claro/oscuro", "Iniciar repaso")

### Scenario 4: ARIA live regions para notificaciones
- **Given** que ocurre un evento asíncrono (toast de error, éxito, insignia desbloqueada)
- **When** el screen reader está activo
- **Then** los toasts y notificaciones tienen `role="status"` y `aria-live="polite"` para que el lector de pantalla los anuncie sin interrumpir

### Scenario 5: Contraste de color WCAG AAA (7:1)
- **Given** que tengo la paleta de colores actual (violeta/rosa light, azul noche dark)
- **When** se miden las relaciones de contraste de todos los textos
- **Then** el texto normal cumple 7:1 y el texto grande (>18px o >14px bold) cumple 4.5:1 contra el fondo. Los colores secundarios y muted se ajustan para cumplir el ratio

### Scenario 6: Roles ARIA en landmarks
- **Given** que estoy navegando con screen reader
- **When** exploro la estructura de la página
- **Then** los landmarks están correctamente definidos: `<header role="banner">`, `<nav role="navigation">`, `<main role="main">`, `<footer>` (si existe)

### Scenario 7: Mensajes de error accesibles
- **Given** que hay un error de validación en un formulario
- **When** el screen reader está activo
- **Then** el mensaje de error tiene `aria-describedby` vinculado al campo correspondiente, y `role="alert"` para ser anunciado inmediatamente

## Validaciones adicionales
- Todos los iconos decorativos tienen `aria-hidden="true"`
- Todos los iconos informativos tienen `aria-label` descriptivo
- Las imágenes de avatar tienen `alt` con el nombre del usuario
- El contraste se verifica con tool automatizado (axe-core) en los tests E2E
- Los tests de accesibilidad visual se ejecutan en `test:visual-a11y` con Playwright + axe-core
- Las animaciones y transiciones son suaves pero no causan problemas de parpadeo (no superan 3 flashes por segundo)
- El confetti y las animaciones de flip no interfieren con la navegación por teclado

---

## Behavioral Product Design Analysis

### Target Behavior
Que usuarios con discapacidades puedan completar el mismo flujo de aprendizaje sin barreras.

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Reducir fricción** | Skip link, foco visible, navegación por teclado |
| **Feedback inmediato** | ARIA live regions anuncian cambios sin que el usuario busque |
| **Defaults** | Roles ARIA y landmarks por defecto en la estructura HTML |

### Friction Score (con accesibilidad): 0/10 (sin barreras para nadie)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Accessibility` — Contexto transversal que aplica a toda la aplicación. No es un bounded context de dominio sino un cross-cutting concern de UI/UX.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Skip link | Enlace oculto visible al hacer focus que salta al contenido principal |
| ARIA | Accessible Rich Internet Applications — estándar de atributos para accesibilidad |
| Landmark | Región semántica de la página (header, nav, main) |
| Live region | Región que anuncia cambios dinámicos a screen readers |
| Contraste | Relación de luminancia entre texto y fondo (7:1 para AAA) |

### Implementation Notes
- Los estilos de accesibilidad ya existen en `src/styles/accessibility.css` (focus indicators, sr-only, skip-link, reduced motion, forced-colors)
- Skip link: se debe agregar el elemento HTML en BaseLayout.astro (ya hay clases CSS)
- ARIA: los componentes Vue deben tener `aria-label` y `aria-describedby` agregados
- Contraste: ajustar variables CSS en la paleta de colores (especialmente `--color-text-secondary` y `--color-text-muted`)
- Tests: `tests/e2e/visual-and-accessibility.spec.ts` ya verifica ARIA, contraste y teclado con axe-core

### Anti-Patterns Evitados
- ❌ Solo íconos sin texto → ARIA labels en todos los iconos informativos
- ❌ Animaciones que causan vértigo → No se superan 3 flashes por segundo
- ❌ Contraste insuficiente por estética → Paleta ajustada para cumplir AAA
