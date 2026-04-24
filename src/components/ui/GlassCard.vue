<template>
  <div class="glass-card">
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  padding: 1.25rem;
}

@media (min-width: 768px) {
  .glass-card {
    padding: 1.75rem;
  }
}
</style>