# Specification Delta: UX Core Enhancements

## ADDED Requirements

### Requirement: Onboarding Difficulty Selection
WHEN a user completes onboarding step 2,
the system SHALL persist the selected difficulty (easy, medium, or hard) in `user_preferences`.
The default difficulty SHALL be `medium`.

#### Scenario: User selects difficulty in step 2
GIVEN the user is on onboarding step 2
WHEN the user selects "hard" and clicks "Comenzar"
THEN the system saves difficulty="hard" in `user_preferences`
AND redirects to the dashboard

### Requirement: Onboarding Step Progress
WHEN a user is in the onboarding flow,
the system SHALL display a step indicator showing "Paso 1 de 2" or "Paso 2 de 2".

#### Scenario: Step indicator visible
GIVEN the user is on onboarding step 1
WHEN the page loads
THEN a visual indicator shows "Paso 1 de 2"

### Requirement: Library Text Search
WHEN a user types in the library search field,
the system SHALL filter visible cards by matching title or content text.
The search SHALL be case-insensitive and debounced (300ms).

#### Scenario: User searches for cards
GIVEN the library shows 30 cards
WHEN the user types "promise" in the search field
THEN only cards with "promise" in title or content are shown

### Requirement: Library Sort Controls
WHEN a user selects a sort option in the library,
the system SHALL reorder the cards by the selected criterion (difficulty asc/desc, topic alphabetical).

#### Scenario: User sorts by difficulty
GIVEN the library shows filtered cards
WHEN the user selects "Dificultad (mayor a menor)"
THEN cards are reordered from hard to easy

### Requirement: Library Topic Grouping
WHEN the library displays cards,
the system SHALL group them by topic and subtopic with section headers.

#### Scenario: Cards grouped by topic
GIVEN the user is in the library
WHEN cards are displayed
THEN they are grouped under headers like "JavaScript > Arrays (5 tarjetas)" and "TypeScript > Generics (3 tarjetas)"

### Requirement: Quiz Timer (30 seconds)
WHEN a quiz question is displayed,
the system SHALL start a 30-second countdown timer.
IF the timer expires,
the system SHALL auto-submit the answer as incorrect.

#### Scenario: Timer counts down
GIVEN a quiz question is shown
WHEN 30 seconds pass without an answer
THEN the answer is marked as incorrect AND the correct answer is revealed

### Requirement: Quiz Session Limit (10 cards)
WHEN a quiz session starts,
the system SHALL randomly select exactly 10 cards from the user's available cards.

#### Scenario: Session starts with 10 cards
GIVEN the user has 25 available cards
WHEN they start a quiz session
THEN exactly 10 cards are selected randomly

### Requirement: Quiz Explanation Display
WHEN a user answers a quiz question,
the system SHALL display the card's content text as an explanation after showing correct/incorrect feedback.

#### Scenario: Explanation shown after answer
GIVEN the user just answered a quiz question
WHEN the correct/incorrect feedback is shown
THEN the card content is displayed below as explanation

### Requirement: Dashboard Progress Bar
WHEN a user views the dashboard,
the system SHALL display a progress bar showing `reviewedCards / totalCards` with a percentage.

#### Scenario: Progress bar visible
GIVEN the user has reviewed 5 of 20 available cards
WHEN they view the dashboard
THEN a progress bar shows 25% with "5/20 tarjetas"

### Requirement: Dashboard Personalized Greeting
WHEN the dashboard loads,
the system SHALL display a personalized greeting using the user's email name.

#### Scenario: Greeting shown
GIVEN the user's email is "juan@example.com"
WHEN the dashboard loads in the morning
THEN the greeting "Buenos días, Juan 👋" is displayed

### Requirement: Dashboard All Badges
WHEN the dashboard loads,
the system SHALL display ALL unlocked badges (not limited to recent).

#### Scenario: All badges on dashboard
GIVEN the user has 6 unlocked badges
WHEN the dashboard loads
THEN all 6 badges are displayed

### Requirement: Profile Avatar with Initials
WHEN a user views their profile,
the system SHALL display an avatar circle with the first letter of their email in uppercase.

#### Scenario: Avatar shown
GIVEN the user's email is "maria@example.com"
WHEN they view their profile
THEN an avatar circle shows "M" with theme-appropriate colors

### Requirement: Profile Badges Section
WHEN a user views their profile,
the system SHALL display all their unlocked badges.

#### Scenario: Badges in profile
GIVEN the user has 4 unlocked badges
WHEN they view their profile
THEN all 4 badges are displayed in a grid

### Requirement: Sidebar Collapse/Expand
WHEN a user clicks the sidebar collapse toggle,
the system SHALL toggle between expanded (icons + labels) and collapsed (icons only) states.
The state SHALL be persisted in localStorage.

#### Scenario: Sidebar collapses
GIVEN the sidebar is expanded
WHEN the user clicks the collapse chevron
THEN the sidebar collapses to show only icons
AND the state is saved to localStorage

### Requirement: Global Header with Stats
WHEN a user is on any app page,
the system SHALL display a header bar with the MicroLearn logo, total points, current streak, and theme toggle.

#### Scenario: Header visible
GIVEN the user is on the library page
WHEN the page loads
THEN the header shows the logo, "1250 pts", "🔥 5 días", and the theme toggle

### Requirement: Adaptive Bottom Nav
WHEN the bottom navigation is displayed on mobile,
the active item SHALL show both icon and text label,
inactive items SHALL show only the icon.

#### Scenario: Bottom nav active item
GIVEN the user is on the dashboard page
WHEN the bottom nav is displayed
THEN the Dashboard item shows 🏠 + "Dashboard"
AND all other items show only their icons

## MODIFIED Requirements

### Requirement: Session Card Limit
MODIFIED FROM: Session loads all cards matching user topics.
MODIFIED TO: Session loads exactly 10 randomly selected cards from the user's available cards.
This applies to both quiz mode and self-assessment mode.

#### Scenario: Both modes limited to 10
GIVEN the user has 30 available cards
WHEN they start a quiz or self-assessment session
THEN exactly 10 cards are randomly selected

### Requirement: ReviewCard Timer
MODIFIED FROM: No timer in quiz or self-assessment mode.
MODIFIED TO: Both modes have a 30-second countdown timer that auto-submits as incorrect on expiry.

#### Scenario: Timer applies to both modes
GIVEN the user starts a quiz session
WHEN each question is shown
THEN a 30-second timer starts

GIVEN the user starts a self-assessment session
WHEN each card concept is shown
THEN a 30-second timer starts
AND auto-flips the card on expiry
