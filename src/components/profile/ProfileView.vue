<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../../lib/user-error'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'

const props = defineProps<{
  email: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  totalReviewed: number
  totalCorrect: number
  accuracyPercent: number
  selectedTopics: string[]
  availableTopics: string[]
}>()

const selectedTopics = ref<string[]>([...props.selectedTopics])
const loading = ref(false)

function toggleTopic(topic: string) {
  const idx = selectedTopics.value.indexOf(topic)
  if (idx === -1) selectedTopics.value.push(topic)
  else selectedTopics.value.splice(idx, 1)
}

async function saveTopics() {
  if (selectedTopics.value.length === 0) {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
    return
  }

  loading.value = true
  try {
    const { data, error } = await actions.profile.updateTopics({ topics: selectedTopics.value })
    if (!error && data?.success) {
      toast.success('Temas actualizados correctamente')
    } else {
      toast.error(GENERIC_USER_ERROR_MESSAGE)
    }
  } catch {
    toast.error(GENERIC_USER_ERROR_MESSAGE)
  } finally {
    loading.value = false
  }
}

const topicIcons: Record<string, string> = {
  JavaScript: '⚡',
  TypeScript: '🔷',
}

function getIcon(topic: string) {
  return topicIcons[topic] ?? '📖'
}
</script>

<template>
  <div class="profile-page">
    <!-- Stats Section -->
    <GlassCard>
      <div class="stats-section">
        <h2 class="section-title">📊 Mis estadísticas</h2>

        <div class="email-row">
          <span class="stat-icon">✉️</span>
          <span class="email-text">{{ email }}</span>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ totalPoints }}</span>
            <span class="stat-label">⭐ Puntos totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentStreak }}</span>
            <span class="stat-label">🔥 Racha actual</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ longestStreak }}</span>
            <span class="stat-label">🏆 Racha máxima</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalReviewed }}</span>
            <span class="stat-label">📚 Total repasadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalCorrect }}</span>
            <span class="stat-label">✅ Total correctas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ accuracyPercent }}%</span>
            <span class="stat-label">🎯 Porcentaje de aciertos</span>
          </div>
        </div>
      </div>
    </GlassCard>

    <!-- Topics Section -->
    <GlassCard>
      <div class="topics-section">
        <h2 class="section-title">📖 Mis temas</h2>
        <p class="section-subtitle">Selecciona los temas que quieres estudiar</p>

        <div class="topics-grid">
          <button
            v-for="topic in availableTopics"
            :key="topic"
            type="button"
            class="topic-btn"
            :class="{ active: selectedTopics.includes(topic) }"
            @click="toggleTopic(topic)"
          >
            <span class="topic-icon">{{ getIcon(topic) }}</span>
            <span class="topic-label">{{ topic }}</span>
            <span v-if="selectedTopics.includes(topic)" class="topic-check">✓</span>
          </button>
        </div>

        <p v-if="availableTopics.length === 0" class="empty-text">
          No hay temas disponibles aún.
        </p>

        <GlassButton
          @click="saveTopics"
          :disabled="loading || selectedTopics.length === 0"
        >
          {{ loading ? 'Guardando...' : 'Guardar temas' }}
        </GlassButton>
      </div>
    </GlassCard>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
}

.stats-section,
.topics-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.section-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.email-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
}

.stat-icon {
  font-size: 1rem;
}

.email-text {
  font-size: 0.9rem;
  color: var(--color-text-primary);
  word-break: break-all;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-btn);
  border: 1px solid var(--glass-border);
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.topic-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 110px;
}

.topic-btn:hover {
  border-color: var(--color-primary);
}

.topic-btn.active {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.15);
}

.topic-icon {
  font-size: 1.75rem;
}

.topic-label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.topic-check {
  position: absolute;
  top: 0.4rem;
  right: 0.5rem;
  color: var(--color-success);
  font-size: 0.875rem;
  font-weight: 700;
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
