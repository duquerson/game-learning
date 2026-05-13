<script setup lang="ts">
import { ref } from 'vue'
import { actions, isInputError } from 'astro:actions'
import { toast } from 'vue-sonner'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import OAuthButtons from './OAuthButtons.vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!email.value || !password.value || !confirmPassword.value) {
    toast.error('Completa todos los campos para continuar.')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    toast.error('Ingresa un email válido.')
    return
  }
  if (password.value.length < 8) {
    toast.error('La contraseña debe tener al menos 8 caracteres.')
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.error('Las contraseñas no coinciden.')
    return
  }
  loading.value = true
  try {
    const { data, error } = await actions.auth.register({
      email: email.value,
      password: password.value,
    })
    if (error) {
      if (isInputError(error)) {
        const firstMessage = Object.values(error.fields).flat()[0]
        toast.error(firstMessage ?? 'Datos inválidos. Revisa los campos.')
      } else {
        toast.error('No se pudo crear la cuenta. El email puede estar en uso.')
      }
      return
    }
    if (data?.success && data.redirect) {
      toast.success('¡Cuenta creada! Configurando tu perfil…')
      setTimeout(() => {
        window.location.href = data.redirect!
      }, 800)
    }
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
      <form @submit.prevent="handleRegister" class="auth-form" novalidate>

        <div class="form-header">
          <h1 class="form-title">Crear cuenta</h1>
          <p class="form-subtitle">Empieza tu viaje de aprendizaje</p>
        </div>

        <div class="field">
          <label for="reg-email" class="field-label">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :disabled="loading"
            class="field-input"
          />
        </div>

        <div class="field">
          <label for="reg-password" class="field-label">Contraseña</label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :disabled="loading"
            class="field-input"
          />
        </div>

        <div class="field">
          <label for="reg-confirm" class="field-label">Confirmar contraseña</label>
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :disabled="loading"
            class="field-input"
          />
        </div>

        <GlassButton type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading" class="spinner" aria-hidden="true" />
          {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </GlassButton>

        <OAuthButtons />

        <p class="switch-link">
          ¿Ya tienes cuenta?
          <a href="/login">Iniciar sesión</a>
        </p>

      </form>
    </GlassCard>
  </div>
</template>

<style scoped>
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
}

.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

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
