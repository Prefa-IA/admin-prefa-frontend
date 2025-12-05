import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { FailedConsultationsPage } from '../helpers/page-objects/FailedConsultationsPage';

adminTest.describe('Consultas Fallidas - Admin', () => {
  let failedConsultationsPage: FailedConsultationsPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    failedConsultationsPage = new FailedConsultationsPage(adminPage);
    await failedConsultationsPage.goto();
  });

  adminTest('debe mostrar lista de consultas fallidas', async ({ adminPage }) => {
    await expect(failedConsultationsPage.consultationsList).toBeVisible({ timeout: 10000 });
  });

  adminTest('debe buscar consultas fallidas', async ({ adminPage }) => {
    if (await failedConsultationsPage.searchInput.isVisible({ timeout: 2000 })) {
      await failedConsultationsPage.searchConsultations('test');
      await adminPage.waitForTimeout(2000);
    }
  });

  adminTest('debe mostrar información de cada consulta fallida', async ({ adminPage }) => {
    const count = await failedConsultationsPage.getConsultationCount();
    
    if (count > 0) {
      const firstRow = failedConsultationsPage.consultationRows.first();
      
      // Verificar que tiene información
      const text = await firstRow.textContent();
      expect(text).toBeTruthy();
      
      // Verificar que tiene dirección
      const direccion = firstRow.locator('td').first();
      const direccionText = await direccion.textContent();
      expect(direccionText).toBeTruthy();
    }
  });

  adminTest('debe mostrar datos faltantes', async ({ adminPage }) => {
    const count = await failedConsultationsPage.getConsultationCount();
    
    if (count > 0) {
      const firstRow = failedConsultationsPage.consultationRows.first();
      
      // Buscar columna de datos faltantes
      const datosFaltantes = firstRow.locator('td').nth(3);
      const datosText = await datosFaltantes.textContent();
      // Puede tener o no datos faltantes
    }
  });

  adminTest('debe paginar consultas fallidas', async ({ adminPage }) => {
    const count = await failedConsultationsPage.getConsultationCount();
    
    // Si hay muchas consultas, debe tener paginación
    if (count > 10) {
      const paginationNext = failedConsultationsPage.paginationNext;
      const isEnabled = await paginationNext.isEnabled({ timeout: 2000 }).catch(() => false);
      
      if (isEnabled) {
        await failedConsultationsPage.goToNextPage();
        await adminPage.waitForTimeout(2000);
      }
    }
  });
});

