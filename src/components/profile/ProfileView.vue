<script setup lang="ts">
import { ref, computed } from 'vue'
import { actions } from 'astro:actions'
import { toast } from 'vue-sonner'
import { GENERIC_USER_ERROR_MESSAGE } from '../../lib/user-error'
import { getTopicIcon } from '../../utils/topics'
import GlassCard from '../ui/GlassCard.vue'
import GlassButton from '../ui/GlassButton.vue'
import BadgeItem from '../badges/BadgeItem.vue'
import type { Badge } from '../../types/app'

interface UserBadge extends Badge {
  unlockedAt: string
}

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
  badges?: UserBadge[]
}>()

const initial = computed(() => {
  if (!props.email) return '?'
  return props.email.charAt(0).toUpperCase()
})

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
</script>

<template>
  <div class="mx-auto flex max-w-[640px] flex-col gap-6 p-4">
    <GlassCard>
      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-xl font-bold text-white">
          {{ initial }}
        </div>
        <div>
          <h2 class="m-0 text-lg font-semibold text-(--color-text-primary) capitalize">{{ email.split('@')[0] }}</h2>
          <p class="m-0 text-xs text-(--color-text-secondary)">{{ email }}</p>
        </div>
      </div>
    </GlassCard>

    <GlassCard>
      <div class="flex flex-col gap-3">
        <h2 class="m-0 text-xl font-bold text-(--color-text-primary)">Mis estadisticas</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div v-for="(stat, i) in statsList" :key="stat.label" class="flex flex-col items-center gap-1 rounded-(--radius-btn) border border-(--glass-border) bg-white/5 p-4 text-center">
            <span class="text-2xl font-bold text-(--color-primary)">{{ stat.value }}</span>
            <span class="text-xs text-(--color-text-secondary)">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </GlassCard>

    <GlassCard>
      <div class="flex flex-col gap-3">
        <h2 class="m-0 text-xl font-bold text-(--color-text-primary)">Mis temas</h2>
        <p class="m-0 text-sm text-(--color-text-secondary)">Selecciona los temas que quieres estudiar</p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="topic in availableTopics"
            :key="topic"
            type="button"
            class="btn-tactile touch-target relative flex min-w-[110px] flex-col items-center gap-2 rounded-xl border-2 border-(--glass-border) bg-white/5 p-5 text-sm font-semibold text-(--color-text-primary) transition-all hover:border-(--color-primary)"
            :class="{ '!border-(--color-primary) !bg-(--color-primary)/10': selectedTopics.includes(topic) }"
            @click="toggleTopic(topic)"
          >
            <span class="text-lg">{{ getTopicIcon(topic) }}</span>
            <span>{{ topic }}</span>
            <svg v-if="selectedTopics.includes(topic)" class="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-(--color-success)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
        <p v-if="availableTopics.length === 0" class="m-0 text-sm text-(--color-text-secondary)">No hay temas disponibles aun.</p>
        <GlassButton @click="saveTopics" :disabled="loading || selectedTopics.length === 0" class="self-start">
          {{ loading ? 'Guardando...' : 'Guardar temas' }}
        </GlassButton>
      </div>
    </GlassCard>

    <GlassCard v-if="badges && badges.length > 0">
      <div class="flex flex-col gap-3">
        <h2 class="m-0 text-xl font-bold text-(--color-text-primary)">Mis insignias</h2>
        <div class="flex flex-col gap-2">
          <BadgeItem v-for="badge in badges" :key="badge.id" :badge="badge" :unlocked-at="badge.unlockedAt" />
        </div>
      </div>
    </GlassCard>
  </div>
</template>

