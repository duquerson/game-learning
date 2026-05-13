# Specification Delta: Accessibility Enhancements (WCAG 2.1 AAA)

## ADDED Requirements

### Requirement: Skip Link
WHEN a keyboard user loads any page,
the system SHALL provide a "Saltar al contenido principal" link as the first focusable element.
The link SHALL become visible on keyboard focus and move focus to `#main-content`.

#### Scenario: Skip link visible on focus
GIVEN a keyboard user loads a page
WHEN they press Tab
THEN a "Saltar al contenido principal" link becomes visible
AND activating it moves focus to the main content area

### Requirement: Landmark Roles
WHEN a screen reader user navigates the app,
all layout sections SHALL have appropriate ARIA landmark roles:
- `<header>` SHALL have `role="banner"`
- `<nav>` elements SHALL have `role="navigation"`
- `<main>` SHALL have `role="main"`

#### Scenario: Landmarks present
GIVEN a screen reader user explores the page structure
WHEN they use the landmarks rotor
THEN they find "banner" for the header, "navigation" for nav elements, and "main" for content

### Requirement: ARIA Labels on Navigation
WHEN a screen reader user focuses a navigation link,
the link SHALL have an `aria-label` describing its destination.

#### Scenario: Nav links labeled
GIVEN a screen reader user focuses the dashboard link
WHEN the link is announced
THEN it says "Ir al Dashboard" instead of just a generic link

### Requirement: ARIA Labels on Interactive Elements
WHEN a screen reader user focuses an interactive control (theme toggle, modal close, action button),
the element SHALL have an `aria-label` describing its function.

#### Scenario: Theme toggle labeled
GIVEN a screen reader user focuses the theme toggle
WHEN the button is announced
THEN it says "Alternar tema claro/oscuro"

### Requirement: Toast Live Regions
WHEN a toast notification appears,
the toast container SHALL have `role="status"` and `aria-live="polite"`
so that screen readers announce the notification without interrupting the current task.

#### Scenario: Toast announced by screen reader
GIVEN a screen reader user is browsing
WHEN a success toast appears
THEN the toast text is announced without interrupting the user's current action

### Requirement: Inline Error Messages with aria-describedby
WHEN a form validation error occurs,
the error message SHALL be displayed inline near the relevant input
AND the input SHALL have `aria-describedby` pointing to the error element.

#### Scenario: Error tied to input
GIVEN a user submits a form with an invalid email
WHEN the validation error appears
THEN the email input has `aria-describedby` referencing the error message element
AND a screen reader announces the error when focusing the input

### Requirement: Decorative Icons Hidden
WHEN an icon is purely decorative (emoji, decorative SVG),
it SHALL have `aria-hidden="true"`.

#### Scenario: Emoji decorative
GIVEN a screen reader user encounters a list with emoji icons
WHEN the emoji is present
THEN it has `aria-hidden="true"` and is not announced

### Requirement: Custom 404 Page
WHEN a user navigates to a non-existent URL,
the system SHALL display a styled error page with:
- App branding (logo + name)
- "Página no encontrada" message
- An emoji illustration
- A "Volver al inicio" button linking to `/dashboard`

#### Scenario: 404 page shown
GIVEN a user visits `/pagina-que-no-existe`
WHEN the server returns 404
THEN the user sees the branded 404 page with a "Volver al inicio" button

### Requirement: Custom 500 Page
WHEN a server error occurs,
the system SHALL display a styled error page with:
- App branding (logo + name)
- "Algo salió mal" message
- A "Reintentar" button
- A "Volver al inicio" button

#### Scenario: 500 page shown
GIVEN a server error occurs
WHEN the error page loads
THEN the user sees the branded 500 page with "Reintentar" and "Volver al inicio" buttons
