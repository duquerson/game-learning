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

const searchQuery = ref('')
const topicFilter = ref('all')
const subtopicFilter = ref('all')
const difficultyFilter = ref('all')
const sortBy = ref('topic')
const selectedCard = ref<DbCard | null>(null)

const reviewedSet = computed(() => new Set(props.reviewedIds))

const topics = computed(() => [...new Set(props.cards.map(c => c.topic))].sort())
const subtopics = computed(() => {
  const base = props.cards.filter(c => topicFilter.value === 'all' || c.topic === topicFilter.value)
  return [...new Set(base.map(c => c.subtopic))].filter(Boolean).sort()
})

const filteredCards = computed(() => {
  let result = props.cards.filter(card => {
    const topicMatch = topicFilter.value === 'all' || card.topic === topicFilter.value
    const subtopicMatch = subtopicFilter.value === 'all' || card.subtopic === subtopicFilter.value
    const diffMatch = difficultyFilter.value === 'all' || card.difficulty === difficultyFilter.value
    const searchMatch = !searchQuery.value ||
      card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (card.content && card.content.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return topicMatch && subtopicMatch && diffMatch && searchMatch
  })

  // Sort
  if (sortBy.value === 'difficulty-asc') {
    const order = { easy: 1, medium: 2, hard: 3 }
    result = [...result].sort((a, b) => order[a.difficulty] - order[b.difficulty])
  } else if (sortBy.value === 'difficulty-desc') {
    const order = { easy: 1, medium: 2, hard: 3 }
    result = [...result].sort((a, b) => order[b.difficulty] - order[a.difficulty])
  } else {
    result = [...result].sort((a, b) => a.topic.localeCompare(b.topic))
  }

  return result
})

const allReviewed = computed(() =>
  filteredCards.value.length > 0 && filteredCards.value.every(c => reviewedSet.has(c.id))
)

const groupedCards = computed(() => {
  const groups: Record<string, Record<string, DbCard[]>> = {}
  for (const card of filteredCards.value) {
    if (!groups[card.topic]) groups[card.topic] = {}
    const subtopic = card.subtopic || 'General'
    if (!groups[card.topic][subtopic]) groups[card.topic][subtopic] = []
    groups[card.topic][subtopic].push(card)
  }
  return groups
})

function clearFilters() {
  searchQuery.value = ''
  topicFilter.value = 'all'
  subtopicFilter.value = 'all'
  difficultyFilter.value = 'all'
  sortBy.value = 'topic'
}
</script>

<template>
  <div class="library">
    <div class="library-header">
      <div>
        <h1>Biblioteca</h1>
        <p class="count">{{ filteredCards.length }} tarjetas</p>
      </div>
      <GlassButton @click="() => window.location.href = '/review'">
        Iniciar repaso →
      </GlassButton>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por título o contenido..."
        class="search-input"
      />
    </div>

    <!-- Filters -->
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

      <select v-model="sortBy">
        <option value="topic">Tema (A-Z)</option>
        <option value="difficulty-asc">Dificultad (menor a mayor)</option>
        <option value="difficulty-desc">Dificultad (mayor a menor)</option>
      </select>

      <button v-if="topicFilter !== 'all' || difficultyFilter !== 'all' || subtopicFilter !== 'all' || searchQuery || sortBy !== 'topic'" class="clear-btn" @click="clearFilters">
        Limpiar filtros ✕
      </button>
    </div>

    <!-- Skeleton loaders -->
    <div v-if="loading" class="cards-grid">
      <SkeletonLoader variant="card" :count="6" />
    </div>

    <!-- Grouped cards -->
    <div v-else-if="filteredCards.length > 0 && !allReviewed" class="grouped-view">
      <div v-for="(subtopics, topic) in groupedCards" :key="topic" class="topic-section">
        <h2 class="topic-title">{{ topic }}</h2>
        <div v-for="(cards, subtopic) in subtopics" :key="subtopic" class="subtopic-section">
          <h3 class="subtopic-title">{{ subtopic }} <span class="count-badge">{{ cards.length }}</span></h3>
          <div class="cards-grid">
            <CardItem
              v-for="card in cards"
              :key="card.id"
              :card="card"
              :reviewed="reviewedSet.has(card.id)"
              @click="selectedCard = card"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- All reviewed -->
    <EmptyState
      v-else-if="allReviewed"
      icon="🎉"
      title="¡Todo al día!"
      description="Has repasado todas las tarjetas disponibles. Vuelve pronto para nuevo contenido o repasa las que hayas respondido incorrectamente."
    />

    <!-- No results -->
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
          <button class="close-btn" @click="selectedCard = null" aria-label="Cerrar">✕</button>
        </div>
        <h2>{{ selectedCard.title }}</h2>
        <p class="subtopic-label">{{ selectedCard.subtopic }}</p>
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
  display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;
}
@media (min-width: 480px) {
  .library-header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
}
h1 { margin: 0; font-size: 1.25rem; color: var(--color-text-primary); }
@media (min-width: 768px) { h1 { font-size: 1.5rem; } }
.count { margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--color-text-secondary); }

/* Search */
.search-bar {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  background: var(--glass-bg);
}
.search-icon { font-size: 0.875rem; }
.search-input {
  flex: 1; border: none; background: transparent;
  color: var(--color-text-primary); font-size: 0.875rem;
  font-family: inherit; outline: none;
}
.search-input::placeholder { color: var(--color-text-muted); }

/* Filters */
.filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
select {
  padding: 0.5rem 0.75rem; border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn); background: var(--glass-bg);
  color: var(--color-text-primary); font-size: 0.8125rem; cursor: pointer;
  min-width: 0; flex: 1 1 auto;
}
@media (min-width: 480px) { select { flex: 0 1 auto; } }
.clear-btn {
  padding: 0.5rem 0.75rem; border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn); background: transparent;
  color: var(--color-text-secondary); font-size: 0.8125rem; cursor: pointer;
}
.clear-btn:hover { color: var(--color-error); border-color: var(--color-error); }

/* Grouped view */
.grouped-view { display: flex; flex-direction: column; gap: 1.5rem; }
.topic-title {
  margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 700;
  color: var(--color-text-primary); text-transform: capitalize;
}
.subtopic-section { margin-bottom: 1rem; }
.subtopic-title {
  margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600;
  color: var(--color-text-secondary); display: flex; align-items: center; gap: 0.5rem;
}
.count-badge {
  font-size: 0.75rem; font-weight: 500;
  background: var(--glass-bg); color: var(--color-text-muted);
  padding: 0.125rem 0.5rem; border-radius: 99px;
}

/* Cards grid */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 480px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .cards-grid { grid-template-columns: repeat(3, 1fr); } }

/* Modal */
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
.subtopic-label { margin: 0 0 1rem; font-size: 0.75rem; color: var(--color-text-secondary); }
.content { font-size: 0.875rem; color: var(--color-text-primary); line-height: 1.7; white-space: pre-wrap; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); }
.difficulty { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 4px; }
.difficulty.easy { background: rgba(16,185,129,0.15); color: var(--color-success); }
.difficulty.medium { background: rgba(245,158,11,0.15); color: var(--color-accent); }
.difficulty.hard { background: rgba(239,68,68,0.15); color: var(--color-error); }
.points { font-size: 0.875rem; font-weight: 600; color: var(--color-accent); }
</style>
