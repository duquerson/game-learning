# Specification Delta: Polish & Backend Enhancements

## ADDED Requirements

### Requirement: Badge Category Field
WHEN a badge is created in the database,
it SHALL have a `category` field with one of three values: `achievement`, `streak`, or `mastery`.

#### Scenario: Badge has category
GIVEN the badges table has a `category` column
WHEN a badge is stored
THEN it has a category value ('achievement', 'streak', or 'mastery')

#### Scenario: BadgeGrid displays category
GIVEN a user views the badges page
WHEN badges are displayed
THEN each badge shows its category label ("logro", "racha", "maestría")

### Requirement: Theme Database Persistence
WHEN a user toggles the theme,
the system SHALL persist the preference to the database.
On session restore, the system SHALL load the theme from the database (with localStorage as fallback).

#### Scenario: Theme saved to DB
GIVEN a user switches from light to dark theme
WHEN the toggle is clicked
THEN the theme preference is saved to `user_preferences.theme`

#### Scenario: Theme restored from DB
GIVEN a user previously set dark theme
WHEN they log in on a new device
THEN the dark theme is applied (loaded from DB)

### Requirement: Retry Button on Recoverable Errors
WHEN a recoverable error occurs (connection loss, server error, timeout),
the system SHALL display a "Reintentar" button in the error toast.

#### Scenario: Retry on connection error
GIVEN a user's internet connection drops
WHEN they try to submit an answer
THEN a toast shows "Sin conexión. Verifica tu internet." with a "Reintentar" button

### Requirement: Rate Limit Error Handling
WHEN the server responds with HTTP 429 (rate limit),
the system SHALL display "Demasiadas solicitudes. Espera un momento." to the user.

#### Scenario: Rate limit message
GIVEN the user makes too many requests
WHEN the server returns 429
THEN the user sees "Demasiadas solicitudes. Espera un momento."

### Requirement: Timeout Error Handling
WHEN a request takes too long (HTTP 408 or network timeout),
the system SHALL display "La solicitud tardó demasiado. Intenta de nuevo." with a retry button.

#### Scenario: Timeout message
GIVEN a request exceeds the timeout
WHEN the error is detected
THEN the user sees "La solicitud tardó demasiado. Intenta de nuevo."

## MODIFIED Requirements

### Requirement: Points Values
MODIFIED FROM: Easy=10, Medium=20, Hard=30 points per correct answer.
MODIFIED TO: Easy=5, Medium=10, Hard=15 points per correct answer.

#### Scenario: Updated points awarded
GIVEN a user answers an easy card correctly
WHEN the points are calculated
THEN 5 points are awarded instead of 10

GIVEN a user answers a hard card correctly
WHEN the points are calculated
THEN 15 points are awarded instead of 30
