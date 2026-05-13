# User Story PWR-014: Recuperación de contraseña

- **Summary:** Flujo completo de recuperación: olvidé mi contraseña → email con link → nueva contraseña → login

## Use Case:
- **As a** usuario que olvidó su contraseña
- **I want to** solicitar un email con un link de recuperación, crear una nueva contraseña (8+ chars, mayúscula, minúscula, número) confirmándola, y luego iniciar sesión con la nueva contraseña
- **so that** pueda recuperar el acceso a mi cuenta sin perder mi progreso

## Acceptance Criteria:

### Scenario 1: Solicitar recuperación desde el login
- **Given** que estoy en la página de login
- **and Given** que olvidé mi contraseña
- **When** hago clic en "¿Olvidaste tu contraseña?", ingreso mi email, y envío
- **Then** veo un mensaje "Si el email existe, recibirás instrucciones para restablecer tu contraseña" (independientemente de si el email existe o no)

### Scenario 2: Recibir email con link de recuperación
- **Given** que solicité la recuperación de contraseña
- **and Given** mi email está registrado en el sistema
- **When** el sistema procesa la solicitud
- **Then** recibo un email con un link único y temporal para restablecer mi contraseña

### Scenario 3: Crear nueva contraseña desde el link
- **Given** que recibí el email de recuperación
- **and Given** hago clic en el link (que me lleva a `/reset-password`)
- **When** ingreso una nueva contraseña (8+ chars, al menos 1 mayúscula, 1 minúscula, 1 número) y la confirmo, y envío
- **Then** mi contraseña se actualiza, veo un mensaje de éxito, y soy redirigido a la página de login para iniciar sesión con la nueva contraseña

### Scenario 4: Validación de contraseña débil
- **Given** que estoy en la página de restablecimiento de contraseña
- **When** intento usar una contraseña que no cumple los requisitos (menos de 8 caracteres, sin mayúscula, sin minúscula o sin número)
- **Then** veo mensajes de error inline indicando qué requisitos faltan, y no se actualiza la contraseña

### Scenario 5: Contraseñas no coinciden
- **Given** que estoy en la página de restablecimiento de contraseña
- **When** los campos "Nueva contraseña" y "Confirmar contraseña" no coinciden
- **Then** veo un error inline "Las contraseñas no coinciden" y no se actualiza la contraseña

### Scenario 6: Link expirado o inválido
- **Given** que hago clic en un link de recuperación expirado o inválido
- **When** intento restablecer mi contraseña
- **Then** veo un mensaje de error "El enlace ha expirado o no es válido. Solicita uno nuevo." con un botón "Volver al inicio de sesión"

## Validaciones adicionales
- El mensaje de éxito después de enviar el email es genérico ("Si el email existe...") para no revelar qué emails están registrados (security by obscurity)
- El link de recuperación es temporal (por defecto Supabase: 1 hora)
- Validación de contraseña: 8+ chars, al menos 1 mayúscula, 1 minúscula, 1 número
- Campo de confirmación de contraseña requerido
- La sesión existente no se invalida hasta que se cambia la contraseña
- La página `/reset-password` es una ruta pública (no requiere sesión activa)
- Después de cambiar la contraseña, redirigir a `/login`

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario recupere el acceso a su cuenta con mínima fricción y sin sentir que perdió su progreso.

### Behavioral Barriers Removed
- **Loss aversion**: El usuario teme perder su progreso (puntos, racha, insignias). La recuperación asegura que nada se pierde
- **Uncertainty aversion**: Mensaje genérico reduce el riesgo de que un atacante descubra qué emails están registrados
- **Friction**: Link en el email evita tener que recordar o escribir códigos

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Loss aversion** | "No perderás tu progreso" implícito al poder recuperar acceso |
| **Reducir fricción** | 1 clic en el link del email, no hay que copiar códigos |
| **Feedback inmediato** | Validación inline de contraseña en tiempo real |
| **Defaults** | Campo de confirmación evita errores de tipeo |
| **Seguridad por oscuridad** | Mensaje genérico si el email existe o no |

### Friction Score: 2/10 (esperar el email es la mayor fricción)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Authentication` (extensión del contexto existente — mismo aggregate root `User`)

### Value Objects (adicionales)
- `ResetToken` — Value object que representa el token temporal de recuperación (generado por Supabase, no por la app)
- `ResetLink` — Value object que construye la URL de recovery: `{origin}/reset-password#access_token={token}`
- `NewPassword` — Value object con validación: 8+ chars, 1 mayúscula, 1 minúscula, 1 número

### Domain Events
- `PasswordRecoveryRequested` — Ocurre cuando un usuario solicita recuperación. Datos: email, timestamp
- `PasswordUpdated` — Ocurre cuando la contraseña se actualiza exitosamente. Datos: userId, timestamp

### Server Actions
- `auth.resetPassword(email)` — Llama a `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- `auth.updatePassword({ password })` — Llama a `supabase.auth.updateUser({ password })`

### Security Considerations
- El mensaje de éxito es genérico independientemente de si el email existe (previene enumeración de usuarios)
- El token de recovery es manejado completamente por Supabase (no se almacena en la base de datos de la app)
- La página `/reset-password` extrae el token del hash de la URL (`window.location.hash`)
- CSP bloquea scripts inline no autorizados en la página de recovery
- El link expira después del tiempo configurado en Supabase Auth (default: 1 hora)
