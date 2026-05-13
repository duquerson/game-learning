# TASKS-PRF-009: Tareas de Implementación — Perfil de Usuario

## Convenciones
- **Estimación:** 1-4h por tarea
- **Dependencias:** Tarea debe completarse antes de empezar
- **Verificar:** Comando o acción para validar la tarea
- **Archivos:** Rutas afectadas

---

## Lote 1: Read Model y Acciones (sin dependencias internas, depende de 3, 5, 8)

### TASK-1.1: Crear ProfileReadModel

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar `ProfileReadModel` que ejecuta 3 queries paralelas (user_preferences, user_stats, user_badges + badges JOIN) y construye `ProfileDTO`. Incluir tolerancia a nulos: si user_stats o user_badges no existen, retorna valores por defecto (0, []). Usar `Promise.all` para paralelismo. |
| **Criterio** | `getProfile(userId)` retorna `ProfileDTO` completo en < 500ms con datos reales o defaults |
| **Verificar** | Llamar action de perfil → verificar DTO completo con datos mocked |
| **Estimación** | 3h |
| **Archivos** | `src/lib/profile/ProfileReadModel.ts` |

### TASK-1.2: Action de perfil (get y updateTopics)

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear actions `profile.get` y `profile.updateTopics` en `src/actions/index.ts`. `get`: usa ProfileReadModel, requiere sesión. `updateTopics`: valida Zod (min 1 topic, enum JS/TS), usa createSupabaseClient, hace RLS-safe update en user_preferences, emite TopicsUpdatedEvent (log). |
| **Criterio** | GET retorna ProfileDTO. UPDATE valida, persiste y emite evento. |
| **Verificar** | `npm run type-check` sin errores. Probar con curl POST topics inválidos → 400. |
| **Estimación** | 3h |
| **Archivos** | `src/actions/index.ts`, `src/lib/profile/ProfileReadModel.ts` |

---

## Lote 2: Value Objects y Mappers (paralelo con Lote 1)

### TASK-2.1: Value Objects de Avatar

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar `Avatar` discriminated union (`InitialsAvatar | UploadedAvatar`), función `generateInitials(email: string): string` (primera letra del email en mayúscula), `defaultAvatar(email: string): InitialsAvatar` con color del tema. |
| **Criterio** | `generateInitials('user@example.com')` → `'U'`. Avatar por defecto tiene `type: 'initials'`. |
| **Verificar** | `npm run test -- tests/unit/profile/avatar.test.ts` |
| **Estimación** | 1h |
| **Archivos** | `src/lib/profile/avatar.ts` |

### TASK-2.2: ProfileMapper (DTO Builder)

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar `ProfileMapper.toDTO(data)` que toma datos crudos de DB + sesión y construye `ProfileDTO` con `ProfileStatsDTO`, `BadgeDTO[]`, `Avatar`. Mapear `badges.level` y `badges.category` a tipo estricto. Tolerar datos nulos. |
| **Criterio** | Mapeo correcto de todos los campos. BadgeDTO con level/category tipado. Stats por defecto 0 si no existen. |
| **Verificar** | Tests unitarios del mapper con datos completos, parciales y nulos |
| **Estimación** | 2h |
| **Archivos** | `src/lib/profile/ProfileMapper.ts` |

### TASK-2.3: Constantes y tipos de perfil

| Campo | Valor |
|-------|-------|
| **Descripción** | Definir tipos `ProfileDTO`, `ProfileStatsDTO`, `BadgeDTO`, `Avatar`, `InitialsAvatar`, `UploadedAvatar`, `TopicsUpdatedEvent`, `AvatarChangedEvent` en `src/types/profile.ts`. Actualizar barrel exports. |
| **Criterio** | Tipos definidos y exportados. Compatibles con `src/types/app.ts` existente. |
| **Verificar** | `npm run type-check` sin errores |
| **Estimación** | 1h |
| **Archivos** | `src/types/profile.ts` |

---

## Lote 3: Componentes UI (depende de Lote 1 + Lote 2)

### TASK-3.1: ProfileView.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente principal del perfil. Llama `actions.profile.get()` en `onMounted`. Renderiza: ProfileHeader (avatar + email), StatsGrid, BadgesSection, TopicsEditor. Maneja loading state (skeleton) y error state. Min-height fijo para evitar CLS. |
| **Criterio** | Carga y renderiza todos los componentes hijos con datos reales. Estado loading muestra skeleton. Error muestra toast. |
| **Verificar** | Navegar a /profile → ver todos los datos |
| **Estimación** | 3h |
| **Archivos** | `src/components/profile/ProfileView.vue` |

### TASK-3.2: AvatarCircle.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Componente que muestra un círculo (w-16 h-16) con la inicial del email en mayúscula y fondo del color del tema. Si hay avatar subido, muestra imagen. Al hacer clic, abre input file (preparado para futuro upload). `props: { avatar: Avatar, email: string }`. Tamaño fijo para CLS. |
| **Criterio** | Muestra inicial en círculo. Click abre input file (sin implementar upload). |
| **Verificar** | Inspeccionar DOM: círculo con letra + color. Input file hidden se abre al click. |
| **Estimación** | 2h |
| **Archivos** | `src/components/profile/AvatarCircle.vue` |

### TASK-3.3: StatsGrid.vue + StatCard.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | StatsGrid: grid de 3 columnas (responsive 1 col en mobile) con StatCards. StatCard: icono SVG, valor numérico grande, label descriptivo. `props: { stats: ProfileStatsDTO }`. Min-height fijo para CLS. Tarjeta con glass effect. |
| **Criterio** | 3 cards visibles con valores correctos. Responsive 1 col en mobile. Glass effect aplicado. |
| **Verificar** | StatCard muestra "1,250 Puntos", "15 Días", "30 Máxima" |
| **Estimación** | 2h |
| **Archivos** | `src/components/profile/StatsGrid.vue`, `src/components/profile/StatCard.vue` |

### TASK-3.4: BadgesSection.vue + BadgeCard.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | BadgesSection: título "Insignias" + grid de BadgeCards (responsive). BadgeCard: icono, nombre, nivel (badge con color), categoría, fecha de desbloqueo. Si `badges.length === 0`, mostrar EmptyBadges state: "Aún no has desbloqueado insignias. ¡Sigue estudiando!". |
| **Criterio** | Badges visibles con todos los datos. Estado vacío cuando no hay insignias. |
| **Verificar** | Usuario con insignias → se ven todas. Usuario sin insignias → mensaje vacío. |
| **Estimación** | 2h |
| **Archivos** | `src/components/profile/BadgesSection.vue`, `src/components/profile/BadgeCard.vue` |

### TASK-3.5: TopicsEditor.vue

| Campo | Valor |
|-------|-------|
| **Descripción** | Sección "Temas de estudio" con checkboxes (JavaScript, TypeScript). Botón Guardar habilitado solo si hay cambios y al menos 1 tema seleccionado. Estado de carga en submit. Conflicto: si deselecciona todos, botón deshabilitado con tooltip "Selecciona al menos un tema". Llama `actions.profile.updateTopics`. |
| **Criterio** | Guardar temas → toast éxito. Deseleccionar todos → botón deshabilitado. Error → toast error. |
| **Verificar** | Cambiar temas → Guardar → Toast "Temas actualizados". Verificar en DB. |
| **Estimación** | 3h |
| **Archivos** | `src/components/profile/TopicsEditor.vue` |

---

## Lote 4: Página y Layout (depende de Lote 3)

### TASK-4.1: Página /profile

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear `src/pages/profile.astro` con `AppLayout`. Renderiza `ProfileView.vue` con `client:load`. Inyecta datos iniciales del perfil desde servidor (SSR) para evitar flash de carga. El componente Vue se hidrata con esos datos. |
| **Criterio** | Página renderiza perfil en SSR. Vue se hidrata sin flicker. |
| **Verificar** | View source → HTML contiene datos del perfil. |
| **Estimación** | 2h |
| **Archivos** | `src/pages/profile.astro` |

### TASK-4.2: Añadir ruta /profile al middleware (si no existe)

| Campo | Valor |
|-------|-------|
| **Descripción** | Verificar que `/profile` está en la lista de rutas protegidas del middleware. Si no, agregarla. |
| **Criterio** | Acceso a /profile sin sesión → 302 a /login |
| **Verificar** | curl sin cookie → 302 |
| **Estimación** | 0.5h |
| **Archivos** | `src/middleware/index.ts` |

---

## Lote 5: Respuesta a cambios de temas (depende de Lote 3)

### TASK-5.1: Reacción cross-context al cambiar temas

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar listener/evento post-guardado que permita a Library (LIB-003) y Dashboard (DSH-007) refrescar contenido cuando cambian los temas. Opción: broadcast via Pinia store de preferencias, o refresco en `onActivated` de Vue. No requiere realtime—los componentes existentes deben reflejar el cambio al recargar o al navegar. |
| **Criterio** | Al guardar temas desde perfil, navegar a library → muestra contenido filtrado por nuevos temas |
| **Verificar** | Cambiar temas → ir a library → contenido filtrado |
| **Estimación** | 2h |
| **Archivos** | `src/stores/preferences.ts` (nuevo) o modificar `src/stores/auth.ts` |

---

## Lote 6: Testing (depende de Lotes 1, 2, 3)

### TASK-6.1: Pruebas unitarias de perfil

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Vitest: `generateInitials` (varios emails), `ProfileMapper.toDTO` (completo, parcial, nulo), Zod validation (topics válidos, vacío, inválidos), Avatar default creation. |
| **Criterio** | Coverage > 80% en `src/lib/profile/*` |
| **Verificar** | `npm run test -- tests/unit/profile` |
| **Estimación** | 3h |
| **Archivos** | `tests/unit/profile/avatar.test.ts`, `tests/unit/profile/mapper.test.ts`, `tests/unit/profile/validation.test.ts` |

### TASK-6.2: Pruebas E2E de perfil

| Campo | Valor |
|-------|-------|
| **Descripción** | Tests Playwright: navegar a /profile, ver avatar + initials + stats + badges, editar temas exitosamente, validar error al deseleccionar todos, verificar estado vacío de badges. |
| **Criterio** | Todos los escenarios Gherkin cubiertos en E2E |
| **Verificar** | `npm run test:e2e` — tests de profile pasan |
| **Estimación** | 3h |
| **Archivos** | `tests/e2e/profile/profile.spec.ts` |

---

## Resumen de Estimación

| Lote | Tareas | Total |
|------|--------|-------|
| Lote 1: Read Model + Actions | 2 tareas | 6h |
| Lote 2: Value Objects + Mappers | 3 tareas | 4h |
| Lote 3: Componentes UI | 5 tareas | 12h |
| Lote 4: Página | 2 tareas | 2.5h |
| Lote 5: Reacción cross-context | 1 tarea | 2h |
| Lote 6: Testing | 2 tareas | 6h |
| **Total** | **15 tareas** | **32.5h** |

---

## Dependencias (Grafo)

```
Lote 2 (tipos, value objects) ──┐
                                 ├── Lote 1 (read model) ──┬── Lote 3 (componentes) ──┬── Lote 4 (página)
                                 │                          │                           │
                                 │                          └── Lote 5 (cross-context) ──┘
                                 │
                                 └── Lote 6 (tests) ← depende de Lotes 1, 2, 3

TASK-2.1 ────┐
TASK-2.2 ────┤
TASK-2.3 ────┤
              ├── TASK-1.1 ──┬── TASK-1.2 ──┬── TASK-3.x (todos)
              │               │              │
              │               │              └── TASK-5.1
              │               │
              │               └── TASK-6.1
              │
              └── TASK-6.1 ──┬── TASK-6.2
                            (tests unitarios antes de E2E)

TASK-3.x → TASK-4.1
TASK-2.2 → TASK-4.2 (si necesita ajuste en middleware)

Dependencias externas:
- AUTH-001 (sesión, middleware, types AppError): todas las tareas
- ONB-002 (user_preferences schema): TASK-1.1, TASK-3.5
- PTS-005 (user_stats schema): TASK-1.1, TASK-3.3
- BDG-008 (user_badges + badges schema): TASK-1.1, TASK-3.4
- LIB-003 (filtrado cross-context): TASK-5.1
```
