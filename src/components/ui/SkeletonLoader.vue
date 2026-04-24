<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'card' | 'stat' | 'badge' | 'text'
  count?: number
}>(), {
  variant: 'card',
  count: 1,
})
</script>

<template>
  <div class="skeleton-list">
    <div
      v-for="i in count"
      :key="i"
      class="skeleton-item"
      :class="`skeleton-${variant}`"
    >
      <!-- card variant -->
      <template v-if="variant === 'card'">
        <div class="sk-line sk-line--short sk-line--tag"></div>
        <div class="sk-line sk-line--title"></div>
        <div class="sk-line sk-line--subtitle"></div>
        <div class="sk-footer">
          <div class="sk-line sk-line--chip"></div>
          <div class="sk-line sk-line--chip"></div>
        </div>
      </template>

      <!-- stat variant -->
      <template v-else-if="variant === 'stat'">
        <div class="sk-icon"></div>
        <div class="sk-stat-info">
          <div class="sk-line sk-line--value"></div>
          <div class="sk-line sk-line--label"></div>
        </div>
      </template>

      <!-- badge variant -->
      <template v-else-if="variant === 'badge'">
        <div class="sk-badge-icon"></div>
        <div class="sk-badge-info">
          <div class="sk-line sk-line--title"></div>
          <div class="sk-line sk-line--subtitle"></div>
        </div>
      </template>

      <!-- text variant -->
      <template v-else>
        <div class="sk-line sk-line--full"></div>
        <div class="sk-line sk-line--title"></div>
        <div class="sk-line sk-line--short"></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  display: contents;
}

.skeleton-item {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 1.25rem;
}

/* Shared pulse base */
.sk-line,
.sk-icon,
.sk-badge-icon {
  background: var(--glass-border);
  border-radius: 6px;
  animation: sk-pulse 1.5s ease-in-out infinite;
}

@keyframes sk-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Line sizes */
.sk-line--full   { height: 12px; width: 100%; margin-bottom: 0.5rem; }
.sk-line--title  { height: 14px; width: 75%; margin-bottom: 0.5rem; }
.sk-line--subtitle { height: 11px; width: 50%; margin-bottom: 0.75rem; }
.sk-line--short  { height: 10px; width: 35%; }
.sk-line--tag    { height: 10px; width: 30%; margin-bottom: 0.75rem; border-radius: 99px; }
.sk-line--value  { height: 20px; width: 60%; margin-bottom: 0.4rem; }
.sk-line--label  { height: 10px; width: 80%; }
.sk-line--chip   { height: 22px; width: 60px; border-radius: 99px; }

/* Card variant footer */
.skeleton-card .sk-footer {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

/* Stat variant */
.skeleton-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sk-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.sk-stat-info {
  flex: 1;
}

/* Badge variant */
.skeleton-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sk-badge-icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.sk-badge-info {
  flex: 1;
}
</style>
