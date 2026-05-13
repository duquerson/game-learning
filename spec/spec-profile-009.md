---
title: PRF-009 — Perfil de Usuario
version: 1.0
date_created: 2026-05-13
owner: Equipo de Producto — MicroLearn
tags: especificación, perfil, usuario, avatar, preferencias, behavioral-design, ddd, cqrs
---

# PRF-009: Perfil de Usuario

## 1. Propósito y Alcance

**Propósito:** Visualizar datos personales, estadísticas de estudio y editar temas de interés desde el perfil, consolidando información de múltiples bounded contexts en una vista unificada.

**Alcance:**
- Visualización de email y avatar con iniciales por defecto
- Estadísticas: puntos totales, racha actual, racha máxima histórica
- Galería de insignias desbloqueadas con nombre, ícono, nivel y fecha
- Edición de temas de estudio (JavaScript y/o TypeScript)
- Subida de foto de avatar (futuro: almacenamiento en Supabase Storage)
- Read model CQRS que consolida datos de Auth, UserStats, Badges, UserPreferences

**Fuera de alcance:**
- Subida/almacenamiento de foto de avatar (se declara interfaz, implementación futura)
- Edición de email (inmutable desde el perfil)
- Eliminación de cuenta
- Cambio de contraseña desde el perfil (cubierto por AUTH-001)
- Notificaciones push
- Preferencias de dificultad (se heredan del onboarding, no se editan desde perfil)

---

## 2. User Stories

### US-01: Visualizar perfil con estadísticas
**As a** usuario registrado de MicroLearn
**I want to** ver mi perfil con email, puntos totales, racha actual y máxima, insignias desbloqueadas
**So that** tenga una visión consolidada de mi progreso

**Acceptance Criteria:**
- Given que he iniciado sesión
- When navego a la página `/profile`
- Then veo mi email, avatar con mis iniciales, puntos totales acumulados, racha actual, racha máxima histórica y todas mis insignias desbloqueadas

### US-02: Avatar con iniciales por defecto
**As a** usuario sin foto de perfil
**I want to** ver mis iniciales como avatar
**So that** tenga una representación visual aunque no haya subido foto

**Acceptance Criteria:**
- Given que estoy en mi perfil
- and Given que no he subido una foto
- When veo mi avatar
- Then se muestran mis iniciales (primera letra del email en mayúscula) en un círculo con los colores del tema

### US-03: Subir foto de avatar (interfaz preparada)
**As a** usuario que quiere personalizar su perfil
**I want to** poder seleccionar una imagen para mi avatar
**So that** mi perfil se vea más personal

**Acceptance Criteria:**
- Given que estoy en mi perfil
- When hago clic en mi avatar y selecciono una imagen
- Then la imagen se guarda y reemplaza las iniciales como mi foto de perfil

### US-04: Editar temas de estudio desde el perfil
**As a** usuario cuyos intereses cambian
**I want to** modificar mis temas de estudio desde el perfil
**So that** el contenido de la biblioteca y dashboard se filtre según mis intereses actuales

**Acceptance Criteria:**
- Given que estoy en mi perfil
- When hago clic en "Editar temas"
- Then puedo modificar mi selección de temas (JavaScript y/o TypeScript) y guardar los cambios, actualizando el contenido que veo en la biblioteca y dashboard

---

## 3. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El sistema debe mostrar el email del usuario autenticado obtenido de la sesión de Supabase Auth | Alta |
| RF-02 | El sistema debe generar un avatar por defecto con la inicial del email en un círculo con colores del tema | Alta |
| RF-03 | El sistema debe permitir seleccionar una imagen para avatar (input file) y preparar el upload | Media |
| RF-04 | El sistema debe mostrar puntos totales desde `user_stats.total_points` | Alta |
| RF-05 | El sistema debe mostrar racha actual desde `user_stats.current_streak` | Alta |
| RF-06 | El sistema debe mostrar racha máxima histórica desde `user_stats.longest_streak` | Alta |
| RF-07 | El sistema debe mostrar todas las insignias desbloqueadas por el usuario con nombre, ícono, nivel y fecha | Alta |
| RF-08 | El sistema debe permitir editar `user_preferences.selected_topics` con selección múltiple | Alta |
| RF-09 | El sistema debe validar que `selected_topics` nunca esté vacío (al menos 1 tema) | Alta |
| RF-10 | El sistema debe emitir el evento de dominio `TopicsUpdated` al guardar cambios de temas | Media |
| RF-11 | El sistema debe emitir el evento de dominio `AvatarChanged` al cambiar el avatar | Media |
| RF-12 | El sistema debe cargar el perfil mediante un read model que consolide datos de 4 tablas (Auth, user_preferences, user_stats + user_badges + badges) | Alta |
| RF-13 | El sistema debe mostrar estado vacío si el usuario no tiene estadísticas aún (stats en 0) | Media |

## 4. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | El read model del perfil debe cargar en < 500ms (p95) | Supabase queries paralelas |
| RNF-02 | La actualización de temas debe completarse en < 300ms (p95) | Astro action |
| RNF-03 | Validación en servidor y cliente para `selectedTopics` | Doble capa |
| RNF-04 | El email no se expone en ningún log del servidor | Seguridad datos personales |
| RNF-05 | RLS policies impiden modificar `user_preferences` de otro usuario | Seguridad |
| RNF-06 | La página `/profile` debe ocupar < 80KB (HTML + CSS + JS) | Bundle split |
| RNF-07 | La página debe ser accesible por teclado (WCAG 2.1 AA) | Accesibilidad |
| RNF-08 | El componente de avatar debe tener un contenedor con tamaño fijo para evitar CLS | CLS < 0.1 |
| RNF-09 | Las cards de estadísticas deben tener min-height fijo para evitar CLS en hidratación Vue | CLS < 0.1 |
| RNF-10 | El input file de avatar debe estar limitado a imágenes (accept="image/*") y max 5MB | UX + Seguridad |
| RNF-11 | La sesión debe obtenerse del servidor (nunca desde el cliente directamente) | SSR cookie |

---

## 5. Contratos de Interfaz (TypeScript)

### Value Objects

```typescript
// ─── Value Objects ───────────────────────────────────────────────

type Email = string // validated: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type UserId = string // UUID v4
type Topic = string // Validado contra lista dinámica de temas disponibles. Ver spec-onboarding-002 para valores actuales.

interface InitialsAvatar {
  type: 'initials'
  initials: string       // Primera letra del email en mayúscula
  colorClass: string     // Clase Tailwind para color de fondo
}

interface UploadedAvatar {
  type: 'uploaded'
  url: string            // URL de la imagen en Supabase Storage
}

type Avatar = InitialsAvatar | UploadedAvatar

// ─── DTO Principal ───────────────────────────────────────────────

interface ProfileDTO {
  email: Email
  avatar: Avatar
  selectedTopics: Topic[]
  stats: ProfileStatsDTO
  badges: BadgeDTO[]
}

interface ProfileStatsDTO {
  totalPoints: number
  currentStreak: number
  longestStreak: number
}

interface BadgeDTO {
  id: string
  name: string
  icon: string
  level: BadgeLevel       // 'basic' | 'intermediate' | 'advanced'
  category: BadgeCategory // 'achievement' | 'streak' | 'mastery'
  unlockedAt: string      // ISO date
}

// ─── Domain Events ───────────────────────────────────────────────

interface TopicsUpdatedEvent {
  eventName: 'TopicsUpdated'
  userId: UserId
  previousTopics: Topic[]
  newTopics: Topic[]
  timestamp: string // ISO 8601
}

interface AvatarChangedEvent {
  eventName: 'AvatarChanged'
  userId: UserId
  avatarUrl: string
  timestamp: string // ISO 8601
}

// ─── Action Inputs ───────────────────────────────────────────────

interface UpdateTopicsInput {
  topics: Topic[] // min 1
}

interface UploadAvatarInput {
  // future: file binary via form data
}

// ─── Action Outputs ──────────────────────────────────────────────

interface ProfileOutput {
  success: true
  data: ProfileDTO
}

interface UpdateTopicsOutput {
  success: true
  selectedTopics: Topic[]
}

interface ProfileError {
  success: false
  error: AppErrorCode
  message: string
}
```

### Zod Schemas (server-side validation)

```typescript
// En actions/index.ts
const updateTopicsSchema = z.object({
  topics: z.array(z.string().min(1, 'Tema inválido'))
    .min(1, 'Debes seleccionar al menos un tema'),
})
```

---

## 6. Escenarios de Error

| Código | Escenario | Mensaje Usuario | HTTP/Acción |
|--------|-----------|-----------------|-------------|
| ERR-01 | Usuario sin sesión al cargar perfil | "Inicia sesión para ver tu perfil." | Middleware redirect |
| ERR-02 | Fallo al cargar stats desde user_stats | "No se pudieron cargar las estadísticas." | Catch en action → INTERNAL_ERROR |
| ERR-03 | Fallo al cargar insignias | "No se pudieron cargar tus insignias." | Catch en action → INTERNAL_ERROR |
| ERR-04 | Fallo al cargar preferencias | "No se pudieron cargar tus preferencias." | Catch en action → INTERNAL_ERROR |
| ERR-05 | 0 temas seleccionados al guardar | "Selecciona al menos un tema." | Zod validation |
| ERR-06 | Fallo de red al guardar temas | "No se pudieron guardar los cambios." | Catch en action → NETWORK_ERROR |
| ERR-07 | Archivo de avatar > 5MB | "La imagen debe medir menos de 5MB." | Client-side validation |
| ERR-08 | Archivo de avatar no es imagen | "Selecciona un archivo de imagen válido." | Client-side validation |
| ERR-09 | Supabase timeout al consultar perfil | "El perfil tardó demasiado en cargar. Intenta de nuevo." | RNF-01 breach → TIMEOUT |
| ERR-10 | Email no disponible en sesión | "No se pudo obtener la información de tu cuenta." | Catch en action → INTERNAL_ERROR |

---

## 7. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Tiempo de carga del perfil (p95) | < 500ms | RUM + Server timing |
| Tasa de edición de temas | > 15% de usuarios únicos/mes | Evento `TopicsUpdated` / usuarios activos |
| Tasa de éxito en guardado de temas | > 95% | Ratio success / total intentos |
| CLS en `/profile` | < 0.1 | Lighthouse / Web Vitals |
| Usuarios que visitan el perfil | > 40% de usuarios activos/mes | Page view analytics |
| Friction Score (editar temas) | ≤ 2/10 | Clicks para completar edición |
| Tasa de subida de avatar | > 5% de usuarios (cuando implementado) | Evento `AvatarChanged` |

---

## 8. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | Zod valida topics ['JavaScript', 'TypeScript'] | Pass |
| UT-02 | Zod rechaza topics vacío [] | Fail con mensaje |
| UT-03 | Zod rechaza topics con tema inválido ['Python'] | Fail |
| UT-04 | Zod acepta topics con 1 solo tema ['JavaScript'] | Pass |
| UT-05 | generateInitials('user@example.com') → 'U' | String |
| UT-06 | generateInitials('a@b.co') → 'A' | String |
| UT-07 | Avatar por defecto es InitialsAvatar | type === 'initials' |
| UT-08 | UserProfileRepository.findByUserId retorna null si no existe | null |
| UT-09 | ProfileDTO se construye correctamente con datos parciales (stats=0) | DTO válido |
| UT-10 | ProfileReadModel tolera user_badges vacío | badges array vacío |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | Consultar perfil completo → ProfileDTO con todos los campos | 200 + datos |
| IT-02 | Consultar perfil de usuario sin stats → stats en 0 | totalPoints = 0 |
| IT-03 | Consultar perfil de usuario sin insignias → badges vacío | [] |
| IT-04 | Actualizar temas con array válido → 200 + selectedTopics actualizados | TopicsUpdated emitido |
| IT-05 | Actualizar temas con array vacío → 400 | Zod error |
| IT-06 | Usuario sin sesión → redirect a /login | 302 |
| IT-07 | Actualizar temas de otro usuario via RLS → error | FORBIDDEN |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Navegar a /profile → ver email, avatar, stats, insignias | Todos los elementos visibles |
| E2E-02 | Avatar muestra inicial del email | Círculo con letra |
| E2E-03 | Editar temas: deseleccionar uno y guardar → toast éxito | Toast + temas actualizados |
| E2E-04 | Editar temas: deseleccionar todos → toast error no guarda | Toast "Selecciona al menos un tema" |
| E2E-05 | Perfil sin estadísticas → valores en 0 visibles | "0 puntos", "0 días" |
| E2E-06 | Perfil sin insignias → sección badges no se muestra o muestra estado vacío | Sin badges |
| E2E-07 | Click en avatar → input file se abre (futuro) | input file trigger |

### Pruebas de Seguridad

| ID | Caso | Expected |
|----|------|----------|
| SEC-01 | Usuario A no puede modificar temas de usuario B vía API | RLS → FORBIDDEN |
| SEC-02 | Email no expuesto en respuestas de error | Mensaje genérico |
| SEC-03 | Sesión requerida para acceder a /profile | Middleware redirect |
| SEC-04 | Input file de avatar solo acepta imágenes | accept="image/*" |
