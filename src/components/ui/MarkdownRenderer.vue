<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
  inline?: boolean
}>()

const htmlContent = computed(() => {
  if (!props.content) return ''
  
  const options = {
    gfm: true,
    breaks: true
  }

  return props.inline 
    ? marked.parseInline(props.content, options)
    : marked.parse(props.content, options)
})
</script>

<template>
  <div 
    class="markdown-content" 
    :class="{ 'inline-md': inline }"
    v-html="htmlContent" 
  />
</template>

<style>
.markdown-content {
  line-height: 1.7;
  color: var(--color-text-primary);
  font-size: var(--text-body);
}

.markdown-content p {
  margin-bottom: 1.25rem;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content strong {
  color: var(--color-primary);
  text-shadow: 0 0 12px color-mix(in srgb, var(--color-primary), transparent 60%);
  font-weight: 800;
}

.markdown-content code {
  font-family: var(--font-mono);
  background: rgba(124, 58, 237, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-size: 0.85em;
  color: var(--color-accent);
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.markdown-content pre {
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(8px);
  padding: 1.25rem;
  border-radius: 12px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  display: block;
  border: none;
  color: var(--color-text-secondary);
}

.markdown-content ul, .markdown-content ol {
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
  list-style-type: circle;
}

.markdown-content li {
  margin-bottom: 0.625rem;
}

.markdown-content h1, .markdown-content h2, .markdown-content h3 {
  color: var(--color-text-primary);
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Atomic learning spacing */
.markdown-content.inline-md p {
  margin-bottom: 0;
  display: inline;
}
</style>
