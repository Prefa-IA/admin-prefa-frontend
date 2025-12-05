import { test, expect } from '@playwright/test';
import { AdminLoginPage } from '../helpers/page-objects/AdminLoginPage';
import { adminTestUsers } from '../fixtures/admin-auth.fixture';

test.describe('Admin Login', () => {
  let adminLoginPage: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    adminLoginPage = new AdminLoginPage(page);
    await adminLoginPage.goto();
  });

  test('debe mostrar el formulario de login admin', async ({ page }) => {
    await expect(adminLoginPage.emailInput).toBeVisible();
    await expect(adminLoginPage.passwordInput).toBeVisible();
    await expect(adminLoginPage.submitButton).toBeVisible();
  });

  test('debe validar campos requeridos', async ({ page }) => {
    await adminLoginPage.submit();

    const emailRequired = await adminLoginPage.emailInput.getAttribute('required');
    const passwordRequired = await adminLoginPage.passwordInput.getAttribute('required');

    expect(emailRequired).not.toBeNull();
    expect(passwordRequired).not.toBeNull();
  });

  test('debe hacer login exitoso con credenciales admin válidas', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/auth/login') || response.url().includes('/admin/login'),
      { timeout: 10000 }
    ).catch(() => null);

    await adminLoginPage.login(adminTestUsers.admin.email, adminTestUsers.admin.password);

    await responsePromise;

    // Esperar redirección al dashboard
    await page.waitForURL(/\/$|\/dashboard/, { timeout: 10000 });

    // Verificar que está logueado (debe tener sidebar)
    const sidebar = page.locator('[data-testid="admin-sidebar"], .sidebar, nav').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await adminLoginPage.fillEmail('invalid@admin.com');
    await adminLoginPage.fillPassword('wrongpassword');
    await adminLoginPage.submit();

    await page.waitForTimeout(2000);

    // Verificar que no redirigió
    await expect(page).not.toHaveURL(/\/$|\/dashboard/);
  });
});

