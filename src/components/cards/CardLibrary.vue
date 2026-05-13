<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DbCard } from '../../types/database'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import CardItem from './CardItem.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'
import EmptyState from '../ui/EmptyState.vue'

const props = withDefaults(defineProps<{
  cards: DbCard[]
  reviewedIds: string[]
  loading?: boolean
}>(), {
  cards: () => [],
  reviewedIds: () => [],
  loading: false,
})

const searchQuery = ref('')
const topicFilter = ref('all')
const subtopicFilter = ref('all')
const difficultyFilter = ref('all')
const sortBy = ref('topic')
const selectedCard = ref<DbCard | null>(null)

const reviewedSet = computed(() => new Set(props.reviewedIds ?? []))

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
  filteredCards.value.length > 0 && filteredCards.value.every(c => reviewedSet.value.has(c.id))
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
  <div class="mx-auto max-w-[900px]">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="font-heading m-0 text-xl text-(--color-text-primary) sm:text-2xl tracking-tight">Biblioteca</h1>
        <p class="m-0 mt-1 text-sm text-(--color-text-secondary)">{{ filteredCards.length }} tarjetas</p>
      </div>
      <GlassButton class="btn-tactile" @click="() => window.location.href = '/review'">
        Iniciar repaso
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </GlassButton>
    </div>

    <div class="flex items-center gap-2 rounded-(--radius-btn) border border-(--glass-border) bg-(--glass-bg) p-2.5 mb-4">
      <svg class="h-4 w-4 shrink-0 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por titulo o contenido..."
        class="flex-1 border-none bg-transparent text-sm text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted)"
      />
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <select v-model="topicFilter" @change="subtopicFilter = 'all'" class="touch-target flex-1 min-w-0 rounded-(--radius-btn) border border-(--glass-border) bg-(--glass-bg) px-3 py-2 text-xs text-(--color-text-primary) cursor-pointer sm:flex-none">
        <option value="all">Todos los temas</option>
        <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      </select>

      <select v-model="subtopicFilter" class="touch-target flex-1 min-w-0 rounded-(--radius-btn) border border-(--glass-border) bg-(--glass-bg) px-3 py-2 text-xs text-(--color-text-primary) cursor-pointer sm:flex-none">
        <option value="all">Todos los subtemas</option>
        <option v-for="s in subtopics" :key="s" :value="s">{{ s }}</option>
      </select>

      <select v-model="difficultyFilter" class="touch-target flex-1 min-w-0 rounded-(--radius-btn) border border-(--glass-border) bg-(--glass-bg) px-3 py-2 text-xs text-(--color-text-primary) cursor-pointer sm:flex-none">
        <option value="all">Todas las dificultades</option>
        <option value="easy">Facil</option>
        <option value="medium">Medio</option>
        <option value="hard">Dificil</option>
      </select>

      <select v-model="sortBy" class="touch-target flex-1 min-w-0 rounded-(--radius-btn) border border-(--glass-border) bg-(--glass-bg) px-3 py-2 text-xs text-(--color-text-primary) cursor-pointer sm:flex-none">
        <option value="topic">Tema (A-Z)</option>
        <option value="difficulty-asc">Dificultad ascendente</option>
        <option value="difficulty-desc">Dificultad descendente</option>
      </select>

      <button v-if="topicFilter !== 'all' || difficultyFilter !== 'all' || subtopicFilter !== 'all' || searchQuery || sortBy !== 'topic'" class="btn-tactile touch-target flex items-center gap-1 rounded-(--radius-btn) border border-(--glass-border) bg-transparent px-3 py-2 text-xs text-(--color-text-secondary) hover:border-(--color-error) hover:text-(--color-error)" @click="clearFilters">
        Limpiar filtros
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Skeleton loaders -->
    <div v-if="loading" class="cards-grid">
      <SkeletonLoader variant="card" :count="6" />
    </div>

    <div v-else-if="filteredCards.length > 0 && !allReviewed" class="flex flex-col gap-6">
      <div v-for="(subtopics, topic) in groupedCards" :key="topic">
        <h2 class="font-heading m-0 mb-2 text-lg font-bold capitalize text-(--color-text-primary)">{{ topic }}</h2>
        <div v-for="(cards, subtopic) in subtopics" :key="subtopic" class="mb-4">
          <h3 class="m-0 mb-3 flex items-center gap-2 text-sm font-semibold text-(--color-text-secondary)">
            {{ subtopic }}
            <span class="rounded-full bg-(--glass-bg) px-2 py-0.5 text-xs font-medium text-(--color-text-muted)">{{ cards.length }}</span>
          </h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

    <EmptyState
      v-else-if="allReviewed"
      icon="star"
      title="Todo al dia"
      description="Has repasado todas las tarjetas disponibles. Vuelve pronto para nuevo contenido o repasa las que hayas respondido incorrectamente."
    />

    <EmptyState
      v-else
      icon="alert"
      title="No se encontraron tarjetas"
      description="Prueba con otros filtros o explora todos los temas disponibles."
      ctaLabel="Limpiar filtros"
      @cta-click="clearFilters"
    />

    <div v-if="selectedCard" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="selectedCard = null">
      <GlassCard class="max-h-[80vh] w-full max-w-[500px] overflow-y-auto">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">{{ selectedCard.topic }}</span>
          <button class="btn-tactile flex h-8 w-8 items-center justify-center rounded-full text-sm text-(--color-text-secondary) hover:bg-white/10" @click="selectedCard = null" aria-label="Cerrar">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <h2 class="m-0 mb-1 text-xl font-bold text-(--color-text-primary) font-heading">{{ selectedCard.title }}</h2>
        <p class="m-0 mb-4 text-xs text-(--color-text-secondary)">{{ selectedCard.subtopic }}</p>
        <div class="whitespace-pre-wrap text-sm leading-relaxed text-(--color-text-primary)">{{ selectedCard.content }}</div>
        <div class="mt-4 flex items-center justify-between border-t border-(--glass-border) pt-4">
          <span class="rounded px-2 py-1 text-xs font-semibold" :class="selectedCard.difficulty === 'easy' ? 'bg-(--color-success)/15 text-(--color-success)' : selectedCard.difficulty === 'medium' ? 'bg-(--color-warning)/15 text-(--color-warning)' : 'bg-(--color-destructive)/15 text-(--color-destructive)'">{{ selectedCard.difficulty }}</span>
          <span class="text-sm font-semibold text-(--color-accent-green)">+{{ selectedCard.points }} pts</span>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<style scoped>
select option { background: oklch(15% 0.015 250); color: oklch(98% 0 0); }
</style>
