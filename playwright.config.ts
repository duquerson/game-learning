import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4321',
    actionTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm build && pnpm preview' : 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
