# Tareas: LIB-003 — Biblioteca de Tarjetas de Estudio

> Componentes `CardLibrary.vue` y `CardItem.vue` ya existen. Las tareas se centran en verificar, refinar y testear.

## Fase 1: Verificación y Refinamiento

- [ ] 1.1 Auditar CardLibrary.vue contra user story
  - **Descripción**: Revisar que todos los escenarios de la user story se cumplen. Verificar RF-001 a RF-014. Identificar gaps.
  - **Criterio**: Checklist de 14 RFs documentado con pass/fail.
  - **Verificar**: Revisión manual + comparar con AC de user-story-library-003.md
  - **Depende de**: —
  - **Archivos**: `src/components/cards/CardLibrary.vue`, `src/pages/library.astro`

- [ ] 1.2 Verificar filtro por temas del usuario (RF-013)
  - **Descripción**: Confirmar que `library.astro` usa `user_preferences.selected_topics` para filtrar tarjetas. Actualmente trae todas las cards sin filtrar por temas asignados.
  - **Criterio**: Usuario con solo tema "TypeScript" no ve tarjetas de "JavaScript".
  - **Verificar**: Prueba manual con 2 usuarios con distintos temas.
  - **Depende de**: 1.1
  - **Archivos**: `src/pages/library.astro`

- [ ] 1.3 Refactor: extraer lógica de filtros a composable
  - **Descripción**: Mover `filteredCards`, `groupedCards`, `clearFilters` + refs a `useLibraryFilters.ts` composable. Mejora testabilidad (RNF-007).
  - **Criterio**: Composable exporta estado y métodos. CardLibrary.vue lo importa. Mismo comportamiento.
  - **Verificar**: `npm run type-check` + test unitario del composable.
  - **Depende de**: 1.1
  - **Archivos**: `src/composables/useLibraryFilters.ts`, `src/components/cards/CardLibrary.vue`

- [ ] 1.4 Extraer CardPreviewModal a componente propio
  - **Descripción**: El modal inline en CardLibrary.vue merece componente separado con trampa de foco, manejo de Escape y aria-modal.
  - **Criterio**: Modal accesible (RNF-004). Focus trap. Escape cierra. Foco retorna al trigger.
  - **Verificar**: Test de accesibilidad con axe-core.
  - **Depende de**: 1.1
  - **Archivos**: `src/components/cards/CardPreviewModal.vue`, `src/components/cards/CardLibrary.vue`

## Fase 2: Tests

- [ ] 2.1 `[P]` Tests unitarios — useLibraryFilters composable
  - **Descripción**: Vitest para filtrar por tema, dificultad, subtema, búsqueda, ordenamiento, y limpiar filtros. Usar dataset fixture de 10+ tarjetas.
  - **Criterio**: > 90% branch coverage en el composable.
  - **Verificar**: `pnpm test` — todos los tests pasan.
  - **Depende de**: 1.3
  - **Archivos**: `tests/unit/useLibraryFilters.test.ts`

- [ ] 2.2 `[P]` Tests unitarios — CardItem componente
  - **Descripción**: Vitest para renderizado con props, slot, emisión de click, clase `reviewed` condicional.
  - **Criterio**: Tests pasan. Renderizado condicional cubierto.
  - **Verificar**: `pnpm test`
  - **Depende de**: —
  - **Archivos**: `tests/unit/CardItem.test.ts`

- [ ] 2.3 `[P]` Tests unitarios — CardPreviewModal
  - **Descripción**: Vitest para renderizado condicional, cierre con Escape, cierre con click overlay, cierre con botón ✕, foco atrapado.
  - **Criterio**: > 90% coverage. Escape key handler test.
  - **Verificar**: `pnpm test`
  - **Depende de**: 1.4
  - **Archivos**: `tests/unit/CardPreviewModal.test.ts`

- [ ] 2.4 Tests de integración — library.astro page
  - **Descripción**: Vitest con mocked Supabase. Verificar SSR fetch de cards + progress, filtrado por user topics.
  - **Criterio**: SSR page retorna props correctas. Usuario sin auth redirige a /login.
  - **Verificar**: `pnpm test`
  - **Depende de**: 1.2, 2.1
  - **Archivos**: `tests/integration/library-page.test.ts`

- [ ] 2.5 Tests E2E — flujo completo de biblioteca
  - **Descripción**: Playwright. Navegar a `/library` → ver tarjetas agrupadas → filtrar por tema → buscar por texto → ordenar → abrir modal → cerrar modal → iniciar repaso.
  - **Criterio**: Todos los escenarios de la user story (1-6) cubiertos.
  - **Verificar**: `pnpm test:e2e`
  - **Depende de**: 2.4
  - **Archivos**: `tests/e2e/library.spec.ts`

- [ ] 2.6 Test E2E — estado vacío
  - **Descripción**: Playwright con usuario sin tarjetas disponibles. Verificar EmptyState + enlace a perfil.
  - **Criterio**: EmptyState visible con texto y enlace funcional.
  - **Verificar**: `pnpm test:e2e`
  - **Depende de**: 2.5
  - **Archivos**: `tests/e2e/library-empty.spec.ts`

## Fase 3: UX y Accesibilidad

- [ ] 3.1 Auditoría de accesibilidad
  - **Descripción**: Verificar aria-labels en filtros, input de búsqueda, modal. Navegación por teclado. Contraste de colores.
  - **Criterio**: axe-core sin violaciones.
  - **Verificar**: Playwright + axe-core
  - **Depende de**: 1.4, 2.3
  - **Archivos**: `src/components/cards/CardLibrary.vue`

- [ ] 3.2 Verificar responsive grid
  - **Descripción**: Probar en 3 breakpoints: 375px (1 col), 768px (2 col), 1024px+ (3 col). Touch targets > 44px.
  - **Criterio**: Grid responsivo. Sin desbordamiento horizontal. Touch targets accesibles.
  - **Verificar**: Playwright con viewports o DevTools
  - **Depende de**: 2.5
  - **Archivos**: `src/components/cards/CardLibrary.vue`

- [ ] 3.3 Verificar skeleton loading state
  - **Descripción**: Confirmar que `SkeletonLoader` se muestra durante carga y desaparece al tener datos.
  - **Criterio**: No hay Cumulative Layout Shift > 0.1 (CLS).
  - **Verificar**: Lighthouse audit o Playwright
  - **Depende de**: 2.5
  - **Archivos**: `src/pages/library.astro`

## Fase 4: Documentación y Deploy

- [ ] 4.1 Documentar eventos de analytics (opcional)
  - **Descripción**: Definir eventos: `card_previewed`, `filter_applied`, `search_performed`, `review_started_from_library`. Implementar si existe sistema de analytics.
  - **Criterio**: Eventos documentados. Implementación mock lista para conectar.
  - **Depende de**: 1.1
  - **Archivos**: `src/docs/events-library-003.md`

- [ ] 4.2 PR Review y merge
  - **Descripción**: Crear PR con cambios de LIB-003. Incluir resumen de cambios, tests, y checklist de AC.
  - **Criterio**: CI verde. Approval de al menos 1 reviewer.
  - **Depende de**: 1.2, 1.3, 1.4, 2.6, 3.1, 3.2, 3.3

---

**Notas:**
- `[P]` = paralelizable
- Cada tarea estimada en 1-3 horas
- Estimación total: ~20-30 horas
- La mayoría del código ya existe (CardLibrary.vue, CardItem.vue). El foco es refinar, testear y documentar.
