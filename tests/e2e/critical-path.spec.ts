import { test, expect } from './fixtures';

test.describe('Critical Path - Review flow', () => {
  test('User can navigate from Dashboard to Library and start a review session', async ({ authenticatedPage: page }) => {
    // 1. Start at Dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /(Buenos días|Buenas tardes|Buenas noches)/i })).toBeVisible({ timeout: 10000 });

    // 2. Navigate to Library
    await page.getByRole('link', { name: /Biblioteca/i }).click();
    await expect(page).toHaveURL(/\/library/);
    
    // Validate we're in the library
    await expect(page.getByRole('heading', { name: /Biblioteca/i })).toBeVisible();

    // 3. Start review from Library
    await page.getByRole('button', { name: /Iniciar repaso/i }).click();
    await expect(page).toHaveURL(/\/review/);

    // 4. Choose Self-Assessment mode
    const selfAssessmentLink = page.getByRole('link', { name: /Self-Assessment/i });
    await selfAssessmentLink.click();
    await expect(page).toHaveURL(/\/review\/self-assessment/);

    // 5. Interact with the review session (Handle empty state gracefully if no cards)
    const emptyState = page.getByText(/No hay tarjetas disponibles/i);
    const hasCards = await emptyState.isHidden();

    if (hasCards) {
      // Validate card is present
      const flipButton = page.getByRole('button', { name: /Ver respuesta/i });
      await expect(flipButton).toBeVisible();

      // Flip card
      await flipButton.click();
      
      // Select an answer
      const answerButton = page.getByRole('button', { name: /Lo sabía/i }).first();
      await expect(answerButton).toBeVisible();
      await answerButton.click();
    }
  });
});
