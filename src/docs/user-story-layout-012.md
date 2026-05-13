# User Story LYT-012: Layout y navegación responsiva

- **Summary:** Navegación adaptativa con bottom nav en mobile (iconos + texto en seleccionado) y sidebar colapsable en desktop, con logo, stats y toggle de tema

## Use Case:
- **As a** usuario de MicroLearn en cualquier dispositivo
- **I want to** navegar entre las secciones de la app mediante bottom nav en mobile y sidebar colapsable en desktop, viendo siempre mis puntos y racha, con toggle de tema accesible
- **so that** pueda moverme rápidamente entre secciones sin importar el tamaño de pantalla

## Acceptance Criteria:

### Scenario 1: Bottom nav en mobile
- **Given** que estoy usando MicroLearn en un dispositivo móvil (< 1024px)
- **When** navego entre secciones
- **Then** veo un bottom nav fijo en la parte inferior con íconos para Dashboard, Biblioteca, Repaso, Insignias y Perfil. El ítem activo muestra ícono + texto; los inactivos solo ícono

### Scenario 2: Sidebar colapsable en desktop
- **Given** que estoy usando MicroLearn en desktop (>= 1024px)
- **When** navego entre secciones
- **Then** veo un sidebar colapsable (abierto por defecto) con logo, enlaces a Dashboard, Biblioteca, Repaso, Insignias, Perfil, puntos totales, racha actual y toggle de tema. Puedo colapsarlo a solo íconos con un botón toggle

### Scenario 3: Header con stats globales
- **Given** que estoy en cualquier página
- **When** miro la parte superior
- **Then** veo un header con el logo de MicroLearn, mis puntos totales, mi racha actual ("🔥 N") y el toggle de tema claro/oscuro

### Scenario 4: Enlace activo resaltado
- **Given** que estoy navegando entre secciones
- **When** estoy en una página (ej. /dashboard)
- **Then** el enlace correspondiente en bottom nav (mobile) o sidebar (desktop) está visualmente resaltado indicando la sección activa

### Scenario 5: Sidebar persiste su estado
- **Given** que colapsé o expandí el sidebar en desktop
- **When** recargo la página
- **Then** el estado del sidebar (colapsado/expandido) se mantiene

### Scenario 6: Transición suave entre rutas
- **Given** que navego a otra sección
- **When** hago clic en un enlace del menú
- **Then** la transición es suave (View Transitions) sin recarga completa de la página

## Validaciones adicionales
- Bottom nav visible solo en mobile (< 1024px)
- Sidebar visible solo en desktop (>= 1024px)
- Header visible en todos los tamaños con stats y toggle de tema
- Sidebar colapsable con botón toggle, persiste estado en localStorage
- Bottom nav con íconos: 🏠 📚 🧪 🏆 👤
- Item activo: ícono + texto (negrita + color primario); inactivos: solo ícono
- Sin solapamiento entre bottom nav y contenido (padding-bottom en main)

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario navegue rápidamente entre secciones sin fricción, manteniendo visibles sus stats motivacionales (puntos y racha).

### Behavioral Barriers Removed
- **Friction reduction**: Bottom nav (1 tap) y sidebar colapsable minimizan clicks para cambiar de sección
- **Status quo effect**: Stats siempre visibles refuerzan el deseo de mantener racha y acumular puntos

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Reducir fricción** | Bottom nav / sidebar siempre visibles = cambiar de sección en 1 tap |
| **Loss aversion** | Stats visibles constantemente activan miedo a perder racha |
| **Defaults** | Sidebar expandido por defecto en desktop |
| **Consistencia** | Misma navegación sin importar la página actual |
| **Control de usuario** | Sidebar colapsable da control sobre el espacio de trabajo |

### Friction Score: 0/10 (la navegación siempre está presente, no requiere acción para aparecer)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Navigation` — Gestiona el layout y la navegación global de la aplicación. No es un bounded context de dominio sino un contexto de UI/infraestructura.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Bottom nav | Barra de navegación inferior fija en mobile |
| Sidebar | Panel lateral de navegación en desktop |
| Header | Barra superior con logo, stats y toggle |
| Enlace activo | Enlace correspondiente a la ruta actual |

### Aggregate Root
No aplica (no hay lógica de dominio en navegación). Es puramente UI.

### Value Objects
- `NavItem` — Value object que representa un ítem de navegación (label, icon, route, active)
- `SidebarState` — Value object enum (expanded | collapsed), persistido en localStorage
- `Breakpoint` — Value object que determina mobile vs desktop (1024px)
- `ActiveRoute` — Value object que determina qué enlace está activo según la URL actual

### Integration
Consume datos de otros bounded contexts (solo lectura):
- **Gamification**: totalPoints, currentStreak (header)
- **Theme**: ThemeMode (toggle en header/sidebar)

No genera eventos de dominio ni modifica estado de negocio.
