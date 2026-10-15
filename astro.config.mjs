import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'static',
  site: 'https://duquerson.github.io',
  base: 'game-learning',
  security: {
    csp: {
      algorithm: 'SHA-256',
      scriptDirective: {
        hashes: [],
      },
      styleDirective: {
        hashes: [],
      },
    },
  },
  markdown: {
    syntaxHighlight: 'prism',
  },
  integrations: [vue({ appEntrypoint: '/src/entrypoint' })],
  vite: {
    plugins: [tailwindcss()],
    cssMinify: true,
  },
})
