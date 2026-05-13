# User Story THE-010: Cambio de tema (light/dark)

- **Summary:** Alternar entre tema claro (violeta/rosa) y oscuro (azul noche) con persistencia en múltiples capas

## Use Case:
- **As a** usuario de MicroLearn
- **I want to** alternar entre tema claro y oscuro desde el header o el perfil, con la preferencia persistida en localStorage, preferencia del sistema y base de datos
- **so that** pueda usar la aplicación cómodamente en cualquier entorno de luz

## Acceptance Criteria:

### Scenario 1: Alternar tema desde el header
- **Given** que estoy usando la aplicación
- **When** hago clic en el toggle de tema en el header/sidebar
- **Then** el tema cambia inmediatamente entre claro (violeta/rosa) y oscuro (azul noche), y la preferencia se guarda

### Scenario 2: Alternar tema desde el perfil
- **Given** que estoy en mi perfil
- **When** cambio la opción de tema desde la configuración de perfil
- **Then** el tema cambia y la preferencia se guarda, reflejándose en toda la aplicación

### Scenario 3: Persistencia en localStorage
- **Given** que he seleccionado un tema (claro u oscuro)
- **When** recargo la página o cierro y vuelvo a abrir la app
- **Then** el tema seleccionado se mantiene sin mostrar un flash del tema incorrecto

### Scenario 4: Respetar preferencia del sistema al primer ingreso
- **Given** que es la primera vez que visito la aplicación (sin preferencia guardada)
- **When** ingreso a la app
- **Then** el tema se define según mi preferencia del sistema operativo (`prefers-color-scheme`)

### Scenario 5: Sincronización con base de datos
- **Given** que he cambiado mi preferencia de tema
- **When** cierro sesión o cambio de dispositivo
- **Then** al iniciar sesión en otro dispositivo, mi preferencia de tema se restaura desde la base de datos

### Scenario 6: Sin flash del tema incorrecto
- **Given** que tengo una preferencia de tema guardada (claro u oscuro)
- **When** la página se carga
- **Then** el tema correcto se aplica antes del primer renderizado, sin mostrar un flash del tema opuesto

## Validaciones adicionales
- Tema claro: paleta violeta/rosa con glassmorphism
- Tema oscuro: paleta azul noche con glassmorphism oscuro
- Toggle visible en header/sidebar + disponible en perfil
- Orden de persistencia: localStorage > preferencia del sistema > DB (para sesión cruzada)
- Prevención de flash: script inline en `<head>` antes del renderizado
- La preferencia en DB se guarda en `user_preferences.theme` (o campo similar)

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario personalice su experiencia visual para sentirse cómodo y reducir fatiga visual.

### Behavioral Barriers Removed
- **Status quo effect**: Respetar `prefers-color-scheme` al primer ingreso elimina la fricción de tener que configurar manualmente
- **Uncertainty aversion**: Saber que hay tema oscuro disponible reduce la preocupación de "me va a lastimar los ojos de noche"

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Defaults inteligentes** | Usar la preferencia del sistema como default inicial = cero configuración |
| **Reducir fricción** | Toggle en header (siempre visible) vs tener que ir a settings = 1 clic vs 3+ clics |
| **Control de usuario** | Poder cambiar desde header o perfil da flexibilidad sin esfuerzo |
| **Loss aversion** | Tema oscuro reduce fatiga visual → el usuario "pierde" comodidad si no lo usa de noche |
| **Consistencia** | Persistencia cross-session (localStorage + DB) evita la molestia de reconfigurar cada vez |

### Environmental Adaptation
La preferencia de tema no es solo estética: afecta directamente la **usabilidad** (legibilidad con poca luz) y la **retención** (un usuario con fatiga visual abandona antes).

### Friction Score: 1/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Theme` — Gestiona la preferencia visual del usuario (tema claro/oscuro) y su persistencia.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Tema | Paleta de colores global (claro u oscuro) |
| Toggle | Control de alternancia entre temas |
| Preferencia del sistema | `prefers-color-scheme` del OS del usuario |
| Flash | Renderizado breve del tema incorrecto antes de aplicar el preferido |

### Aggregate Root
`UserThemePreference` — Aggregate root que representa la preferencia de tema del usuario. La identidad es el userId.

### Value Objects
- `ThemeMode` — Value object enum (light | dark). Contiene lógica de alternancia: `toggle(): ThemeMode`
- `ThemePalette` — Value object que describe los colores del tema actual. No se persiste (se deriva de ThemeMode):
  - Light: primary=#7C3AED, background gradient=lavanda, glassmorphism claro
  - Dark: primary=#06B6D4, background gradient=navy, glassmorphism oscuro
- `SystemPreference` — Value object que lee `prefers-color-scheme` del navegador

### Domain Events
- `ThemeChanged` — Ocurre cuando el usuario cambia de tema. Datos: userId, previousMode, newMode, timestamp

### Repository (Port)
`ThemePreferenceRepository` — Interfaz en dominio, implementación en infraestructura.
- `findByUserId(userId): ThemeMode | null`
- `save(userId, mode: ThemeMode): void`

### Loading Strategies (Táctico)
La preferencia se carga en orden de prioridad para prevenir el flash:
1. **localStorage** (más rápido, disponible antes del renderizado vía inline script)
2. **System preference** (fallback si no hay localStorage)
3. **Base de datos** (para sincronización cross-device, carga asíncrona post-render)

### Aggregate Invariants
- `ThemeMode` solo puede ser `light` o `dark` (no hay modo undefined)
- La preferencia en DB es eventualmente consistente con localStorage (no crítica para la UI)
- El inline script en `<head>` es la única fuente de verdad para el primer renderizado (previene flash 100%)
- El toggle es instantáneo: no requiere recarga de página ni llamada a API
