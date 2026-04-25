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
    cssMinify: true, // Enable CSS minification for production
  },
  html: {
    // Critical CSS extraction configuration
    transformPage: (page) => {
      // Add critical CSS inlining here if needed
      return page
    },
  },
})
