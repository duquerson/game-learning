import { test, expect } from '@playwright/test'

async function answerCurrent(page: import('@playwright/test').Page, letter: string) {
  await page
    .locator('label.option')
    .filter({ has: page.locator('.option-letter', { hasText: letter }) })
    .click()
  await page.getByRole('button', { name: 'Comprobar respuesta' }).click()
  await page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ }).click()
}

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
    // El quiz se sirve por SSR: esperar a que la hidratación registre la lectura
    await page.waitForFunction(() => sessionStorage.getItem('game-learning:progress') !== null)
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

test.describe('preview anónima — cobertura ampliada', () => {
  test('quiz completo con 5/5 marca la lección como dominada', async ({ page }) => {
    await page.goto('/leccion/basico-variables')
    await expect(page.getByText('Pregunta 1 de 5')).toBeVisible()
    // Respuestas correctas de basico-variables: C, B, C, C, C
    for (const letter of ['C', 'B', 'C', 'C', 'C']) {
      await answerCurrent(page, letter)
    }
    await expect(page.getByRole('heading', { name: 'Resultado del quiz' })).toBeVisible()
    await expect(page.locator('.score')).toContainText('5/5 correctas.')
    await expect(page.locator('.score')).toContainText('¡Lección dominada!')
    await expect(page.locator('.mastered-badge')).toBeVisible()
    await page.getByRole('link', { name: 'Volver al mapa' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('a[href="/leccion/basico-variables"]')).toContainText('Dominado')
  })

  test('quiz con fallo ofrece reintento que vuelve a la pregunta 1', async ({ page }) => {
    await page.goto('/leccion/basico-variables')
    await expect(page.getByText('Pregunta 1 de 5')).toBeVisible()
    // Opción A es incorrecta en las 5 preguntas de esta lección
    for (let i = 0; i < 5; i++) {
      await answerCurrent(page, 'A')
    }
    await expect(page.locator('.score')).toContainText('0/5 correctas.')
    await expect(page.locator('.score')).toContainText('Necesitas 4/5')
    await page.getByRole('button', { name: 'Reintentar quiz' }).click()
    await expect(page.getByText('Pregunta 1 de 5')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled()
  })

  test('el tema oscuro se aplica y persiste tras recargar', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const stored = await page.evaluate(() => localStorage.getItem('theme'))
    expect(stored).toBe('dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('ruta inexistente muestra la página 404', async ({ page }) => {
    const response = await page.goto('/no-existe')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeVisible()
  })

  test('portada y lección sin scroll horizontal en móvil 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const overflowHome = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflowHome).toBeLessThanOrEqual(0)
    await page.goto('/leccion/basico-variables')
    await expect(page.getByRole('heading', { level: 1, name: /Variables/ })).toBeVisible()
    const overflowLesson = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflowLesson).toBeLessThanOrEqual(0)
  })

  test('el enlace siguiente lleva a la siguiente lección', async ({ page }) => {
    await page.goto('/leccion/basico-variables')
    await page.getByRole('link', { name: /Siguiente:/ }).click()
    await expect(page).toHaveURL(/\/leccion\/basico-condicionales/)
    await expect(page.getByRole('heading', { level: 1, name: /Condicionales/ })).toBeVisible()
  })
})
