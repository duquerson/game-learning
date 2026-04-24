<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DbCard } from '../../types/database'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import CardItem from './CardItem.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'
import EmptyState from '../ui/EmptyState.vue'

const props = defineProps<{
  cards: DbCard[]
  reviewedIds: string[]
  loading?: boolean
}>()

const topicFilter = ref('all')
const subtopicFilter = ref('all')
const difficultyFilter = ref('all')
const selectedCard = ref<DbCard | null>(null)

const reviewedSet = computed(() => new Set(props.reviewedIds))

const topics = computed(() => [...new Set(props.cards.map(c => c.topic))].sort())
const subtopics = computed(() => {
  const base = props.cards.filter(c => topicFilter.value === 'all' || c.topic === topicFilter.value)
  return [...new Set(base.map(c => c.subtopic))].filter(Boolean).sort()
})

const filteredCards = computed(() => props.cards.filter(card => {
  const topicMatch = topicFilter.value === 'all' || card.topic === topicFilter.value
  const subtopicMatch = subtopicFilter.value === 'all' || card.subtopic === subtopicFilter.value
  const diffMatch = difficultyFilter.value === 'all' || card.difficulty === difficultyFilter.value
  return topicMatch && subtopicMatch && diffMatch
}))

function clearFilters() {
  topicFilter.value = 'all'
  subtopicFilter.value = 'all'
  difficultyFilter.value = 'all'
}
</script>

<template>
  <div class="library">
    <div class="library-header">
      <div>
        <h1>Biblioteca</h1>
        <p class="count">{{ filteredCards.length }} tarjetas</p>
      </div>
      <GlassButton @click="window.location.href = '/review'">
        Iniciar repaso →
      </GlassButton>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <select v-model="topicFilter" @change="subtopicFilter = 'all'">
        <option value="all">Todos los temas</option>
        <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      </select>

      <select v-model="subtopicFilter">
        <option value="all">Todos los subtemas</option>
        <option v-for="s in subtopics" :key="s" :value="s">{{ s }}</option>
      </select>

      <select v-model="difficultyFilter">
        <option value="all">Todas las dificultades</option>
        <option value="easy">Fácil</option>
        <option value="medium">Medio</option>
        <option value="hard">Difícil</option>
      </select>

      <button v-if="topicFilter !== 'all' || difficultyFilter !== 'all' || subtopicFilter !== 'all'" class="clear-btn" @click="clearFilters">
        Limpiar filtros ✕
      </button>
    </div>

    <!-- Skeleton loaders mientras carga -->
    <div v-if="loading" class="cards-grid">
      <SkeletonLoader variant="card" :count="6" />
    </div>

    <!-- Grid de tarjetas -->
    <div v-else-if="filteredCards.length > 0" class="cards-grid">
      <CardItem
        v-for="card in filteredCards"
        :key="card.id"
        :card="card"
        :reviewed="reviewedSet.has(card.id)"
        @click="selectedCard = card"
      />
    </div>

    <!-- Estado vacío cuando no hay resultados con filtros -->
    <EmptyState
      v-else
      icon="🔍"
      title="No se encontraron tarjetas"
      description="Prueba con otros filtros o explora todos los temas disponibles."
      ctaLabel="Limpiar filtros"
      @cta-click="clearFilters"
    />

    <!-- Modal de detalle -->
    <div v-if="selectedCard" class="modal-overlay" @click.self="selectedCard = null">
      <GlassCard class="modal-card">
        <div class="modal-header">
          <span class="topic-tag">{{ selectedCard.topic }}</span>
          <button class="close-btn" @click="selectedCard = null">✕</button>
        </div>
        <h2>{{ selectedCard.title }}</h2>
        <p class="subtopic">{{ selectedCard.subtopic }}</p>
        <div class="content">{{ selectedCard.content }}</div>
        <div class="modal-footer">
          <span class="difficulty" :class="selectedCard.difficulty">{{ selectedCard.difficulty }}</span>
          <span class="points">+{{ selectedCard.points }} pts</span>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<style scoped>
.library { max-width: 900px; margin: 0 auto; }
.library-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 480px) {
  .library-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}
h1 { margin: 0; font-size: 1.25rem; color: var(--color-text-primary); }
@media (min-width: 768px) { h1 { font-size: 1.5rem; } }
.count { margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--color-text-secondary); }
.filters { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
select {
  padding: 0.5rem 0.75rem; border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn); background: var(--glass-bg);
  color: var(--color-text-primary); font-size: 0.875rem; cursor: pointer;
  min-width: 0; flex: 1 1 auto;
}
@media (min-width: 480px) { select { flex: 0 1 auto; } }
.clear-btn {
  padding: 0.5rem 0.75rem; border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn); background: transparent;
  color: var(--color-text-secondary); font-size: 0.875rem; cursor: pointer;
}
.clear-btn:hover { color: var(--color-error); border-color: var(--color-error); }
/* Mobile-first: 1 col → 2 col at sm → 3 col at lg */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 480px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .cards-grid { grid-template-columns: repeat(3, 1fr); } }
.empty { display: none; }
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; z-index: 100;
}
.modal-card { max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.topic-tag { font-size: 0.75rem; text-transform: uppercase; color: var(--color-primary); font-weight: 600; }
.close-btn { background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--color-text-secondary); }
h2 { margin: 0 0 0.25rem; font-size: 1.25rem; color: var(--color-text-primary); }
.subtopic { margin: 0 0 1rem; font-size: 0.75rem; color: var(--color-text-secondary); }
.content { font-size: 0.875rem; color: var(--color-text-primary); line-height: 1.7; white-space: pre-wrap; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); }
.difficulty { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 4px; }
.difficulty.easy { background: rgba(16,185,129,0.15); color: var(--color-success); }
.difficulty.medium { background: rgba(245,158,11,0.15); color: var(--color-accent); }
.difficulty.hard { background: rgba(239,68,68,0.15); color: var(--color-error); }
.points { font-size: 0.875rem; font-weight: 600; color: var(--color-accent); }
</style>
