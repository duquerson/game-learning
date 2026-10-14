import { test, expect } from '@playwright/test'

test.describe('preview anónima — flujo principal', () => {
  test('la portada muestra el mapa de 9 lecciones', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // 9 enlaces de lección en el CourseMap
    const lessonLinks = page.locator('a[href^="/leccion/"]')
    await expect(lessonLinks).toHaveCount(9)
  })

  test('navega a una lección y muestra el contenido', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/leccion/basico-variables"]').click()
    await expect(page).toHaveURL(/\/leccion\/basico-variables/)
    await expect(page.getByRole('heading', { level: 1, name: /Variables/ })).toBeVisible()
    // Explicación y quiz presentes
    await expect(page.getByRole('heading', { name: 'Explicación' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Comprueba tu comprensión/ })).toBeVisible()
  })

  test('el quiz permite responder y mostrar feedback', async ({ page }) => {
    await page.goto('/leccion/basico-variables')
    // Esperar a que el island de Vue hidrate
    await expect(page.getByText('Pregunta 1 de 5')).toBeVisible()
    // Seleccionar la primera opción
    await page.locator('label.option').first().click()
    // Botón comprobar habilitado
    const checkBtn = page.getByRole('button', { name: 'Comprobar respuesta' })
    await expect(checkBtn).toBeEnabled()
    await checkBtn.click()
    // Feedback visible (correcta o incorrecta)
    await expect(page.locator('.feedback')).toBeVisible()
    // Avanzar
    await page.getByRole('button', { name: /Siguiente pregunta/ }).click()
    await expect(page.getByText('Pregunta 2 de 5')).toBeVisible()
  })

  test('el progreso se guarda en session storage (efímero)', async ({ page }) => {
    await page.goto('/leccion/basico-variables')
    await expect(page.getByText('Pregunta 1 de 5')).toBeVisible()
    // Tras abrir la lección, markRead debe haber guardado progreso
    const stored = await page.evaluate(() => sessionStorage.getItem('game-learning:progress'))
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed.lessons['basico-variables'].read).toBe(true)
  })

  test('skip link funciona con teclado', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main-content/)
  })
})
