<script setup lang="ts">
import { ref } from 'vue'
import { actions, isInputError } from 'astro:actions'
import { toast } from 'vue-sonner'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import OAuthButtons from './OAuthButtons.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const showResetForm = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)

async function handleResetPassword() {
  if (!resetEmail.value) {
    toast.error('Ingresa tu email para recuperar la contraseña.')
    return
  }
  resetLoading.value = true
  try {
    const { error } = await actions.auth.resetPassword({
      email: resetEmail.value,
    })
    if (error) {
      toast.error('No se pudo enviar el email. Inténtalo de nuevo.')
      return
    }
    toast.success('Revisa tu email para restablecer tu contraseña.')
    showResetForm.value = false
  } catch {
    toast.error('Error de conexión. Inténtalo de nuevo.')
  } finally {
    resetLoading.value = false
  }
}

async function handleLogin() {
  if (!email.value || !password.value) {
    toast.error('Completa todos los campos para continuar.')
    return
  }
  loading.value = true
  try {
    const { data, error } = await actions.auth.login({
      email: email.value,
      password: password.value,
    })
    if (error) {
      if (isInputError(error)) {
        const firstMessage = Object.values(error.fields).flat()[0]
        toast.error(firstMessage ?? 'Datos inválidos. Revisa los campos.')
      } else {
        toast.error('Email o contraseña incorrectos. Inténtalo de nuevo.')
      }
      return
    }
    toast.success('¡Bienvenido de vuelta! Redirigiendo…')
    setTimeout(() => {
      window.location.href = data?.redirect ?? '/dashboard'
    }, 800)
  } catch {
    toast.error('No se pudo conectar. Verifica tu conexión e inténtalo de nuevo.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-shell">
    <GlassCard>
      <form @submit.prevent="handleLogin" class="auth-form" novalidate>

        <div class="form-header">
          <h1 class="form-title">Iniciar sesión</h1>
          <p class="form-subtitle">Bienvenido de vuelta</p>
        </div>

        <div class="field">
          <label for="login-email" class="field-label">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :disabled="loading"
            class="field-input"
          />
        </div>

        <div class="field">
          <label for="login-password" class="field-label">Contraseña</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Tu contraseña"
            autocomplete="current-password"
            :disabled="loading"
            class="field-input"
          />
          <button type="button" class="forgot-link" @click="showResetForm = true">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <GlassButton type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading" class="spinner" aria-hidden="true" />
          {{ loading ? 'Iniciando sesión…' : 'Iniciar sesión' }}
        </GlassButton>

        <OAuthButtons />

        <p class="switch-link">
          ¿No tienes cuenta?
          <a href="/register">Regístrate</a>
        </p>

      </form>

      <form v-if="showResetForm" @submit.prevent="handleResetPassword" class="reset-form">
        <h2 class="reset-title">Recuperar contraseña</h2>
        <p class="reset-desc">Te enviaremos un email con instrucciones para restablecer tu contraseña.</p>
        <div class="field">
          <label for="reset-email" class="field-label">Email</label>
          <input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :disabled="resetLoading"
            class="field-input"
          />
        </div>
        <div class="reset-actions">
          <GlassButton type="submit" :disabled="resetLoading" class="submit-btn">
            <span v-if="resetLoading" class="spinner" aria-hidden="true" />
            {{ resetLoading ? 'Enviando…' : 'Enviar instrucciones' }}
          </GlassButton>
          <button type="button" class="cancel-link" @click="showResetForm = false">
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    </GlassCard>
  </div>
</template>

<style scoped>
/* Ancho fijo consistente en todos los breakpoints — mobile-first */
.form-shell {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Header */
.form-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.form-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.form-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  background: var(--glass-bg);
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  font-family: inherit;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.field-input::placeholder {
  color: var(--color-text-muted);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--glass-bg);
}

.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Submit button — full width */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Spinner de carga */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Forgot password link */
.forgot-link {
  background: none;
  border: none;
  padding: 0.25rem 0 0 0;
  font-size: 0.8125rem;
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: opacity 0.15s ease;
}
.forgot-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Reset password form */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}
.reset-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
.reset-desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.reset-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.cancel-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s ease;
}
.cancel-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Switch link */
.switch-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.switch-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s ease;
}

.switch-link a:hover {
  opacity: 0.8;
}
</style>
