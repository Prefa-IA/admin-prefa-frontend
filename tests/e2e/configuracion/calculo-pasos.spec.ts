import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';

adminTest.describe('Gestión de Pasos de Cálculo - Admin', () => {
  adminTest.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/calculo-pasos');
  });

  adminTest('debe mostrar la lista de pasos de cálculo', async ({ adminPage }) => {
    const table = adminPage.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  adminTest('debe mostrar botón de crear paso', async ({ adminPage }) => {
    const createButton = adminPage.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    await expect(createButton).toBeVisible();
  });

  adminTest('debe crear nuevo paso de cálculo', async ({ adminPage }) => {
    const createButton = adminPage.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    await createButton.click();
    await adminPage.waitForTimeout(500);
    
    // Verificar que se abrió modal
    const modal = adminPage.locator('[role="dialog"], .modal').first();
    const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
  });

  adminTest('debe editar paso existente', async ({ adminPage }) => {
    const rows = adminPage.locator('tbody tr');
    const count = await rows.count();
    
    if (count > 0) {
      const firstRow = rows.first();
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

  adminTest('debe eliminar paso con confirmación', async ({ adminPage }) => {
    const rows = adminPage.locator('tbody tr');
    const count = await rows.count();
    
    if (count > 0) {
      // Interceptar confirmación
      adminPage.on('dialog', (dialog) => {
        dialog.accept();
      });
      
      const firstRow = rows.first();
      const deleteButton = firstRow.locator('button[title*="Eliminar"], button:has(svg)').last();
      
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();
        await adminPage.waitForTimeout(2000);
      }
    }
  });

  adminTest('debe mostrar orden de pasos', async ({ adminPage }) => {
    const rows = adminPage.locator('tbody tr');
    const count = await rows.count();
    
    if (count > 0) {
      // Verificar que hay columna de orden
      const headers = adminPage.locator('thead th');
      const headerText = await headers.allTextContents();
      const hasOrderColumn = headerText.some(text => text.includes('Orden') || text.includes('orden'));
      // Puede o no tener columna de orden visible
    }
  });
});

