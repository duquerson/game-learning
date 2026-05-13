<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { actions, isInputError } from 'astro:actions'
import { toast } from 'vue-sonner'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const hash = ref('')

onMounted(() => {
  hash.value = window.location.hash.slice(1)
})

async function handleUpdatePassword() {
  if (password.value !== confirmPassword.value) {
    toast.error('Las contraseñas no coinciden.')
    return
  }
  if (password.value.length < 8) {
    toast.error('La contraseña debe tener al menos 8 caracteres.')
    return
  }
  loading.value = true
  try {
    const { data, error } = await actions.auth.updatePassword({
      password: password.value,
    })
    if (error) {
      if (isInputError(error)) {
        const firstMessage = Object.values(error.fields).flat()[0]
        toast.error(firstMessage ?? 'Error al actualizar la contraseña.')
      } else {
        toast.error('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
      }
      return
    }
    toast.success('Contraseña actualizada. Redirigiendo al inicio de sesión…')
    setTimeout(() => {
      window.location.href = data?.redirect ?? '/login'
    }, 1500)
  } catch {
    toast.error('Error de conexión. Inténtalo de nuevo.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-shell">
    <GlassCard>
      <form @submit.prevent="handleUpdatePassword" class="reset-form" novalidate>
        <div class="form-header">
          <h1 class="form-title">Restablecer contraseña</h1>
          <p class="form-subtitle">Ingresa tu nueva contraseña</p>
        </div>

        <div class="field">
          <label for="new-password" class="field-label">Nueva contraseña</label>
          <input
            id="new-password"
            v-model="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :disabled="loading"
            class="field-input"
          />
        </div>

        <div class="field">
          <label for="confirm-password" class="field-label">Confirmar contraseña</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            autocomplete="new-password"
            :disabled="loading"
            class="field-input"
          />
        </div>

        <GlassButton type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading" class="spinner" aria-hidden="true" />
          {{ loading ? 'Actualizando…' : 'Actualizar contraseña' }}
        </GlassButton>
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
.reset-form {
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
.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--glass-bg);
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
</style>
