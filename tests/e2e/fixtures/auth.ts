import { test as base, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join('tests', 'e2e', '.auth', 'user.json');

/**
 * Performs login via the app's /login page and saves storage state.
 * Reads credentials from E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars.
 */
async function loginAndSaveState(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set for authenticated tests.'
    );
  }

  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/contraseña|password/i).fill(password);
  await page.getByRole('button', { name: /iniciar sesión|login|sign in/i }).click();

  // Wait for redirect away from /login (successful auth)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });

  // Ensure .auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });
}

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Extended test with an `authenticatedPage` fixture.
 * The fixture logs in once and reuses the saved storage state.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // If no saved state exists yet, perform login to create it
    if (!fs.existsSync(authFile)) {
      await loginAndSaveState(page);
    }

    await use(page);
  },
});

export { expect };

/**
 * Auth setup helper — use this in a *.setup.ts file to create the auth state
 * before the main test projects run.
 *
 * @example
 * // tests/e2e/auth.setup.ts
 * import { setupAuth } from './fixtures/auth';
 * setupAuth();
 */
export function setupAuth(): void {
  base('authenticate', async ({ page }) => {
    await loginAndSaveState(page);
  });
}
