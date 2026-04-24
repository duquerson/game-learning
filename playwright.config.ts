import fs from 'fs';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const authFile = path.join('tests', 'e2e', '.auth', 'user.json');
const authEnabled = Boolean(
  process.env.TEST_USER_EMAIL &&
  process.env.TEST_USER_PASSWORD &&
  process.env.PUBLIC_SUPABASE_URL &&
  process.env.PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.PUBLIC_SUPABASE_URL.includes('your-project.supabase.co') &&
  !process.env.PUBLIC_SUPABASE_ANON_KEY.includes('your-anon-key')
);

if (!authEnabled) {
  console.warn('Playwright auth projects disabled because TEST_USER_EMAIL, TEST_USER_PASSWORD, PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY is missing or placeholder.');
}

const authProjects = authEnabled
  ? [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ]
  : [];

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4321',
    actionTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results.json' }]],
  projects: [
    {
      name: 'simple',
      testMatch: /.*(?:visual-a11y-simple|visual-and-accessibility)\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    ...authProjects,
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
