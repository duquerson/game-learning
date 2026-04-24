<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../../lib/supabase'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../../lib/user-error'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import OAuthButtons from './OAuthButtons.vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!email.value || !password.value || !confirmPassword.value) {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
    return
  }
  if (password.value.length < 8) {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (error) {
      toast.error(GENERIC_USER_ERROR_MESSAGE)
      return
    }
    window.location.href = '/onboarding'
  } catch {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GlassCard>
    <form @submit.prevent="handleRegister" class="auth-form">
      <h2>Crear cuenta</h2>
      <p class="subtitle">Empieza tu viaje de aprendizaje</p>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="tu@email.com" autocomplete="email" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password" />
      </div>

      <div class="field">
        <label for="confirm-password">Confirmar contraseña</label>
        <input id="confirm-password" v-model="confirmPassword" type="password" placeholder="Repite tu contraseña" autocomplete="new-password" />
      </div>

      <GlassButton type="submit" :disabled="loading">
        {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
      </GlassButton>

      <OAuthButtons />

      <p class="switch">¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a></p>
    </form>
  </GlassCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.switch {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.switch a {
  color: var(--color-primary);
  text-decoration: none;
}
</style>
}
.oauth-btn:hover { background: rgba(255,255,255,0.15); }
.switch { text-align: center; font-size: 0.875rem; color: var(--color-text-secondary); }
.switch a { color: var(--color-primary); text-decoration: none; }
</style>
