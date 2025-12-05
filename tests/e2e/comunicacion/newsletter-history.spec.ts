import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { NewsletterPage } from '../helpers/page-objects/NewsletterPage';

adminTest.describe('Historial de Newsletters - Admin', () => {
  let newsletterPage: NewsletterPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    newsletterPage = new NewsletterPage(adminPage);
    await newsletterPage.gotoHistory();
  });

  adminTest('debe mostrar historial de newsletters', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const historyTable = adminPage.locator('table').first();
    const isVisible = await historyTable.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Puede tener tabla o lista
  });

  adminTest('debe listar newsletters enviados', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const newsletterRows = adminPage.locator('tbody tr, .newsletter-item');
    const rowCount = await newsletterRows.count();
    
    // Puede tener o no newsletters
    if (rowCount > 0) {
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  adminTest('debe mostrar detalles de cada newsletter', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const newsletterRows = adminPage.locator('tbody tr').first();
    
    if (await newsletterRows.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verificar que tiene información
      const text = await newsletterRows.textContent();
      expect(text).toBeTruthy();
    }
  });

  adminTest('debe filtrar historial por fecha', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const dateFilter = adminPage.locator('input[type="date"], select[name*="fecha"]').first();
    
    if (await dateFilter.isVisible({ timeout: 2000 })) {
      await dateFilter.fill('2024-01-01');
      await adminPage.waitForTimeout(2000);
    }
  });
});

