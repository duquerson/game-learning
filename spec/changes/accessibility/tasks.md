# Implementation Tasks: Accessibility Enhancements

## Phase 1: Layout & Navigation

1. [ ] Add skip link to BaseLayout.astro
  - Add `<a class="skip-link" href="#main-content">Saltar al contenido principal</a>` as first child of `<body>`
  - Add `id="main-content"` to `<main>` element
  - CSS already exists in accessibility.css
  - **Files**: `src/layouts/BaseLayout.astro`

2. [ ] Add landmark roles to layouts
  - Add `role="banner"` to `<header>` element
  - Add `role="navigation"` to `<nav>` in Sidebar and BottomNav
  - Add `role="main"` to `<main>` element
  - **Files**: `src/layouts/BaseLayout.astro`, `src/layouts/AppLayout.astro`, `src/components/layout/Sidebar.vue`, `src/components/layout/BottomNav.vue`

## Phase 2: ARIA Labels

3. [ ] Add ARIA labels to navigation links
  - Add `aria-label` to each nav link in Sidebar (e.g., "Ir al Dashboard", "Ir a Biblioteca")
  - Add `aria-label` to each nav link in BottomNav
  - **Files**: `src/components/layout/Sidebar.vue`, `src/components/layout/BottomNav.vue`

4. [ ] Add ARIA labels to interactive elements
  - `aria-label="Alternar tema claro/oscuro"` to ThemeToggle
  - `aria-label="Cerrar"` to modal close buttons in CardLibrary
  - `aria-label="Iniciar repaso"` to review buttons
  - **Files**: `src/components/ui/ThemeToggle.vue`, `src/components/cards/CardLibrary.vue`, `src/components/cards/CardItem.vue`

## Phase 3: Toast Live Regions

5. [ ] Add live region attributes to ToasterWrapper
  - Configure vue-sonner Toaster with `role="status"` and `aria-live="polite"`
  - Verify screen reader announces toast messages
  - **Files**: `src/components/ui/ToasterWrapper.vue`

## Phase 4: Error Messages with aria-describedby

6. [ ] Add inline error messages with aria-describedby to forms
  - LoginForm: show error inline below email/password inputs with `aria-describedby`
  - RegisterForm: same pattern for each field
  - OnboardingForm: same pattern for topic selection
  - ResetPasswordForm: same pattern for password fields
  - **Files**: `src/components/auth/LoginForm.vue`, `src/components/auth/RegisterForm.vue`, `src/components/onboarding/OnboardingForm.vue`, `src/components/auth/ResetPasswordForm.vue`

## Phase 5: Decorative Icons aria-hidden Audit

7. [ ] Audit and fix aria-hidden on all icons
  - Add `aria-hidden="true"` to emoji icons, decorative SVGs
  - Add `aria-label` to informative icons (badge icons, difficulty indicators)
  - **Files**: `src/components/badges/BadgeItem.vue`, `src/components/cards/CardItem.vue`, `src/components/layout/Dashboard.vue`

## Phase 6: Error Pages

8. [ ] Create custom 404 page
  - Create `src/pages/404.astro` with app branding, "Página no encontrada" message, emoji, and "Volver al inicio" button
  - Use BaseLayout and app theme
  - **Files**: `src/pages/404.astro`

9. [ ] Create custom 500 page
  - Create `src/pages/500.astro` with "Algo salió mal", "Reintentar" and "Volver al inicio" buttons
  - Use BaseLayout and app theme
  - **Files**: `src/pages/500.astro`
