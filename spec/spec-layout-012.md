# SPEC-LAYOUT-012: Layout y navegación responsiva

## 1. Propósito y Alcance

**Propósito:** Navegación adaptativa con bottom nav en mobile (<1024px) y sidebar colapsable en desktop (>=1024px), header global con stats (puntos, racha) y toggle de tema, transiciones suaves entre rutas vía View Transitions API.

**Alcance:**
- Bottom nav fijo en mobile con 5 ítems: Dashboard, Biblioteca, Repaso, Insignias, Perfil
- Sidebar colapsable en desktop con logo, enlaces, stats, toggle de tema y botón colapsar
- Header global con logo, puntos totales, racha actual ("🔥 N") y toggle de tema
- Enlace activo resaltado visualmente (ícono + texto en negrita + color primario)
- Sidebar persiste estado colapsado/expandido en localStorage
- View Transitions API para transición suave entre rutas SPA
- Padding inferior en main para evitar solapamiento con bottom nav
- Breakpoint unificado en 1024px (tailwindcss `lg`)

**Fuera de alcance:**
- Navegación por teclado avanzada (skip link ya existe en BaseLayout)
- Breadcrumbs
- Menú contextual o dropdowns en la navegación
- Notificaciones en tiempo real en el header
- Layout personalizable por el usuario

---

## 2. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | Bottom nav fijo en mobile (<1024px) con 5 ítems: 🏠 Dashboard, 📚 Biblioteca, 🔄 Repasar, 🏆 Insignias, 👤 Perfil | Alta |
| RF-02 | Bottom nav: ítem activo muestra ícono + texto (negrita + color primario); inactivos solo ícono | Alta |
| RF-03 | Sidebar visible en desktop (>=1024px) con logo, 5 enlaces, puntos totales, racha actual, toggle de tema y botón de colapsar | Alta |
| RF-04 | Sidebar colapsable a solo íconos (64px) mediante botón toggle; expandido por defecto | Alta |
| RF-05 | Sidebar persiste su estado (colapsado/expandido) en localStorage y se restaura al recargar | Alta |
| RF-06 | Header global visible en todos los tamaños con logo "🧠 MicroLearn", puntos totales, 🔥 racha y ThemeToggle | Alta |
| RF-07 | Enlace activo resaltado: fondo semitransparente + color primario + texto en negrita (sidebar y bottom nav) | Alta |
| RF-08 | View Transitions API activa para navegación entre rutas internas con fade suave | Media |
| RF-09 | Padding-bottom en `<main>` de al menos 80px en mobile para evitar solapamiento con bottom nav | Alta |
| RF-10 | Breakpoint responsivo unificado en 1024px (`lg` de Tailwind) para mostrar/ocultar sidebar vs bottom nav | Alta |
| RF-11 | Header stats se actualizan reactivamente desde Pinia/Pinia stores cuando cambian | Media |
| RF-12 | Sidebar oculto completamente en mobile; bottom nav oculto completamente en desktop | Alta |

## 3. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | Transición de colapsar/expandir sidebar < 300ms | CSS transition en width |
| RNF-02 | Sin recarga completa al navegar entre secciones | View Transitions API |
| RNF-03 | Bottom nav no bloquea contenido | padding-bottom: env(safe-area-inset-bottom, 80px) |
| RNF-04 | Sidebar state persiste entre sesiones | localStorage.getItem/setItem síncrono |
| RNF-05 | Accesibilidad: todos los enlaces tienen aria-label | Lighthouse audit |
| RNF-06 | Sin layout shift al cambiar de ruta | Altura fija de header/sidebar |
| RNF-07 | CLS < 0.1 en navegaciones | View Transitions + skeleton states |
| RNF-08 | Friction Score de navegación: 0/10 | Navegación siempre visible, 1 tap |
| RNF-09 | Header stats cargan asíncronamente sin bloquear el render | Skeleton mientras carga |

---

## 4. Contratos de Interfaz

### Value Objects

```typescript
interface NavItem {
  href: string
  icon: string
  label: string
}

type SidebarState = 'expanded' | 'collapsed'

type Breakpoint = 1024  // px, unificado

interface ActiveRoute {
  pathname: string
  isActive(href: string): boolean
}

interface HeaderStats {
  totalPoints: number
  currentStreak: number
}
```

### NavItem Registry

```typescript
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/library', icon: '📚', label: 'Biblioteca' },
  { href: '/review', icon: '🔄', label: 'Repasar' },
  { href: '/badges', icon: '🏆', label: 'Insignias' },
  { href: '/profile', icon: '👤', label: 'Perfil' },
]
```

### Action Inputs

```typescript
interface ToggleSidebarInput {
  // No inputs — lee estado actual y alterna
}

interface GetUserStatsInput {
  userId: string
}
```

### Action Outputs

```typescript
interface ToggleSidebarOutput {
  newState: SidebarState
}

interface GetUserStatsOutput {
  totalPoints: number
  currentStreak: number
}
```

### Zod Schemas

```typescript
const sidebarStateSchema = z.enum(['expanded', 'collapsed'])

const userStatsSchema = z.object({
  totalPoints: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
})
```

---

## 5. Escenarios de Error

| Código | Escenario | Mensaje Usuario | Acción |
|--------|-----------|-----------------|--------|
| ERR-01 | localStorage lleno al guardar sidebar state | Silencioso | Catch y continuar con estado por defecto |
| ERR-02 | Stats del usuario no cargan (API falla) | Mostrar "—" en lugar del valor | Skeleton → valor por defecto 0 |
| ERR-03 | View Transitions no soportadas (navegador viejo) | Silencioso | Fallback a navegación normal (href) |
| ERR-04 | Valor corrupto en localStorage sidebar-collapsed | Silencioso | Ignorar, default 'expanded' |
| ERR-05 | Ruta activa no coincide con ningún NavItem | Enlace activo vacío | No resaltar ningún item |

---

## 6. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Tiempo de navegación entre secciones | < 300ms | Performance Observer |
| CLS en navegación | < 0.1 | Web Vitals (Lighthouse) |
| Sidebar colapsado vs expandido (ratio) | > 30% colapsado | localStorage + evento analytics |
| Tasa de uso de bottom nav en mobile | > 90% de las sesiones | Analytics de click |
| Persistencia sidebar state | 100% | Recarga mantiene estado |
| View Transitions exitosas | > 95% | Navegaciones sin recarga completa |
| Friction Score (navegación) | 0/10 | 1 tap para cambiar de sección |

---

## 7. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | isActive con pathname '/dashboard' y href '/dashboard' | true |
| UT-02 | isActive con pathname '/dashboard' y href '/library' | false |
| UT-03 | toggleSidebarState 'expanded' → 'collapsed' | 'collapsed' |
| UT-04 | toggleSidebarState 'collapsed' → 'expanded' | 'expanded' |
| UT-05 | getInitialSidebarState con 'collapsed' en localStorage | 'collapsed' |
| UT-06 | getInitialSidebarState sin localStorage | 'expanded' (default) |
| UT-07 | getInitialSidebarState con valor corrupto | 'expanded' (fallback) |
| UT-08 | NavItems tienen hrefs únicos | Sin duplicados |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | Sidebar toggle → width cambia de 220px a 64px | Clase `.collapsed` aplicada |
| IT-02 | Bottom nav click → navega + resalta ítem activo | URL cambia, clase `active` en ítem correcto |
| IT-03 | Header muestra puntos desde store | Valor numérico visible |
| IT-04 | Sidebar state persiste entre recargas | localStorage.getItem coincide con UI |
| IT-05 | View Transitions: click en enlace → no hay recarga completa | `document.startViewTransition` llamado (o `data-astro-transition`) |
| IT-06 | Mobile <1024px: sidebar hidden, bottom nav visible | CSS display correcto |
| IT-07 | Desktop >=1024px: sidebar visible, bottom nav hidden | CSS display correcto |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Resize viewport a 360px → bottom nav visible, sidebar oculto | Bottom nav presente, sidebar no visible |
| E2E-02 | Resize viewport a 1280px → sidebar visible, bottom nav oculto | Sidebar presente, bottom nav no visible |
| E2E-03 | Click en sidebar toggle → sidebar colapsa | Width 64px, labels ocultos |
| E2E-04 | Recargar página con sidebar colapsado → sigue colapsado | Mismo estado visual |
| E2E-05 | Click en ítem de navegación → ruta cambia + ítem activo resaltado | Clase active en nuevo ítem |
| E2E-06 | Header stats visibles en todas las rutas | Puntos y 🔥 racha siempre presentes |
| E2E-07 | Navegación sin recarga (View Transitions) | `performance.getEntriesByType('navigation')[0].type !== 'navigate'` |
| E2E-08 | Bottom nav: ítem activo muestra texto, inactivos solo ícono | Solo 1 ítem con `.label` visible |
| E2E-09 | Padding-bottom en main evita solapamiento con bottom nav | Último elemento visible no cubierto |

### Pruebas de Seguridad

| ID | Caso | Expected |
|----|------|----------|
| SEC-01 | XSS en href de NavItem (si dinámico) | Sanitizado o hardcoded |
| SEC-02 | localStorage no expone datos sensibles | Solo guarda 'sidebar-collapsed': boolean |
