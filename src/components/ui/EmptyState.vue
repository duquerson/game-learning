<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon?: string
  ctaLabel?: string
  ctaHref?: string
}>()

const emit = defineEmits<{
  (e: 'cta-click'): void
}>()
</script>

<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon" aria-hidden="true">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <a
      v-if="ctaHref && ctaLabel"
      :href="ctaHref"
      class="empty-cta"
    >
      {{ ctaLabel }}
    </a>
    <button
      v-else-if="ctaLabel"
      class="empty-cta"
      @click="emit('cta-click')"
    >
      {{ ctaLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  gap: 0.5rem;
}

.empty-icon {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.empty-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  max-width: 320px;
  line-height: 1.6;
}

.empty-cta {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.625rem 1.25rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.empty-cta:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}
</style>
