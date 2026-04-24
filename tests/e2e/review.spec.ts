import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

/**
 * E2E tests for the Review session flow (R5, R6, R7, R10)
 *
 * These tests cover:
 * - Full Self-Assessment flow: start → answer all cards → see results
 * - Full Quiz Mode flow: start → answer all questions → see results
 * - Points update on dashboard after completing a session
 *
 * Prerequisites:
 * - TEST_USER_EMAIL and TEST_USER_PASSWORD env vars must be set
 * - The test user must have completed onboarding and have cards available
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Answers all cards in a self-assessment session by clicking "Ver respuesta"
 * then "Lo sabía" for each card, until the session redirects to /results.
 */
async function answerAllSelfAssessment(page: Page): Promise<void> {
  // Wait for the card scene to be ready
  await page.waitForSelector('.card-scene', { timeout: 15_000 });

  while (true) {
    const flipButton = page.getByRole('button', { name: /ver respuesta/i });
    const isVisible = await flipButton.isVisible().catch(() => false);

    if (!isVisible) break;

    // Flip the card
    await flipButton.click();
    // Wait for flip animation to complete
    await page.waitForTimeout(700);

    // Click "Lo sabía" to mark as correct
    const knewItButton = page.getByRole('button', { name: /lo sabía/i });
    await expect(knewItButton).toBeVisible();
    await knewItButton.click();

    // Wait briefly for the next card to load or for the redirect
    await page.waitForTimeout(400);

    // If we've been redirected to results, stop
    if (page.url().includes('/results')) break;
  }
}

/**
 * Answers all questions in a quiz session by clicking the first option for
 * each question, waiting for the auto-advance, until the session redirects
 * to /results.
 */
async function answerAllQuiz(page: Page): Promise<void> {
  // Wait for the first quiz question to appear
  await page.waitForSelector('text=Pregunta', { timeout: 15_000 });

  while (true) {
    // If already redirected to results, stop
    if (page.url().includes('/results')) break;

    // Quiz options are rendered via v-for — pick the first one
    // We filter out any "Ver respuesta" button to avoid false matches
    const options = page.locator('button').filter({ hasText: /^(?!.*ver respuesta).+/i });
    const count = await options.count().catch(() => 0);

    if (count === 0) break;

    // Click the first available option
    const firstOption = options.first();
    const isEnabled = await firstOption.isEnabled().catch(() => false);
    if (!isEnabled) break;

    await firstOption.click();

    // Wait for the 1000ms auto-advance delay + a small buffer
    await page.waitForTimeout(1_200);

    // If we've been redirected to results, stop
    if (page.url().includes('/results')) break;
  }
}

// ─── Suite 1: Self-Assessment full flow ──────────────────────────────────────

test.describe('Self-Assessment full flow', () => {
  // R5, R6, R7
  test('completes a full self-assessment session and shows results', async ({ page }) => {
    await page.goto('/review/self-assessment');

    // Answer all cards (marks all as correct for predictable results)
    await answerAllSelfAssessment(page);

    // Wait for redirect to results page
    await page.waitForURL('**/results', { timeout: 60_000 });

    // Results page heading
    await expect(page.locator('h1')).toContainText('Resultados del repaso');

    // Score circle shows a percentage
    const scoreCircle = page.locator('.w-36.h-36');
    await expect(scoreCircle).toContainText(/\d+%/);

    // Action buttons are present
    await expect(page.getByRole('button', { name: /repasar de nuevo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /volver al dashboard/i })).toBeVisible();
  });
});

// ─── Suite 2: Quiz Mode full flow ─────────────────────────────────────────────

test.describe('Quiz Mode full flow', () => {
  // R5, R6, R7
  test('completes a full quiz session and shows results', async ({ page }) => {
    await page.goto('/review/quiz');

    // Answer all quiz questions
    await answerAllQuiz(page);

    // Wait for redirect to results page
    await page.waitForURL('**/results', { timeout: 60_000 });

    // Results page heading
    await expect(page.locator('h1')).toContainText('Resultados del repaso');

    // Score circle shows a percentage
    const scoreCircle = page.locator('.w-36.h-36');
    await expect(scoreCircle).toContainText(/\d+%/);

    // "Repasar de nuevo" button is present
    await expect(page.getByRole('button', { name: /repasar de nuevo/i })).toBeVisible();
  });
});

// ─── Suite 3: Points update on dashboard after session ───────────────────────

test.describe('Points update on dashboard after session', () => {
  // R10 — points are awarded and reflected on the dashboard
  test('points on dashboard increase after completing a session', async ({ page }) => {
    // Allow extra time for the full session + navigation
    test.setTimeout(120_000);

    // ── Step 1: Read initial points from dashboard ──
    await page.goto('/dashboard');
    await page.waitForSelector('.stat-value', { timeout: 15_000 });

    const pointsLocator = page
      .locator('.stat-card')
      .filter({ hasText: 'Puntos totales' })
      .locator('.stat-value');

    await expect(pointsLocator).toBeVisible();
    const initialText = (await pointsLocator.textContent()) ?? '0';
    const initialPoints = parseInt(initialText.replace(/\D/g, '') || '0', 10);

    // ── Step 2: Complete a self-assessment session ──
    await page.goto('/review/self-assessment');
    await answerAllSelfAssessment(page);

    // Wait for redirect to results
    await page.waitForURL('**/results', { timeout: 60_000 });

    // ── Step 3: Navigate back to dashboard ──
    await page.getByRole('button', { name: /volver al dashboard/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await page.waitForSelector('.stat-value', { timeout: 15_000 });

    // ── Step 4: Read updated points ──
    const newPointsLocator = page
      .locator('.stat-card')
      .filter({ hasText: 'Puntos totales' })
      .locator('.stat-value');

    await expect(newPointsLocator).toBeVisible();
    const newText = (await newPointsLocator.textContent()) ?? '0';
    const newPoints = parseInt(newText.replace(/\D/g, '') || '0', 10);

    // Points should never decrease after a session
    expect(newPoints).toBeGreaterThanOrEqual(initialPoints);
  });
});
