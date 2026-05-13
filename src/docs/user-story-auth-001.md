# User Story AUTH-001: Authentication (Login/Register)

- **Summary:** Acceso sin fricción para nuevos y returning users via email u OAuth

## Use Case:
- **As a** visitante nuevo o usuario recurrente de MicroLearn
- **I want to** registrarme o iniciar sesión con email+password u OAuth (Google/GitHub), con opción de recuperar mi contraseña
- **so that** pueda acceder al contenido de estudio sin barreras ni demoras

## Acceptance Criteria:

### Scenario 1: Registro exitoso con email y password segura
- **Given** que estoy en la página de registro
- **and Given** que no tengo una cuenta en MicroLearn
- **When** ingreso un email válido y una contraseña de 8+ caracteres con al menos una mayúscula y un número, y envío el formulario
- **Then** se crea mi cuenta y soy redirigido al onboarding para seleccionar temas

### Scenario 2: Login exitoso con email y password
- **Given** que estoy en la página de login
- **and Given** que ya tengo una cuenta registrada
- **When** ingreso mi email y contraseña correctos
- **Then** inicio sesión y soy redirigido al dashboard (o al onboarding si es mi primera vez)

### Scenario 3: Login con OAuth (Google o GitHub)
- **Given** que estoy en la página de login
- **and Given** que tengo una cuenta de Google o GitHub
- **When** hago clic en "Continuar con Google/GitHub" y autorizo la app
- **Then** inicio sesión automáticamente sin necesidad de crear una contraseña

### Scenario 4: Recuperación de contraseña
- **Given** que estoy en la página de login
- **and Given** que olvidé mi contraseña
- **When** hago clic en "Olvidé mi contraseña", ingreso mi email y envío
- **Then** recibo un email con instrucciones para restablecer mi contraseña

### Scenario 5: Validación de registro rechaza datos inválidos
- **Given** que estoy en la página de registro
- **When** intento registrarme con un email inválido o una contraseña que no cumple los requisitos (menos de 8 caracteres, sin mayúscula o sin número)
- **Then** veo mensajes de error claros y no se crea la cuenta

## Validaciones adicionales
- Email: formato válido
- Password: mínimo 8 caracteres, al menos 1 mayúscula, al menos 1 número
- Sesión persistente al recargar la página
- Rutas protegidas redirigen a `/login` si no hay sesión activa

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario cree una cuenta o inicie sesión con mínima fricción para llegar al contenido de estudio.

### Behavioral Barriers Removed
- **Status quo effect**: OAuth (Google/GitHub) permite saltar el paso de crear y recordar una contraseña nueva, reduciendo la inercia de "no quiero otro login más"
- **Uncertainty aversion**: La recuperación de contraseña elimina el miedo a quedar bloqueado fuera de la cuenta
- **Present bias**: El registro requiere mínimo esfuerzo (email + password + 2 reglas) para que el beneficio futuro (aprender) no sea opacado por el costo presente

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Reducir fricción** | OAuth elimina taps y campos del formulario |
| **Defaults inteligentes** | Placeholders y autofocus guían al usuario |
| **Feedback inmediato** | Errores de validación en tiempo real, no al enviar |
| **Loss aversion** | "Recuperar contraseña" reduce el miedo a perder acceso |

### Friction Score
Registro email: 3/10 · OAuth: 1/10 · Recuperación: 4/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Authentication` — Gestiona identidad, registro, inicio de sesión y recuperación de credenciales.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Usuario | Persona con una cuenta registrada en el sistema |
| Sesión | Estado autenticado entre el usuario y el sistema |
| Credenciales | Email + password que identifican al usuario |
| OAuth | Método de autenticación delegada (Google/GitHub) |

### Aggregate Root
`User` — Entidad con identidad única (`userId`). Es el aggregate root del contexto Auth. Contiene email y referencia a autenticación externa.

### Value Objects
- `Email` — Value object inmutable con validación de formato
- `Password` — Value object inmutable que garantiza 8+ chars, 1 mayúscula, 1 número (nunca se almacena en texto plano)
- `UserId` — Value object UUID que identifica al usuario

### Domain Events
- `UserRegistered` — Ocurre cuando un usuario completa el registro exitosamente. Datos: userId, email, timestamp
- `UserLoggedIn` — Ocurre cuando un usuario inicia sesión. Datos: userId, method (email|oauth), timestamp
- `PasswordRecoveryRequested` — Ocurre cuando un usuario solicita recuperación. Datos: email, timestamp

### Repository (Port)
`UserRepository` — Interfaz en dominio, implementación en infraestructura (Supabase Auth).
- `findByEmail(email): User | null`
- `findById(userId): User | null`
- `save(user: User): void`

### Anti-Patterns Evitados
- ❌ Password en texto plano → Value object con validación + hash (Supabase Auth)
- ❌ Sesión en cliente → SSR con cookies httpOnly vía @supabase/ssr
