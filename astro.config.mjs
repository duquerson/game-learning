import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  security: {
    csp: true,
  },
  adapter: vercel(),
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
})
