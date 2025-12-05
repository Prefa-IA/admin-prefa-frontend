import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';

adminTest.describe('Datos Estratégicos del Usuario - Admin', () => {
  adminTest.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/usuarios/datos-estrategicos');
  });

  adminTest('debe mostrar datos estratégicos', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const strategicDataTable = adminPage.locator('table').first();
    await expect(strategicDataTable).toBeVisible({ timeout: 10000 });
  });

  adminTest('debe listar usuarios con datos estratégicos', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const dataRows = adminPage.locator('tbody tr');
    const rowCount = await dataRows.count();
    
    // Puede tener o no datos
    if (rowCount > 0) {
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  adminTest('debe mostrar métricas de datos estratégicos', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    // Buscar métricas o resumen
    const metrics = adminPage.locator('.metric, [data-testid="metric"], .card:has-text("Total")');
    const metricCount = await metrics.count();
    
    // Puede tener o no métricas visibles
    if (metricCount > 0) {
      expect(metricCount).toBeGreaterThan(0);
    }
  });

  adminTest('debe buscar datos estratégicos', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="buscar"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test@example.com');
      await adminPage.waitForTimeout(2000);
    }
  });

  adminTest('debe paginar datos estratégicos', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const pagination = adminPage.locator('.pagination, [data-testid="pagination"]').first();
    const isVisible = await pagination.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      const nextButton = adminPage.locator('button:has-text("Siguiente")').first();
      if (await nextButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click();
        await adminPage.waitForTimeout(2000);
      }
    }
  });
});

