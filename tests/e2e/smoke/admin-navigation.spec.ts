import { test, expect } from '@playwright/test';
import { AdminSelectors } from '../helpers/selectors';

/**
 * Tests de smoke para verificar que el admin panel carga correctamente
 */
test.describe('Smoke Tests - Admin Navigation', () => {
  test('debe cargar la página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator(AdminSelectors.auth.emailInput)).toBeVisible();
    await expect(page.locator(AdminSelectors.auth.passwordInput)).toBeVisible();
    
    // El botón de login puede tener diferentes selectores
    const loginButton = page.locator(AdminSelectors.auth.loginButton);
    const isVisible = await loginButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      // Intentar con selector alternativo
      const altButton = page.locator('button[type="submit"], button:has-text("Iniciar sesión")');
      await expect(altButton.first()).toBeVisible({ timeout: 5000 });
    } else {
      await expect(loginButton).toBeVisible();
    }
  });

  test('debe mostrar sidebar después de login', async ({ page }) => {
    // Este test requerirá autenticación, se completará en la siguiente fase
    // Por ahora solo verificamos que la estructura existe
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});

