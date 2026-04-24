import { defineConfig } from 'vitest/config'

export default defineConfig({
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

