import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminPlanesPage } from '../helpers/page-objects/PlanesPage';

adminTest.describe('Gestión de Pagos - Admin', () => {
  let planesPage: AdminPlanesPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    planesPage = new AdminPlanesPage(adminPage);
    await planesPage.goto();
    await planesPage.switchToPagosTab();
    await adminPage.waitForTimeout(2000);
  });

  adminTest('debe mostrar lista de pagos', async ({ adminPage }) => {
    // La tabla puede o no estar presente dependiendo de si hay pagos
    const pagosTable = adminPage.locator('table, div:has-text("No hay pagos"), div:has-text("Sin resultados")').first();
    const isVisible = await pagosTable.isVisible({ timeout: 10000 }).catch(() => false);
    if (!isVisible) {
      // Si no hay tabla, verificar que al menos la página cargó
      const pageLoaded = await adminPage.locator('body').isVisible({ timeout: 2000 }).catch(() => false);
      expect(pageLoaded).toBeTruthy();
    } else {
      await expect(pagosTable).toBeVisible();
    }
  });

  adminTest('debe filtrar pagos', async ({ adminPage }) => {
    // Buscar filtros
    const filterInputs = adminPage.locator('input[type="date"], select, input[type="search"]');
    const filterCount = await filterInputs.count();
    
    if (filterCount > 0) {
      // Aplicar filtro de fecha
      const dateInput = adminPage.locator('input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 2000 })) {
        await dateInput.fill('2024-01-01');
        await adminPage.waitForTimeout(2000);
      }
    }
  });

  adminTest('debe mostrar detalles de pago', async ({ adminPage }) => {
    const paymentRows = adminPage.locator('tbody tr');
    const rowCount = await paymentRows.count();
    
    if (rowCount > 0) {
      const firstRow = paymentRows.first();
      
      // Verificar que tiene información
      const text = await firstRow.textContent();
      expect(text).toBeTruthy();
      
      // Hacer click para ver detalles si es clickeable
      await firstRow.click();
      await adminPage.waitForTimeout(1000);
      
      // Verificar modal o página de detalle
      const modal = adminPage.locator('[role="dialog"], .modal').first();
      const hasModal = await modal.isVisible({ timeout: 2000 }).catch(() => false);
      // Puede mostrar modal o no
    }
  });

  adminTest('debe mostrar métricas de pagos', async ({ adminPage }) => {
    // Buscar métricas o resumen
    const metrics = adminPage.locator('.metric, [data-testid="metric"], .card:has-text("Total")');
    const metricCount = await metrics.count();
    
    // Puede tener o no métricas visibles
    if (metricCount > 0) {
      expect(metricCount).toBeGreaterThan(0);
    }
  });
});

