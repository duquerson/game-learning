import { test, expect, type Browser } from '@playwright/test';

/**
 * E2E tests for authentication flows (R1.1–R1.9)
 *
 * These tests cover:
 * - Login with email/password → dashboard (R1.2, R1.7)
 * - Wrong credentials → error message (R1.7)
 * - Registration → onboarding → dashboard (R1.1, R1.5, R2.1–R2.4)
 * - Logout → redirect to login (R1.8)
 * - Protected route without session → redirect to login (R1.9, R14.2)
 *
 * Note: These tests use the base `test` from @playwright/test directly
 * (not the authenticated fixture) because they test the auth flow itself.
 */

// ─── Suite 1: Login with email/password ──────────────────────────────────────

test.describe('Login with email/password', () => {
  // R1.2, R1.7
  test('valid credentials redirect to dashboard', async ({ page }) => {
    test.setTimeout(60_000);

    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set');
    }

    await page.goto('/login');

    await page.fill('#email', email!);
    await page.fill('#password', password!);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should redirect away from /login (to /dashboard or /onboarding)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 });

    expect(page.url()).not.toContain('/login');
  });
});

// ─── Suite 2: Wrong credentials → error message ───────────────────────────────

test.describe('Wrong credentials', () => {
  // R1.7
  test('shows error toast and stays on login page', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/login');

    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Error toast should appear
    await page.waitForSelector('[data-sonner-toast]', { timeout: 15_000 });
    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();

    // Should still be on /login
    expect(page.url()).toContain('/login');
  });
});

// ─── Suite 3: Registration → onboarding → dashboard ──────────────────────────

test.describe('Registration flow', () => {
  // R1.1, R1.5, R2.1–R2.4
  test('register → onboarding → dashboard', async ({ page }) => {
    test.setTimeout(60_000);

    const newUserPassword = process.env.TEST_NEW_USER_PASSWORD;

    if (!newUserPassword) {
      test.skip(true, 'TEST_NEW_USER_PASSWORD must be set to run registration test');
    }

    // Generate a unique email to avoid conflicts
    const uniqueEmail = `test+${Date.now()}@example.com`;

    // ── Step 1: Register ──
    await page.goto('/register');

    await page.fill('#email', uniqueEmail);
    await page.fill('#password', newUserPassword!);
    await page.fill('#confirm-password', newUserPassword!);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Should redirect to /onboarding
    await page.waitForURL('**/onboarding', { timeout: 30_000 });
    expect(page.url()).toContain('/onboarding');

    // ── Step 2: Onboarding — select at least one topic ──
    await page.waitForSelector('.topic-btn', { timeout: 15_000 });

    const firstTopic = page.locator('.topic-btn').first();
    await expect(firstTopic).toBeVisible();
    await firstTopic.click();

    await page.getByRole('button', { name: /empezar a aprender/i }).click();

    // Should redirect to /dashboard
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    expect(page.url()).toContain('/dashboard');
  });
});

// ─── Suite 4: Logout → redirect to login ─────────────────────────────────────

test.describe('Logout', () => {
  // R1.8
  test('logout redirects to /login', async ({ page }) => {
    test.setTimeout(60_000);

    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set');
    }

    // Log in first
    await page.goto('/login');
    await page.fill('#email', email!);
    await page.fill('#password', password!);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait until authenticated
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 });

    // Click logout button in sidebar
    await page.waitForSelector('.logout-btn', { timeout: 15_000 });
    await page.click('.logout-btn');

    // Should redirect to /login
    await page.waitForURL('**/login', { timeout: 15_000 });
    expect(page.url()).toContain('/login');
  });
});

// ─── Suite 5: Protected route without session → redirect to login ─────────────

test.describe('Protected routes', () => {
  // R1.9, R14.2
  test('accessing /dashboard without session redirects to /login', async ({ browser }: { browser: Browser }) => {
    test.setTimeout(60_000);

    // Use a fresh context with NO storage state (unauthenticated)
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      await page.goto('/dashboard');

      // Should redirect to /login
      await page.waitForURL('**/login', { timeout: 15_000 });
      expect(page.url()).toContain('/login');
    } finally {
      await context.close();
    }
  });
});
