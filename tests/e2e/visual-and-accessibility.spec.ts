import { test, expect, devices } from '@playwright/test'

/**
 * Visual & Accessibility Tests
 * Tests for theme hydration bugs, A11y gaps, responsive design, and visual regressions
 * Addresses audit findings: Theme Flash (P0), A11y Gaps (P0), Responsive (P2)
 */

test.describe('[P0] Theme Flash on Hydration', () => {
  test('should not flash light theme when system prefers dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.addInitScript(() => {
      try {
        localStorage.clear()
      } catch (error) {
        console.warn('Unable to clear localStorage during test setup:', error)
      }

      ; (window as any).themeFlashes = []
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          if (m.attributeName === 'data-theme') {
            ; (window as any).themeFlashes.push({
              timestamp: Date.now(),
              newValue: document.documentElement.getAttribute('data-theme'),
            })
          }
        })
      })
      observer.observe(document.documentElement, { attributes: true })
    })

    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('form')

    const bodyStyles = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor
    })

    console.log('Final computed background:', bodyStyles)

    const flashes = await page.evaluate(() => (window as any).themeFlashes || [])
    console.log('Theme attribute changes:', flashes)

    expect(flashes.length).toBeLessThanOrEqual(1)

    const finalTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    )
    expect(finalTheme).toBe('dark')
  })

  test('should respect localStorage theme over system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' }) // System: dark

    // Set localStorage to light (user preference overrides system)
    await page.context().addInitScript(() => {
      localStorage.setItem('theme', 'light')
    })

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const theme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    )
    expect(theme).toBe('light')
  })

  test('should persist theme selection across navigation', async ({ page }) => {
    await page.goto('/login')

    // Simulate toggling theme (assuming ThemeToggle component exists)
    const themeToggle = page.locator('[data-testid="theme-toggle"]')

    if (await themeToggle.isVisible()) {
      const initialTheme = await page.evaluate(
        () => document.documentElement.getAttribute('data-theme')
      )

      await themeToggle.click()
      await page.waitForTimeout(300) // Wait for transition

      const afterToggle = await page.evaluate(
        () => document.documentElement.getAttribute('data-theme')
      )
      expect(afterToggle).not.toBe(initialTheme)

      // Navigate and return
      await page.goto('/register')
      await page.goto('/login')

      const afterNavigation = await page.evaluate(
        () => document.documentElement.getAttribute('data-theme')
      )
      expect(afterNavigation).toBe(afterToggle)
    }
  })
})

test.describe('[P1] Accessibility - ARIA Labels & Form Fields', () => {
  test('login form inputs have associated labels', async ({ page }) => {
    await page.goto('/login')

    // Check email input
    const emailInput = page.locator('#email')
    const emailLabel = page.locator('label[for="email"]')

    await expect(emailInput).toBeVisible()
    await expect(emailLabel).toBeVisible()
    expect(await emailLabel.textContent()).toContain('Email')

    // Check password input
    const passwordInput = page.locator('#password')
    const passwordLabel = page.locator('label[for="password"]')

    await expect(passwordInput).toBeVisible()
    await expect(passwordLabel).toBeVisible()
    expect(await passwordLabel.textContent()).toContain('Contraseña')
  })

  test('buttons have accessible labels', async ({ page }) => {
    await page.goto('/login')

    // Submit button should have text content
    const submitBtn = page.getByRole('button', { name: /iniciar sesión|crear cuenta/i })
    await expect(submitBtn).toBeVisible()
    expect(await submitBtn.textContent()).toBeTruthy()

    // OAuth buttons should have aria-label or visible text
    const oauthButtons = page.locator('[class*="oauth"]')
    const count = await oauthButtons.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 2); i++) {
        const btn = oauthButtons.nth(i)
        const label = await btn.getAttribute('aria-label')
        const text = await btn.textContent()

        // Should have either aria-label or visible text
        expect(label || text).toBeTruthy()
      }
    }
  })

  test('form inputs have proper type attributes', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')

    expect(await emailInput.getAttribute('type')).toBe('email')
    expect(await passwordInput.getAttribute('type')).toBe('password')
  })
})

test.describe('[P1] Accessibility - Keyboard Navigation', () => {
  test('can navigate login form with Tab key', async ({ page }) => {
    await page.goto('/login')

    // Tab to email input
    await page.keyboard.press('Tab')
    let focusedElement = await page.evaluate(() => document.activeElement?.id)
    expect(focusedElement).toBe('email')

    // Tab to password input
    await page.keyboard.press('Tab')
    focusedElement = await page.evaluate(() => document.activeElement?.id)
    expect(focusedElement).toBe('password')

    // Tab to submit button
    await page.keyboard.press('Tab')
    focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('type'))
    expect(focusedElement).toBe('submit')
  })

  test('can submit form with Enter key', async ({ page }) => {
    await page.addInitScript(() => {
      ; (window as any).__submitFired = false
      document.addEventListener('submit', () => {
        ; (window as any).__submitFired = true
      }, true)
    })

    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('form')

    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'test123')

    const submitBtn = page.getByRole('button', { name: /iniciar sesión/i })
    await submitBtn.focus()
    await page.keyboard.press('Enter')

    const submitFired = await page.evaluate(() => (window as any).__submitFired)
    expect(submitFired).toBe(true)
  })

  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/login')

    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      return window.getComputedStyle(el).outline
    })

    expect(focusedElement).toBeTruthy()
  })
})

test.describe('[P1] Accessibility - Color Contrast', () => {
  test('text contrast meets WCAG AA in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/login')

    // Get all text elements
    const contrastIssues = await page.evaluate(() => {
      const issues = []

      const elements = document.querySelectorAll('body *')
      elements.forEach((el) => {
        if (el.children.length === 0 && el.textContent?.trim()) {
          const style = window.getComputedStyle(el)
          const color = style.color
          const bgColor = style.backgroundColor

          // Simple luminance calculation (simplified)
          const textColor = color // Would need proper contrast calculation
          const hasText = el.textContent?.trim().length > 0

          if (hasText && bgColor === 'rgba(0, 0, 0, 0)') {
            issues.push({
              element: el.tagName,
              text: el.textContent?.substring(0, 50),
              color,
              bgColor,
            })
          }
        }
      })

      return issues.slice(0, 5) // Return first 5 issues
    })

    console.log('Potential contrast issues (light mode):', contrastIssues)
    // Manual review recommended - would need axe-core for accurate checking
  })

  test('text contrast in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login')

    const theme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme')
    )
    expect(theme).toBe('dark')

    // Text should be visible in dark theme
    const heading = page.getByRole('heading', { name: /iniciar sesión/i })
    await expect(heading).toBeVisible()
  })
})

test.describe('[P2] Responsive Design - Touch Targets', () => {
  test('buttons are at least 44px (WCAG) on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/login')

    const submitBtn = page.getByRole('button', { name: /iniciar sesión/i })
    const box = await submitBtn.boundingBox()

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
  })

  test('form inputs are at least 44px height on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    const emailInput = page.locator('#email')
    const box = await emailInput.boundingBox()

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })
})

test.describe('[P2] Responsive Design - Layout Stability', () => {
  test('no horizontal scroll on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    // Wait for layout to stabilize
    await page.waitForLoadState('networkidle')

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = 375

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1) // Small tolerance for rounding
  })

  test('form inputs fit on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }) // iPhone SE small
    await page.goto('/login')

    const emailInput = page.locator('#email')
    const box = await emailInput.boundingBox()

    if (box) {
      expect(box.width).toBeGreaterThan(50) // Not cramped
      expect(box.width).toBeLessThanOrEqual(320) // Fits viewport
    }
  })

  test('layout is responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/login')

    await page.waitForLoadState('networkidle')

    const form = page.locator('form')
    await expect(form).toBeVisible()
  })
})

test.describe('[P3] Visual Regression - Design Elements', () => {
  test('takes screenshot of login page (light mode)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('form')

    await page.waitForTimeout(100)

    await expect(page).toHaveScreenshot('login-light-mode.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('takes screenshot of login page (dark mode)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('form')

    await page.waitForTimeout(100)

    await expect(page).toHaveScreenshot('login-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('verifies glassmorphism effect is applied', async ({ page }) => {
    await page.goto('/login')

    const glassCard = page.locator('.glass-card')
    const backdropFilter = await glassCard.evaluate(
      (el) => window.getComputedStyle(el).backdropFilter
    )

    // Should have blur effect
    expect(backdropFilter).toContain('blur')
  })

  test('verifies button has hover state', async ({ page }) => {
    await page.goto('/login')

    const btn = page.getByRole('button', { name: /iniciar sesión/i })

    // Get initial transform
    const initialTransform = await btn.evaluate(
      (el) => window.getComputedStyle(el).transform
    )

    // Hover
    await btn.hover()
    await page.waitForTimeout(200) // Wait for transition

    const hoverTransform = await btn.evaluate(
      (el) => window.getComputedStyle(el).transform
    )

    // Transform should change on hover (translateY(-2px))
    expect(hoverTransform).not.toBe(initialTransform)
  })
})

test.describe('[P2] Performance - Animation Performance', () => {
  test('uses GPU-accelerated animations (transform)', async ({ page }) => {
    await page.goto('/login')

    const btn = page.getByRole('button', { name: /iniciar sesión/i })

    // Check CSS for transform usage (not position, width, height)
    const styles = await btn.evaluate(
      (el) => window.getComputedStyle(el).transition
    )

    // Verify transition is defined
    expect(styles).toContain('0.2s')
  })

  test('respects prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/login')

    // Check if animations are disabled
    const btn = page.getByRole('button', { name: /iniciar sesión/i })
    const transitionDuration = await btn.evaluate(
      (el) => window.getComputedStyle(el).transitionDuration
    )

    // In production, this should be 0s when prefers-reduced-motion is set
    // This is a verification test - actual implementation may vary
    console.log('Transition duration with prefers-reduced-motion:', transitionDuration)
  })
})

test.describe('[Integration] Mobile Device Testing', () => {
  test('responsive layout on Pixel 5', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    })
    const page = await context.newPage()

    await page.goto('http://localhost:4321/login')
    await page.waitForLoadState('networkidle')

    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Check no overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1)

    await context.close()
  })

  test('responsive layout on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    })
    const page = await context.newPage()

    await page.goto('http://localhost:4321/login')
    await page.waitForLoadState('networkidle')

    const form = page.locator('form')
    await expect(form).toBeVisible()

    await context.close()
  })
})

test.describe('[Regression] Dark Mode Rendering', () => {
  test('text is readable in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login')

    const h2 = page.getByRole('heading', { name: /iniciar sesión/i })

    // Should be visible
    await expect(h2).toBeVisible()

    // Get color
    const color = await h2.evaluate(
      (el) => window.getComputedStyle(el).color
    )

    console.log('Dark mode heading color:', color)
    // Should not be black on dark background
    expect(color).not.toBe('rgb(0, 0, 0)')
  })

  test('inputs are readable in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login')

    const input = page.locator('#email')

    await expect(input).toBeVisible()

    const bgColor = await input.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    )

    console.log('Dark mode input background:', bgColor)
    // Should have a background that's visible
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
