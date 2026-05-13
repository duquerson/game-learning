# PLAN-THEME-010: Plan Técnico — Cambio de tema (light/dark)

## 1. Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | Astro | ^6.1.6 | SSR + inline script en layout |
| UI Framework | Vue 3 | ^3.4.0 | ThemeToggle.vue, useTheme composable |
| State | Composable (ref reactivo) | — | Estado de tema en cliente (sin Pinia) |
| CSS | TailwindCSS v4 + CSS custom properties | ^4.0.0 | Variables de tema en `:root` y `[data-theme]` |
| Persistencia local | localStorage | — | `theme` key en cliente |
| Persistencia remota | Supabase (`user_preferences.theme`) | — | Sincronización cross-device |
| Server Actions | `astro:actions` (`auth.updateTheme`) | — | Guardar tema en DB |
| CSP | `Astro.csp.insertScriptHash()` | — | Hash SHA-256 del inline script |

---

## 2. Arquitectura

### 2.1 Diagrama de Flujo (Mermaid)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant AstroServer
    participant Action
    participant SupabaseDB

    Note over User,SupabaseDB: --- CARGA INICIAL (prevención de flash) ---

    Browser->>AstroServer: GET / (o cualquier página)
    AstroServer->>Html: Inline script en <head> (is:inline)
    Note over Html: 1) Lee localStorage.getItem('theme')<br/>2) Fallback: prefers-color-scheme<br/>3) Fallback: 'dark'<br/>4) setAttribute('data-theme', theme)
    AstroServer-->>Browser: HTML + inline script ejecutado síncrono
    Browser->>User: Primer paint con tema correcto (sin flash)

    Note over User,SupabaseDB: --- CAMBIO DE TEMA (sidebar / perfil) ---

    User->>Browser: Click en ThemeToggle
    Browser->>useTheme.toggle(): Alterna light↔dark
    useTheme->>Browser: applyTheme() → data-theme cambia
    useTheme->>Browser: persistTheme() → localStorage.setItem('theme', newTheme)
    useTheme->>Action: actions.auth.updateTheme({ theme: newTheme })
    alt Hay sesión
        Action->>SupabaseDB: UPSERT user_preferences SET theme = newTheme
        SupabaseDB-->>Action: OK
    else No sesión
        Action-->>useTheme: { success: false } (silencioso)
    end
    Browser->>User: Tema actualizado instantáneamente

    Note over User,SupabaseDB: --- CARGA EN OTRO DISPOSITIVO ---

    User->>Browser: Inicia sesión en otro dispositivo
    Browser->>AstroServer: GET / (nuevo dispositivo, sin localStorage)
    AstroServer->>Html: Inline script → no hay localStorage → prefers-color-scheme
    AstroServer-->>Browser: Render inicial con preferencia del SO
    Note over Browser: (post-render) Se carga sesión
    Browser->>Action: actions.auth.getSession()
    Action->>SupabaseDB: SELECT theme FROM user_preferences
    SupabaseDB-->>Action: 'dark'
    Action-->>Browser: theme = 'dark'
    Browser->>Browser: applyTheme('dark') + persistTheme('dark')
    Browser->>User: Tema sincronizado desde DB
```

### 2.2 Mapa de Archivos Afectados

```
src/
├── layouts/
│   └── BaseLayout.astro          ← Inline script + CSP hash (YA IMPLEMENTADO)
├── components/
│   ├── ui/
│   │   └── ThemeToggle.vue       ← Componente toggle (YA IMPLEMENTADO)
│   ├── layout/
│   │   ├── Sidebar.vue           ← Ya importa ThemeToggle (YA IMPLEMENTADO)
│   │   └── BottomNav.vue         ← No necesita toggle (solo navegación)
│   └── profile/
│       └── ProfileView.vue       ← PENDIENTE: agregar selector de tema
├── composables/
│   └── useTheme.ts               ← Lógica de tema (YA IMPLEMENTADO)
├── lib/
│   ├── theme.ts                  ← getInitialTheme, applyTheme, persistTheme (YA IMPLEMENTADO)
│   └── supabase.ts               ← Cliente Supabase (YA IMPLEMENTADO)
├── actions/
│   └── index.ts                  ← auth.updateTheme action (YA IMPLEMENTADO)
├── styles/
│   └── global.css                ← Variables CSS [data-theme] (YA IMPLEMENTADO)
├── types/
│   └── app.ts                    ← PENDIENTE: agregar theme en UserPreferences
└── pages/
    └── profile.astro             ← PENDIENTE: pasar tema desde BD al perfil
```

---

## 3. Estrategia de Inline Script (Prevención de Flash)

### 3.1 Script Inline en `<head>`

```html
<!-- BaseLayout.astro -->
<script is:inline>
(function() {
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
</script>
```

**Propiedades:**
- Síncrono: bloquea el renderizado hasta ejecutarse
- Sin dependencias externas: 0 imports, 0 llamadas a red
- Tamaño: ~180 bytes comprimido

### 3.2 Orden de Resolución

| Prioridad | Fuente | Cuándo se lee |
|-----------|--------|---------------|
| 1 | `localStorage.getItem('theme')` | Inline script en `<head>` |
| 2 | `window.matchMedia('(prefers-color-scheme: dark)')` | Fallback si no hay localStorage |
| 3 | `'dark'` (hardcoded) | Fallback final si no hay ninguna fuente |
| 4 | `user_preferences.theme` (DB) | Post-render asíncrono, sobreescribe si hay sesión |

### 3.3 CSP Hash

```typescript
// En BaseLayout.astro (frontmatter)
import { createHash } from 'node:crypto'

const themeInitScript = "(function(){...})();"
const themeInitHash = `sha256-${createHash('sha256').update(themeInitScript).digest('base64')}`
Astro.csp?.insertScriptHash(themeInitHash)
```

---

## 4. Persistencia

### 4.1 localStorage

| Key | Value | Seteado por |
|-----|-------|-------------|
| `theme` | `'light'` \| `'dark'` | `persistTheme()` en toggle |
| | | `applyTheme()` en sincronización DB |

### 4.2 Base de Datos (Supabase)

```sql
-- Tabla: user_preferences
-- Columna: theme TEXT CHECK (theme IN ('light', 'dark'))
-- Se upserta vía action auth.updateTheme
-- Política RLS: auth.uid() = user_id
```

Estrategia: **eventual consistency**: el toggle es instantáneo (localStorage), la DB se actualiza asíncronamente. Si falla la DB, el usuario no percibe nada.

### 4.3 Preferencia del Sistema

```typescript
window.matchMedia('(prefers-color-scheme: dark)').matches
// → boolean
```

Se usa solo como fallback. No se persiste cross-session.

### 4.4 Orden de Lectura (Carga)

```
localStorage → prefers-color-scheme → 'dark' (default SSR)
       ↑                    ↑               ↑
   inline script        inline script     CSS base
```

---

## 5. Paletas de Colores

### Tema Oscuro (azul noche) — Default

| Variable | Valor | Propósito |
|----------|-------|-----------|
| `--glass-bg` | `rgba(255,255,255,0.08)` | Fondo glassmorphism |
| `--glass-border` | `rgba(255,255,255,0.12)` | Bordes glass |
| `--glass-shadow` | `0 8px 32px rgba(0,0,0,0.3)` | Sombras glass |
| `--color-text-primary` | `oklch(100% 0 0)` | Texto principal (blanco) |
| `--color-text-secondary` | `oklch(75% 0 0)` | Texto secundario |
| `--color-text-muted` | `oklch(60% 0 0)` | Texto tenue |
| Fondo `html/body` | `oklch(13% 0.02 270)` | Fondo base |
| Acento primario | `oklch(72% 0.19 155)` | Verde teal (shared) |

### Tema Claro (violeta/rosa)

| Variable | Valor | Propósito |
|----------|-------|-----------|
| `--glass-bg` | `rgba(255,255,255,0.6)` | Fondo glassmorphism claro |
| `--glass-border` | `rgba(0,0,0,0.08)` | Bordes glass sutiles |
| `--glass-shadow` | `0 8px 32px rgba(0,0,0,0.1)` | Sombras suaves |
| `--color-text-primary` | `oklch(15% 0.02 270)` | Texto principal (casi negro) |
| `--color-text-secondary` | `oklch(40% 0.02 270)` | Texto secundario |
| `--color-text-muted` | `oklch(55% 0.02 270)` | Texto tenue |
| Fondo `html/body` | `oklch(97% 0.005 270)` | Fondo base claro |

---

## 6. Componentes y Flujo

### 6.1 Árbol de Componentes

```
BaseLayout
├── <script is:inline>               ← Inline script for flash prevention
└── <slot /> → AppLayout / páginas
    ├── Sidebar.vue
    │   └── ThemeToggle.vue           ← Toggle en sidebar (client:idle)
    ├── ProfileView.vue
    │   └── theme-selector (NUEVO)    ← Selector en perfil (usando useTheme)
    └── BottomNav.vue
```

### 6.2 Flujo de Cambio de Tema

```
User click → ThemeToggle.vue
  └── useTheme.toggle()
        ├── theme.value = newTheme
        ├── applyTheme(newTheme)     → document.documentElement.dataset.theme
        ├── persistTheme(newTheme)   → localStorage.setItem('theme')
        └── actions.auth.updateTheme → supabase user_preferences (best-effort)
```

---

## 7. Dependencias Externas

| Paquete | Uso | Estado |
|---------|-----|--------|
| `astro:actions` | Server action `auth.updateTheme` | Ya existe |
| `localStorage` (Web API) | Persistencia local | Nativo del browser |

No se requieren nuevas dependencias. Todo el stack ya está en el proyecto.

---

## 8. Variables de Entorno

No se requieren nuevas variables de entorno. La feature usa únicamente recursos del cliente (localStorage, `matchMedia`) y las actions ya existentes de Supabase.
