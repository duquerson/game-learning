# SPEC-THEME-010: Cambio de tema (light/dark)

## 1. Propósito y Alcance

**Propósito:** Permitir que los usuarios alternen entre tema claro (violeta/rosa) y oscuro (azul noche) con persistencia en múltiples capas (localStorage, preferencia del sistema, base de datos) y prevención de flash del tema incorrecto.

**Alcance:**
- Toggle de tema en sidebar (visible siempre en desktop)
- Toggle de tema en perfil (configuración de usuario)
- Persistencia en localStorage
- Fallback a `prefers-color-scheme` del sistema operativo
- Sincronización cross-device vía Supabase (user_preferences.theme)
- Inline script en `<head>` para prevenir flash antes del primer renderizado
- Animación suave al cambiar de tema
- CSP hash para el inline script

**Fuera de alcance:**
- Temas personalizados por el usuario (solo light/dark predefinidos)
- Programación horaria de cambio de tema
- Tema de alto contraste (se maneja vía accessibility.css)
- Editor de paleta de colores

---

## 2. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El sistema debe permitir alternar entre tema claro y oscuro desde el sidebar | Alta |
| RF-02 | El sistema debe permitir cambiar de tema desde la página de perfil | Alta |
| RF-03 | El cambio de tema debe ser instantáneo (sin recarga de página) | Alta |
| RF-04 | La preferencia debe persistir en localStorage al recargar la página | Alta |
| RF-05 | Al primer ingreso (sin localStorage), debe respetar `prefers-color-scheme` del SO | Alta |
| RF-06 | La preferencia debe persistir en `user_preferences.theme` en Supabase | Alta |
| RF-07 | Al iniciar sesión en otro dispositivo, la preferencia debe restaurarse desde DB | Media |
| RF-08 | El inline script en `<head>` debe aplicar el tema antes del primer paint | Alta |
| RF-09 | El inline script debe tener hash CSP para cumplir con Content-Security-Policy | Alta |
| RF-10 | El toggle debe mostrar un icono de luna (🌙) en modo light y sol (☀️) en modo dark | Baja |
| RF-11 | El toggle debe tener aria-label descriptivo para accesibilidad | Media |
| RF-12 | La transición entre temas debe ser suave (CSS transition en variables) | Media |

## 3. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | Flash del tema incorrecto: 0% de ocurrencia | El inline script se ejecuta antes del primer renderizado |
| RNF-02 | Tiempo de cambio de tema < 50ms | Solo mutación de atributo + cambio de CSS variables |
| RNF-03 | Sin dependencia de JavaScript para el primer paint del tema | Inline script síncrono en `<head>` |
| RNF-04 | Persistencia en localStorage disponible offline | Sin llamada a red para el cambio inicial |
| RNF-05 | Sincronización con DB es eventualmente consistente | No crítica para UX |
| RNF-06 | CLS no afectado por el cambio de tema | Todos los tamaños fijos en CSS |
| RNF-07 | CSP no bloquea el inline script | SHA-256 hash generado server-side |
| RNF-08 | Tema oscuro por defecto en SSR (sin JS) | `background-color: oklch(13% ...)` en CSS base |
| RNF-09 | Accesibilidad: ratio de contraste ≥ 4.5:1 en ambos temas | AA compliance |
| RNF-10 | El tema se mantiene durante navegación SPA (Vue client-side) | `useTheme` composable con estado reactivo |

---

## 4. Contratos de Interfaz (TypeScript)

### Value Objects

```typescript
// ---- Theme Contracts ----

// Value Objects
type ThemeMode = 'light' | 'dark'

interface ThemeModeValue {
  value: ThemeMode
  toggle(): ThemeMode
  opposite(): ThemeMode
}
```

### Domain Events

```typescript
interface ThemeChanged {
  userId?: string  // undefined si no hay sesión
  previousMode: ThemeMode
  newMode: ThemeMode
  timestamp: string  // ISO 8601
}
```

### Action Inputs

```typescript
interface UpdateThemeInput {
  theme: ThemeMode
}
```

### Action Outputs

```typescript
interface UpdateThemeOutput {
  success: true
}

interface UpdateThemeError {
  success: false
}
```

### Theme Repository Interface

```typescript
interface ThemePreferenceRepository {
  findByUserId(userId: string): Promise<ThemeMode | null>
  save(userId: string, mode: ThemeMode): Promise<void>
}
```

### Inline Script (contrato de ejecución)

```typescript
// Script que se inyecta en <head> via <script is:inline>
// Debe ejecutarse síncronamente antes del primer renderizado.
// Orden: 1) localStorage 2) prefers-color-scheme 3) dark (default)
//
// Output: document.documentElement.setAttribute('data-theme', theme)
// Input implícito: localStorage.getItem('theme'), window.matchMedia('(prefers-color-scheme: dark)')
```

### Zod Schema (server-side)

```typescript
const updateThemeSchema = z.object({
  theme: z.enum(['light', 'dark']),
})
```

---

## 5. Escenarios de Error

| Código | Escenario | Mensaje Usuario | Acción |
|--------|-----------|-----------------|--------|
| ERR-01 | Fallo al guardar en localStorage (cuota excedida) | Silencioso — el tema se aplica igual | Catch silencioso, solo console.warn |
| ERR-02 | Fallo al sincronizar con DB (sin conexión) | Toast informativo | El tema sigue funcionando con localStorage |
| ERR-03 | CSP bloquea inline script (hash mismatch) | Tema oscuro por defecto | CSS base tiene dark bg |
| ERR-04 | Valor corrupto en localStorage (no 'light' ni 'dark') | Silencioso — fallback a preferencia del sistema | Se ignora el valor y se usa prefers-color-scheme |
| ERR-05 | Sesión expirada al intentar updateTheme en DB | Silencioso — solo falla persistencia remota | No crítico, localStorage mantiene la preferencia |

---

## 6. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Flash de tema incorrecto | 0% | Inspección visual + Playwright screenshot test |
| Tiempo de cambio de tema | < 50ms | Performance.now() en toggle |
| Tasa de uso de tema oscuro | > 40% | Evento ThemeChanged con newMode='dark' |
| Tasa de sincronización con DB exitosa | > 95% | Ratio success / total calls en updateTheme action |
| Persistencia cross-session | 100% | Recarga mantiene el mismo tema |
| Friction Score (toggle) | 1/10 | 1 click para cambiar |

---

## 7. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | getInitialTheme con 'dark' en localStorage → 'dark' | 'dark' |
| UT-02 | getInitialTheme con 'light' en localStorage → 'light' | 'light' |
| UT-03 | getInitialTheme sin localStorage + prefers-dark → 'dark' | 'dark' |
| UT-04 | getInitialTheme sin localStorage + prefers-light → 'light' | 'light' |
| UT-05 | getInitialTheme en SSR (window undefined) → 'dark' | 'dark' |
| UT-06 | applyTheme setea data-theme correctamente | document.documentElement tiene data-theme='dark' |
| UT-07 | persistTheme guarda en localStorage | localStorage.getItem('theme') === 'dark' |
| UT-08 | toggle cambia light→dark y dark→light | Valor opuesto |
| UT-09 | Inline script con valor corrupto en localStorage → fallback a prefers-color-scheme | No lanza error |
| UT-10 | Zod schema valida 'light' y 'dark' | Pass |
| UT-11 | Zod schema rechaza 'system' o string vacío | Fail |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | Toggle en sidebar → data-theme cambia + localStorage se actualiza | data-theme opuesto, localStorage consistente |
| IT-02 | Toggle en perfil → mismo efecto que sidebar | Comportamiento idéntico |
| IT-03 | updateTheme action con sesión → upsert en user_preferences.theme | DB actualizada |
| IT-04 | updateTheme action sin sesión → success false silencioso | No hay error expuesto |
| IT-05 | Inline script ejecutado antes del renderizado → no hay flash | data-theme presente en el primer paint |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Click toggle en sidebar → tema cambia visualmente | data-theme opuesto, icono cambia |
| E2E-02 | Recargar página → tema se mantiene | Mismo data-theme que antes de recargar |
| E2E-03 | Abrir en incógnito + prefers-color-scheme: dark → tema oscuro | data-theme='dark' |
| E2E-04 | Abrir en incógnito + prefers-color-scheme: light → tema claro | data-theme='light' |
| E2E-05 | Cambiar tema → navegar a otra ruta SPA → tema se mantiene | data-theme consistente |
| E2E-06 | Playwright screenshot: no hay flash en carga | Screenshot inicial coincide con preferencia |
| E2E-07 | Toggle en perfil → mismo efecto | Mismo comportamiento que sidebar |

### Pruebas de Seguridad

| ID | Caso | Expected |
|----|------|----------|
| SEC-01 | Inline script no vulnerable a XSS | Solo lee localStorage, no ejecuta eval |
| SEC-02 | CSP hash coincide con contenido del script | No hay bloqueo |
| SEC-03 | updateTheme sin sesión no expone información | Solo { success: false } |
