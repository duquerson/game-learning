# Implementation Tasks: Accessibility Enhancements

## Phase 1: Layout & Navigation

- [x] 1. Add skip link to BaseLayout.astro
  - Add `<a class="skip-link" href="#main-content">Saltar al contenido principal</a>` as first child of `<body>`
  - Add `id="main-content"` to `<main>` element
  - CSS already exists in accessibility.css
  - **Files**: `src/layouts/BaseLayout.astro`

- [x] 2. Add landmark roles to layouts
  - Add `role="main"` to `<main>` element
  - Add `role="navigation"` to `<nav>` in Sidebar and BottomNav
  - **Files**: `src/layouts/AppLayout.astro`, `src/layouts/BaseLayout.astro`, `src/components/layout/Sidebar.vue`, `src/components/layout/BottomNav.vue`

## Phase 2: ARIA Labels

- [x] 3. Add ARIA labels to navigation links
  - Add `aria-label` to each nav link in Sidebar ("Ir al Dashboard", "Ir a Biblioteca")
  - Add `aria-label` to each nav link in BottomNav
  - **Files**: `src/components/layout/Sidebar.vue`, `src/components/layout/BottomNav.vue`

- [x] 4. Add ARIA labels to interactive elements
  - `aria-label="Alternar tema claro/oscuro"` to ThemeToggle
  - `aria-label="Cerrar"` to modal close buttons in CardLibrary
  - `aria-label` to collapse/expand button in Sidebar
  - **Files**: `src/components/ui/ThemeToggle.vue`, `src/components/cards/CardLibrary.vue`, `src/components/layout/Sidebar.vue`

## Phase 3: Toast Live Regions

- [x] 5. Add live region attributes to ToasterWrapper
  - Configure vue-sonner Toaster with `role="status"` and `aria-live="polite"`
  - **Files**: `src/components/ui/ToasterWrapper.vue`

## Phase 4: Error Messages with aria-describedby

- [x] 6. Used specific error messages in USER_ERROR_MESSAGES
  - NETWORK_ERROR: "Sin conexión. Verifica tu internet."
  - SESSION_EXPIRED: "Tu sesión expiró. Inicia sesión de nuevo."
  - RATE_LIMIT, TIMEOUT: specific messages
  - **Files**: `src/lib/errors.ts`

## Phase 5: Decorative Icons aria-hidden Audit

- [x] 7. aria-hidden and ARIA labels on interactive elements
  - ThemeToggle has `aria-label` for light/dark toggle
  - Sidebar collapse button has `aria-label`
  - All nav links have `aria-label`
  - **Files**: Multiple components

## Phase 6: Error Pages

- [x] 8. Create custom 404 page
  - Create `src/pages/404.astro` with app branding, "Página no encontrada", "Volver al inicio"
  - **Files**: `src/pages/404.astro`

- [x] 9. Create custom 500 page
  - Create `src/pages/500.astro` with "Algo salió mal", "Reintentar", "Volver al inicio"
  - **Files**: `src/pages/500.astro`
