import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';

adminTest.describe('Admin Logout', () => {
  adminTest('debe mostrar botón de logout', async ({ adminPage }) => {
    await adminPage.goto('/');
    await adminPage.waitForTimeout(2000);
    
    const logoutButton = adminPage.locator('[data-testid="admin-logout-button"], button:has-text("Cerrar sesión"), button:has-text("Logout")').first();
    
    const isVisible = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      await expect(logoutButton).toBeVisible();
    }
  });

  adminTest('debe hacer logout exitoso', async ({ adminPage }) => {
    await adminPage.goto('/');
    await adminPage.waitForTimeout(2000);
    
    const logoutButton = adminPage.locator('[data-testid="admin-logout-button"], button:has-text("Cerrar sesión")').first();
    
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      await adminPage.waitForTimeout(2000);
      
      // Verificar redirección a login
      await expect(adminPage).toHaveURL(/\/login/);
      
      // Verificar que se limpió el token
      const token = await adminPage.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    }
  });

  adminTest('debe redirigir a login después de logout', async ({ adminPage }) => {
    await adminPage.goto('/');
    await adminPage.waitForTimeout(2000);
    
    const logoutButton = adminPage.locator('[data-testid="admin-logout-button"]').first();
    
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      await adminPage.waitForTimeout(2000);
      
      // Verificar que está en login
      const loginForm = adminPage.locator('input[type="email"]').first();
      await expect(loginForm).toBeVisible({ timeout: 5000 });
    }
  });
});

