import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  define: {
    'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'),
    'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY ?? 'test-local-anon-key'),
  },
  resolve: {
    alias: {
      'astro:actions': fileURLToPath(new URL('./tests/mocks/astro-actions.ts', import.meta.url)),
      'astro:schema': fileURLToPath(new URL('./tests/mocks/astro-schema.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.security.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/actions/**/*.ts', 'src/stores/**/*.ts'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.security.test.ts',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      all: true,
    },
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    // Security: Isolate tests to prevent state leakage
    isolate: true,
    // Disable parallelization for security tests to prevent race conditions
    maxWorkers: 1,
  },
})

