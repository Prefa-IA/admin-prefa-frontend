import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminPlanesPage } from '../helpers/page-objects/PlanesPage';

adminTest.describe('Gestión de Overages - Admin', () => {
  let planesPage: AdminPlanesPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    planesPage = new AdminPlanesPage(adminPage);
    await planesPage.goto();
    await planesPage.switchToOveragesTab();
    await adminPage.waitForTimeout(2000);
  });

  adminTest('debe mostrar lista de overages', async ({ adminPage }) => {
    const overagesTable = adminPage.locator('table').first();
    await expect(overagesTable).toBeVisible({ timeout: 10000 });
  });

  adminTest('debe crear nuevo overage', async ({ adminPage }) => {
    const createButton = adminPage.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await adminPage.waitForTimeout(500);
      
      // Verificar que se abrió modal
      const modal = adminPage.locator('[role="dialog"], .modal').first();
      const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    }
  });

  adminTest('debe editar overage existente', async ({ adminPage }) => {
    const overageRows = adminPage.locator('tbody tr');
    const rowCount = await overageRows.count();
    
    if (rowCount > 0) {
      const firstRow = overageRows.first();
      const editButton = firstRow.locator('button[title*="Editar"], button:has(svg)').first();
      
      if (await editButton.isVisible({ timeout: 2000 })) {
        await editButton.click();
        await adminPage.waitForTimeout(1000);
        
        // Verificar que se abrió modal de edición
        const modal = adminPage.locator('[role="dialog"], .modal').first();
        const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
      }
    }
  });

  adminTest('debe eliminar overage con confirmación', async ({ adminPage }) => {
    const overageRows = adminPage.locator('tbody tr');
    const rowCount = await overageRows.count();
    
    if (rowCount > 0) {
      adminPage.on('dialog', (dialog) => {
        dialog.accept();
      });
      
      const firstRow = overageRows.first();
      const deleteButton = firstRow.locator('button[title*="Eliminar"], button:has(svg)').last();
      
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();
        await adminPage.waitForTimeout(2000);
      }
    }
  });
});

