# Tareas: ONB-002 Onboarding de temas y dificultad

## Fase 1: Fundación (Backend + DB)

- [ ] 1.1 Agregar columna `difficulty` a `user_preferences` en la base de datos
  - **Descripción**: Migración de Supabase para agregar columna `difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard'))` a la tabla `user_preferences`. Actualizar tipos TypeScript en `src/types/database.ts` (Row, Insert, Update).
  - **Criterio**: Migración ejecutada. DB respeta el CHECK constraint. Todos los registros existentes tienen difficulty = 'medium'.
  - **Verificar**: `supabase migration up` + consulta directa a la tabla.
  - **Depende de**: —
  - **Archivos**: `supabase/migrations/`, `src/types/database.ts`

- [ ] 1.2 Sincronizar tipo `UserPreferences` en frontend
  - **Descripción**: Agregar `difficulty: Difficulty` al interface `UserPreferences` en `src/types/app.ts`. Importar `Difficulty` del mismo archivo.
  - **Criterio**: `UserPreferences.difficulty` existe y es del tipo `'easy' | 'medium' | 'hard'`.
  - **Verificar**: `npx tsc --noEmit` sin errores.
  - **Depende de**: 1.1
  - **Archivos**: `src/types/app.ts`

- [ ] 1.3 Confirmar action `onboarding.savePreferences` existente
  - **Descripción**: Verificar que la action ya existente en `src/actions/index.ts:318-367` funcione correctamente: validación Zod (topics min 1, difficulty default 'medium'), upsert en `user_preferences` (incluyendo difficulty), inicialización de `user_stats` con 0.
  - **Criterio**: La action persiste correctamente todos los campos y retorna `{ success: true }`.
  - **Verificar**: Prueba manual desde el formulario + inspección en Supabase dashboard.
  - **Depende de**: 1.1
  - **Archivos**: `src/actions/index.ts`

- [ ] 1.4 Verificar middleware de onboarding
  - **Descripción**: Confirmar que el middleware existente en `src/middleware/index.ts:78-96` redirige correctamente al onboarding cuando `onboarding_completed` es false/null, y que las rutas protegidas excepto `/onboarding` pasan por este check.
  - **Criterio**: Usuario nuevo autenticado es redirigido a `/onboarding` al visitar `/dashboard`. Usuario con onboarding=true pasa directo.
  - **Verificar**: Prueba de rutas con 3 escenarios: usuario nuevo, usuario onboardeado, usuario sin sesión.
  - **Depende de**: —
  - **Archivos**: `src/middleware/index.ts`

## Fase 2: UI (Componente existente — verificar y ajustar)

- [ ] 2.1 Verificar OnboardingForm.vue existente
  - **Descripción**: Revisar que el componente en `src/components/onboarding/OnboardingForm.vue` cumpla todos los RF: step 1 con selección múltiple, step 2 con dificultad, validación de al menos 1 tema, indicador de progreso, botón atrás, estado de carga, call a la action correcta, redirect a `/dashboard`.
  - **Criterio**: Todos los escenarios de la user story funcionan.
  - **Verificar**: Prueba manual de CP-001, CP-002, CP-004, CP-005, CP-006.
  - **Depende de**: —
  - **Archivos**: `src/components/onboarding/OnboardingForm.vue`

- [ ] 2.2 Verificar onboarding.astro existente
  - **Descripción**: Revisar que `src/pages/onboarding.astro` extraiga correctamente los topics desde DB (`SELECT DISTINCT topic FROM cards`), los pase como prop al componente Vue, y maneje correctamente los casos de redirección.
  - **Criterio**: Topics dinámicos desde DB. Redirección si no hay sesión. Redirección si ya completó onboarding.
  - **Verificar**: Prueba de CP-003, CP-007.
  - **Depende de**: —
  - **Archivos**: `src/pages/onboarding.astro`

- [ ] 2.3 Ajustar manejo de error de red en OnboardingForm
  - **Descripción**: Verificar que el catch block en `handleSubmit` maneje correctamente errores de red (fetch failure, timeout) mostrando el toast genérico y volviendo a habilitar el botón.
  - **Criterio**: En caso de error de red, el usuario ve el toast y puede reintentar.
  - **Verificar**: Desconectar red, completar onboarding → ver toast.
  - **Depende de**: 2.1
  - **Archivos**: `src/components/onboarding/OnboardingForm.vue`

- [ ] 2.4 Verificar indicador de progreso animado
  - **Descripción**: Confirmar que el step indicator (step-dot + step-line) se vea correctamente con transiciones CSS suaves entre pasos.
  - **Criterio**: Paso activo cambia de color con transición. Línea activa entre dots.
  - **Verificar**: Prueba visual entre paso 1 y 2.
  - **Depende de**: 2.1
  - **Archivos**: `src/components/onboarding/OnboardingForm.vue`

## Fase 3: Pruebas

- [ ] 3.1 Tests unitarios de la action `savePreferences`
  - **Descripción**: Escribir tests para `actions/onboarding.savePreferences`: validación Zod (topics vacío, difficulty inválido), upsert exitoso, error de sesión, error de DB.
  - **Criterio**: Coverage > 90% en la lógica de la action.
  - **Depende de**: 1.3
  - **Archivos**: `tests/unit/actions/onboarding.test.ts`

- [ ] 3.2 Tests unitarios del middleware (onboarding guard)
  - **Descripción**: Escribir tests para el middleware: flujo sin sesión, con sesión y onboarding completado, con sesión y onboarding pendiente, error de DB.
  - **Criterio**: Coverage > 90% en las ramas de onboarding del middleware.
  - **Depende de**: 1.4
  - **Archivos**: `tests/unit/middleware/onboarding-guard.test.ts`

- [ ] 3.3 Tests de componente OnboardingForm
  - **Descripción**: Escribir tests con Vitest + Vue Test Utils para: render de pasos, selección de temas, validación de al menos 1 tema, navegación entre pasos, submit exitoso, submit con error, estado de carga.
  - **Criterio**: Coverage > 80% en el componente.
  - **Depende de**: 2.1
  - **Archivos**: `tests/unit/components/OnboardingForm.test.ts`

- [ ] 3.4 Tests E2E del flujo completo
  - **Descripción**: Escribir tests E2E con Playwright: registro → onboarding → dashboard, onboarding → recarga → dashboard (no vuelve a onboarding), onboarding sin temas → error.
  - **Criterio**: Los 3 escenarios pasan en CI.
  - **Depende de**: 2.1, 2.2
  - **Archivos**: `tests/e2e/onboarding.spec.ts`

## Fase 4: Documentación y Deploy

- [ ] 4.1 Documentar gap de tipos detectado
  - **Descripción**: Actualizar `src/types/app.ts:38-42` agregando `difficulty: Difficulty` a `UserPreferences`. Actualizar `src/types/database.ts:106-126` agregando `difficulty` a Row, Insert, Update de `user_preferences`.
  - **Depende de**: 1.1, 1.2

- [ ] 4.2 Verificar integración con dashboard
  - **Descripción**: Confirmar que el dashboard filtra contenido según `selected_topics` y `difficulty` del usuario post-onboarding. El dashboard ya usa `selected_topics` (dashboard.astro:60).
  - **Depende de**: 1.2, 2.1

- [ ] 4.3 Deploy a preview / staging
  - **Descripción**: Desplegar a Vercel preview. Verificar flujo completo en entorno de staging.
  - **Depende de**: 3.4, 4.2

- [ ] 4.4 PR Review y merge
  - **Descripción**: Crear PR con resumen de cambios, referenciar ONB-002, solicitar review.
  - **Depende de**: 4.3

---

**Notas:**
- Tareas marcadas como "verificar" = ya existe implementación, solo requiere revisión
- Tareas marcadas como "agregar/ajustar" = requiere cambios en el código
- Las tareas 1.1 y 1.2 son críticas: hay un gap entre lo que guarda la action y los tipos locales
- Estimación: ~12-16 horas (mayormente revisión + tests)
- Prioridad: Fase 1 > Fase 2 > Fase 3 > Fase 4
