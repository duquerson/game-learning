<script setup lang="ts">
import { ref } from 'vue'
import { actions, isInputError } from 'astro:actions'
import { toast } from 'vue-sonner'
import GlassCard from '../ui/GlassCard.vue'
import OAuthButtons from './OAuthButtons.vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

async function handleRegister() {
  emailError.value = ''
  passwordError.value = ''
  confirmError.value = ''
  if (!email.value || !password.value || !confirmPassword.value) {
    toast.error('Completa todos los campos para continuar.')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Ingresa un email válido.'
    toast.error(emailError.value)
    return
  }
  if (password.value.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres.'
    toast.error(passwordError.value)
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmError.value = 'Las contraseñas no coinciden.'
    toast.error(confirmError.value)
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
        if (error.fields.email) emailError.value = error.fields.email[0]
        if (error.fields.password) passwordError.value = error.fields.password[0]
        const firstMessage = Object.values(error.fields).flat()[0]
        toast.error(firstMessage ?? 'Datos inválidos. Revisa los campos.')
      } else {
        toast.error('No se pudo crear la cuenta. El email puede estar en uso.')
      }
      return
    }
    if (data?.success && data.redirect) {
      toast.success('Cuenta creada. Configurando tu perfil…')
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
  <div class="w-full sm:max-w-sm mx-auto">
    <GlassCard>
      <form @submit.prevent="handleRegister" class="flex flex-col gap-5" novalidate>

        <div class="flex flex-col gap-1">
          <h1 class="m-0 text-h1 text-(--color-text-primary)">Crear cuenta</h1>
          <p
            class="m-0 text-sm text-(--color-text-secondary)"
            :class="loading ? 'skeleton-pulse rounded' : ''"
          >
            Empieza tu viaje de aprendizaje
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="reg-email" class="text-sm font-medium text-(--color-text-secondary)">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :disabled="loading"
            class="w-full border-(--color-border) rounded-lg p-3 text-sm bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted) transition-[border-color] duration-150 focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="emailError" class="text-xs text-(--color-destructive) m-0">{{ emailError }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="reg-password" class="text-sm font-medium text-(--color-text-secondary)">Contraseña</label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :disabled="loading"
            class="w-full border-(--color-border) rounded-lg p-3 text-sm bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted) transition-[border-color] duration-150 focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="passwordError" class="text-xs text-(--color-destructive) m-0">{{ passwordError }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="reg-confirm" class="text-sm font-medium text-(--color-text-secondary)">Confirmar contraseña</label>
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :disabled="loading"
            class="w-full border-(--color-border) rounded-lg p-3 text-sm bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted) transition-[border-color] duration-150 focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="confirmError" class="text-xs text-(--color-destructive) m-0">{{ confirmError }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="touch-target btn-tactile inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-sm bg-(--color-primary) text-white border-none hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-30" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
          {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>

        <OAuthButtons />

        <p class="text-center text-sm text-(--color-text-secondary) m-0">
          ¿Ya tienes cuenta?
          <a href="/login" class="text-(--color-primary) no-underline font-medium hover:opacity-80">Iniciar sesión</a>
        </p>

      </form>
    </GlassCard>
  </div>
</template>
