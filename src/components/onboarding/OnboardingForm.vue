<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../../lib/user-error'
import { getTopicIcon } from '../../utils/topics'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'

const props = withDefaults(defineProps<{ topics: string[] }>(), {
  topics: () => [],
})

const step = ref(1)
const selected = ref<string[]>([])
const difficulty = ref('medium')
const loading = ref(false)

function toggleTopic(topic: string) {
  const idx = selected.value.indexOf(topic)
  if (idx === -1) selected.value.push(topic)
  else selected.value.splice(idx, 1)
}

function goToStep2() {
  if (selected.value.length === 0) {
    toast.error('Selecciona al menos un tema para continuar.')
    return
  }
  step.value = 2
}

function goToStep1() {
  step.value = 1
}

async function handleSubmit() {
  loading.value = true
  try {
    const { data, error } = await actions.onboarding.savePreferences({
      topics: selected.value,
      difficulty: difficulty.value,
    })
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

      <!-- Step indicator -->
      <div class="step-indicator">
        <div class="step-dot" :class="{ active: step >= 1 }">1</div>
        <div class="step-line" :class="{ active: step >= 2 }"></div>
        <div class="step-dot" :class="{ active: step >= 2 }">2</div>
      </div>
      <p class="step-label">{{ step === 1 ? 'Paso 1 de 2: Elige tus temas' : 'Paso 2 de 2: Elige tu dificultad' }}</p>

      <!-- Step 1: Topic selection -->
      <template v-if="step === 1">
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
            <span class="icon">{{ getTopicIcon(topic) }}</span>
            <span class="label">{{ topic }}</span>
            <span v-if="selected.includes(topic)" class="check">✓</span>
          </button>
        </div>

        <p v-if="topics.length === 0" class="empty">
          No hay temas disponibles aún. Contacta al administrador.
        </p>

        <GlassButton @click="goToStep2" :disabled="selected.length === 0">
          Continuar →
        </GlassButton>
      </template>

      <!-- Step 2: Difficulty selection -->
      <template v-else>
        <h2>¿Qué dificultad prefieres? 🎯</h2>
        <p class="subtitle">Define el nivel de desafío de las tarjetas</p>

        <div class="difficulties">
          <button
            type="button"
            class="diff-btn"
            :class="{ active: difficulty === 'easy' }"
            @click="difficulty = 'easy'"
          >
            <span class="diff-icon">🌱</span>
            <span class="diff-label">Fácil</span>
            <span class="diff-desc">Conceptos básicos</span>
          </button>
          <button
            type="button"
            class="diff-btn"
            :class="{ active: difficulty === 'medium' }"
            @click="difficulty = 'medium'"
          >
            <span class="diff-icon">⚡</span>
            <span class="diff-label">Medio</span>
            <span class="diff-desc">Desafío moderado</span>
          </button>
          <button
            type="button"
            class="diff-btn"
            :class="{ active: difficulty === 'hard' }"
            @click="difficulty = 'hard'"
          >
            <span class="diff-icon">🔥</span>
            <span class="diff-label">Difícil</span>
            <span class="diff-desc">Alto nivel</span>
          </button>
        </div>

        <div class="step-actions">
          <button type="button" class="back-btn" @click="goToStep1">← Atrás</button>
          <GlassButton @click="handleSubmit" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Empezar a aprender' }}
          </GlassButton>
        </div>
      </template>

    </div>
  </GlassCard>
</template>

<style scoped>
.onboarding { display: flex; flex-direction: column; gap: 1.5rem; text-align: center; min-width: 300px; }

/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  background: var(--glass-bg); color: var(--color-text-muted);
  border: 2px solid var(--glass-border);
  transition: all 0.3s;
}
.step-dot.active {
  background: var(--color-primary); color: white; border-color: var(--color-primary);
}
.step-line {
  width: 48px; height: 2px;
  background: var(--glass-border);
  transition: background 0.3s;
}
.step-line.active { background: var(--color-primary); }
.step-label {
  margin: 0; font-size: 0.8125rem; color: var(--color-text-secondary);
}

/* Topic selection */
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

/* Difficulty selection */
.difficulties {
  display: flex; gap: 0.75rem;
  justify-content: center; flex-wrap: wrap;
}
.diff-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
  padding: 1.25rem 1.5rem; border: 2px solid var(--glass-border);
  border-radius: var(--radius-card); background: rgba(255,255,255,0.1);
  cursor: pointer; transition: all 0.2s; min-width: 110px;
}
.diff-btn:hover { border-color: var(--color-primary); }
.diff-btn.active { border-color: var(--color-primary); background: rgba(124,58,237,0.15); }
.diff-icon { font-size: 1.75rem; }
.diff-label { font-weight: 600; color: var(--color-text-primary); font-size: 0.9375rem; }
.diff-desc { font-size: 0.75rem; color: var(--color-text-muted); }

/* Step actions */
.step-actions {
  display: flex; gap: 0.75rem;
  justify-content: center; align-items: center;
}
.back-btn {
  background: none; border: none;
  padding: 0.625rem 1rem;
  color: var(--color-text-secondary); font-size: 0.875rem;
  cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.back-btn:hover { opacity: 0.8; }
</style>
