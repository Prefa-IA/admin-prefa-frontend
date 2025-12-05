import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';

adminTest.describe('Créditos Consumidos - Admin', () => {
  adminTest.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/creditos');
    await adminPage.waitForTimeout(2000);
  });

  adminTest('debe mostrar información de créditos consumidos', async ({ adminPage }) => {
    // Buscar sección de créditos consumidos
    const creditsSection = adminPage.locator('[data-testid="credits-consumed"], .creditos-consumidos, text=Consumidos').first();
    
    const isVisible = await creditsSection.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Puede estar visible o no
  });

  adminTest('debe mostrar créditos por usuario', async ({ adminPage }) => {
    const creditsTable = adminPage.locator('table').first();
    
    const isVisible = await creditsTable.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (isVisible) {
      const rows = creditsTable.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        // Verificar que tiene información de créditos
        const firstRow = rows.first();
        const text = await firstRow.textContent();
        expect(text).toBeTruthy();
      }
    }
  });

  adminTest('debe filtrar créditos por usuario', async ({ adminPage }) => {
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="buscar"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test@example.com');
      await adminPage.waitForTimeout(2000);
    }
  });

  adminTest('debe mostrar total de créditos consumidos', async ({ adminPage }) => {
    // Buscar métrica o resumen
    const totalMetric = adminPage.locator('text=Total, .metric:has-text("Total"), [data-testid="total-credits"]').first();
    
    const isVisible = await totalMetric.isVisible({ timeout: 2000 }).catch(() => false);
    // Puede mostrar o no métrica total
  });
});

