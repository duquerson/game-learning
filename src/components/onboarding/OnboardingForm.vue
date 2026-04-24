<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../../lib/user-error'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'

const props = defineProps<{ topics: string[] }>()

const selected = ref<string[]>([])
const loading = ref(false)

function toggleTopic(topic: string) {
  const idx = selected.value.indexOf(topic)
  if (idx === -1) selected.value.push(topic)
  else selected.value.splice(idx, 1)
}

const topicIcons: Record<string, string> = {
  JavaScript: '⚡',
  TypeScript: '🔷',
}

function getIcon(topic: string) {
  return topicIcons[topic] ?? '📖'
}

async function handleSubmit() {
  if (selected.value.length === 0) {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
    return
  }

  loading.value = true
  try {
    const { data, error } = await actions.onboarding.savePreferences({ topics: selected.value })
    if (error || !data || !data.success) {
      toast.error(GENERIC_USER_ERROR_MESSAGE)
      return
    }
    window.location.href = '/dashboard'
  } catch {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GlassCard>
    <div class="onboarding">
      <h2>¡Bienvenido! 👋</h2>
      <p class="subtitle">Elige los temas que quieres aprender</p>

      <div class="topics">
        <button
          v-for="topic in topics"
          :key="topic"
          type="button"
          class="topic-btn"
          :class="{ active: selected.includes(topic) }"
          @click="toggleTopic(topic)"
        >
          <span class="icon">{{ getIcon(topic) }}</span>
          <span class="label">{{ topic }}</span>
          <span v-if="selected.includes(topic)" class="check">✓</span>
        </button>
      </div>

      <p v-if="topics.length === 0" class="empty">
        No hay temas disponibles aún. Contacta al administrador.
      </p>

      <GlassButton @click="handleSubmit" :disabled="loading || selected.length === 0">
        {{ loading ? 'Guardando...' : 'Empezar a aprender' }}
      </GlassButton>
    </div>
  </GlassCard>
</template>

<style scoped>
.onboarding { display: flex; flex-direction: column; gap: 1.5rem; text-align: center; min-width: 300px; }
h2 { margin: 0; font-size: 1.5rem; color: var(--color-text-primary); }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: 0.875rem; }
.topics { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.topic-btn {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 1.5rem 2rem; border: 2px solid var(--glass-border);
  border-radius: var(--radius-card); background: rgba(255,255,255,0.1);
  cursor: pointer; transition: all 0.2s; min-width: 120px;
}
.topic-btn:hover { border-color: var(--color-primary); }
.topic-btn.active { border-color: var(--color-primary); background: rgba(124,58,237,0.15); }
.icon { font-size: 2rem; }
.label { font-weight: 600; color: var(--color-text-primary); font-size: 0.875rem; }
.check {
  position: absolute; top: 0.5rem; right: 0.5rem;
  color: var(--color-success); font-size: 0.875rem; font-weight: 700;
}
.empty { color: var(--color-text-secondary); font-size: 0.875rem; }
</style>
