<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../../lib/supabase'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../../lib/user-error'

defineProps<{
  label?: string
}>()

const loading = ref(false)

async function handleOAuth(provider: 'google' | 'github') {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  } catch {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <slot name="divider">
      <div class="divider"><span>O continúa con</span></div>
    </slot>

    <div class="oauth-buttons">
      <button type="button" class="oauth-btn" @click="handleOAuth('google')" :disabled="loading">
        <span>G</span> Google
      </button>
      <button type="button" class="oauth-btn" @click="handleOAuth('github')" :disabled="loading">
        <span>⌥</span> GitHub
      </button>
    </div>
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border);
}

.oauth-buttons {
  display: flex;
  gap: 0.75rem;
}

.oauth-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.oauth-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.oauth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
