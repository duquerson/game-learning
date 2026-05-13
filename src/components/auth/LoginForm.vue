<script setup lang="ts">
import { ref } from 'vue'
import { actions, isInputError } from 'astro:actions'
import { toast } from 'vue-sonner'
import GlassCard from '../ui/GlassCard.vue'
import OAuthButtons from './OAuthButtons.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const showResetForm = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetEmailError = ref('')

async function handleResetPassword() {
  resetEmailError.value = ''
  if (!resetEmail.value) {
    resetEmailError.value = 'Ingresa tu email para recuperar la contraseña.'
    return
  }
  resetLoading.value = true
  try {
    const { error } = await actions.auth.resetPassword({
      email: resetEmail.value,
    })
    if (error) {
      resetEmailError.value = 'No se pudo enviar el email. Inténtalo de nuevo.'
      return
    }
    toast.success('Revisa tu email para restablecer tu contraseña.')
    showResetForm.value = false
    resetEmail.value = ''
  } catch {
    toast.error('Error de conexión. Inténtalo de nuevo.')
  } finally {
    resetLoading.value = false
  }
}

async function handleLogin() {
  emailError.value = ''
  passwordError.value = ''
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
        if (error.fields.email) emailError.value = error.fields.email[0]
        if (error.fields.password) passwordError.value = error.fields.password[0]
        const firstMessage = Object.values(error.fields).flat()[0]
        toast.error(firstMessage ?? 'Datos inválidos. Revisa los campos.')
      } else {
        toast.error('Email o contraseña incorrectos. Inténtalo de nuevo.')
      }
      return
    }
    toast.success('Bienvenido de vuelta. Redirigiendo…')
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
  <div class="w-full sm:max-w-sm mx-auto">
    <GlassCard>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-5" novalidate>

        <div class="flex flex-col gap-1">
          <h1 class="m-0 text-h1 text-(--color-text-primary)">Iniciar sesión</h1>
          <p
            class="m-0 text-sm text-(--color-text-secondary)"
            :class="loading ? 'skeleton-pulse rounded' : ''"
          >
            Bienvenido de vuelta
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium text-(--color-text-secondary)">Email</label>
          <input
            id="email"
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
          <label for="password" class="text-sm font-medium text-(--color-text-secondary)">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Tu contraseña"
            autocomplete="current-password"
            :disabled="loading"
            class="w-full border-(--color-border) rounded-lg p-3 text-sm bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted) transition-[border-color] duration-150 focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="passwordError" class="text-xs text-(--color-destructive) m-0">{{ passwordError }}</p>
          <button
            type="button"
            class="touch-target self-start bg-none border-none p-0 pt-1 text-xs text-(--color-primary) cursor-pointer font-inherit hover:opacity-80 hover:underline"
            @click="showResetForm = true"
          >
            ¿Olvidaste tu contraseña?
          </button>
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
          {{ loading ? 'Iniciando sesión…' : 'Iniciar sesión' }}
        </button>

        <OAuthButtons />

        <p class="text-center text-sm text-(--color-text-secondary) m-0">
          ¿No tienes cuenta?
          <a href="/register" class="text-(--color-primary) no-underline font-medium hover:opacity-80">Regístrate</a>
        </p>

      </form>

      <form
        v-if="showResetForm"
        @submit.prevent="handleResetPassword"
        class="flex flex-col gap-4 pt-4 mt-4 border-t border-(--glass-border) animate-fade-in"
        novalidate
      >
        <h2 class="m-0 text-h2 text-(--color-text-primary)">Recuperar contraseña</h2>
        <p class="m-0 text-sm text-(--color-text-secondary) leading-relaxed">
          Te enviaremos un email con instrucciones para restablecer tu contraseña.
        </p>
        <div class="flex flex-col gap-1.5">
          <label for="reset-email" class="text-sm font-medium text-(--color-text-secondary)">Email</label>
          <input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :disabled="resetLoading"
            class="w-full border-(--color-border) rounded-lg p-3 text-sm bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted) transition-[border-color] duration-150 focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="resetEmailError" class="text-xs text-(--color-destructive) m-0">{{ resetEmailError }}</p>
        </div>
        <div class="flex flex-col gap-3">
          <button
            type="submit"
            :disabled="resetLoading"
            class="touch-target btn-tactile inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-sm bg-(--color-primary) text-white border-none hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg v-if="resetLoading" class="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-30" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
            </svg>
            {{ resetLoading ? 'Enviando…' : 'Enviar instrucciones' }}
          </button>
          <button
            type="button"
            class="touch-target bg-none border-none p-0 text-sm text-(--color-text-secondary) cursor-pointer font-inherit hover:opacity-80 hover:underline"
            @click="showResetForm = false"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    </GlassCard>
  </div>
</template>
