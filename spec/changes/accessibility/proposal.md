# Change Proposal: Accessibility Enhancements (WCAG 2.1 AAA)

## Why

The MicroLearn project has a comprehensive `accessibility.css` (392 lines) with focus indicators, SR-only classes, reduced motion, and high-contrast support. However, the actual HTML structure and Vue components lack the runtime accessibility hooks needed to meet WCAG 2.1 AAA. Specifically, there is no skip link, landmark roles are missing, ARIA labels are sparse, toast notifications lack live regions, and there are no custom error pages.

Closing these gaps ensures the platform is usable by people with disabilities and meets the accessibility requirements defined in the constitution and user story A11Y-015.

## What Changes

### Skip Link
- Add `<a class="skip-link" href="#main-content">Saltar al contenido principal</a>` as first focusable element in `BaseLayout.astro`
- Add `id="main-content"` to the `<main>` element
- CSS classes already exist in `accessibility.css`

### Landmark Roles
- Add `role="banner"` to header
- Add `role="navigation"` to sidebar and bottom nav
- Add `role="main"` to `<main>` element in layouts

### ARIA Labels
- Add `aria-label` to all nav links in Sidebar and BottomNav
- Add `aria-label` to theme toggle
- Add `aria-label` to modal close buttons
- Add `aria-label` to action buttons (Iniciar repaso, etc.)

### Toast Live Regions
- Configure ToasterWrapper with `role="status"` and `aria-live="polite"`
- Ensure all toast notifications announce to screen readers

### Error Messages with aria-describedby
- Replace toast-only form errors with inline errors tied to inputs via `aria-describedby`
- Apply to LoginForm, RegisterForm, OnboardingForm, ResetPasswordForm

### aria-hidden on Decorative Icons
- Audit all icon-only elements
- Add `aria-hidden="true"` to decorative icons
- Add `aria-label` to informative icons

### Custom 404 Page
- Create `src/pages/404.astro` with app branding, message, and "Volver al inicio" button

### Custom 500 Page
- Create `src/pages/500.astro` with "Algo salió mal", "Reintentar" and "Volver al inicio" buttons

## Impact

### Specifications Affected
- `src/docs/user-story-accessibility-015.md`
- `src/styles/accessibility.css`
- Constitution accessibility principles

### Code Changes
- **Modified layouts**: BaseLayout.astro (skip link, landmarks, main ID)
- **Modified components**: Sidebar, BottomNav, ThemeToggle, CardLibrary (modals), ToasterWrapper, all form components
- **New pages**: 404.astro, 500.astro
- **Existing CSS**: Already comprehensive — no new CSS required

### User Impact
- Screen reader users can navigate efficiently with skip link and landmarks
- Keyboard users get consistent focus indicators
- Error messages are tied to inputs for assistive technology
- Broken URLs show branded error pages instead of browser defaults

### Risk Assessment
- Low: all changes are additive, no visual regressions expected
- Low: skip link only visible on keyboard focus
- Low: ARIA labels have no visual impact
