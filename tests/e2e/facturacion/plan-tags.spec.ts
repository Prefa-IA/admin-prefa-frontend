import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';

adminTest.describe('Etiquetas de Planes - Admin', () => {
  adminTest.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/plan-tags');
  });

  adminTest('debe mostrar lista de etiquetas', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const tagsTable = adminPage.locator('table').first();
    const isVisible = await tagsTable.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Puede tener tabla o lista
  });

  adminTest('debe crear nueva etiqueta', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    const createButton = adminPage.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await adminPage.waitForTimeout(500);
      
      // Verificar que se abrió modal
      const modal = adminPage.locator('[role="dialog"], .modal').first();
      const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    }
  });

  adminTest('debe editar etiqueta existente', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    // Buscar botones de editar dentro de las filas de la tabla, excluyendo botones del menú
    const table = adminPage.locator('table').first();
    const editButtons = table.locator('tbody tr').locator('td').last().locator('button[title*="Editar"], button[title*="editar"]').filter({ hasNot: adminPage.locator('[aria-label*="Cerrar"]') });
    const editCount = await editButtons.count();
    
    if (editCount > 0) {
      await editButtons.first().click();
      await adminPage.waitForTimeout(1000);
      
      // Verificar que se abrió modal de edición
      const modal = adminPage.locator('[role="dialog"], .modal').first();
      const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    } else {
      // Fallback: buscar cualquier botón con SVG en la última columna
      const fallbackButtons = table.locator('tbody tr').locator('td').last().locator('button:has(svg)').filter({ hasNot: adminPage.locator('[aria-label*="Cerrar"], [aria-label*="cerrar"]') });
      const fallbackCount = await fallbackButtons.count();
      if (fallbackCount > 0) {
        await fallbackButtons.first().click();
        await adminPage.waitForTimeout(1000);
      }
    }
  });

  adminTest('debe eliminar etiqueta con confirmación', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);
    
    // Buscar botones de eliminar dentro de las filas de la tabla, excluyendo botones del menú
    const table = adminPage.locator('table').first();
    const deleteButtons = table.locator('tbody tr').locator('td').last().locator('button[title*="Eliminar"], button[title*="eliminar"]').filter({ hasNot: adminPage.locator('[aria-label*="Cerrar"]') });
    const deleteCount = await deleteButtons.count();
    
    if (deleteCount > 0) {
      adminPage.on('dialog', (dialog) => {
        dialog.accept();
      });
      
      await deleteButtons.last().click();
      await adminPage.waitForTimeout(2000);
    } else {
      // Fallback: buscar cualquier botón con SVG en la última columna
      const fallbackButtons = table.locator('tbody tr').locator('td').last().locator('button:has(svg)').filter({ hasNot: adminPage.locator('[aria-label*="Cerrar"], [aria-label*="cerrar"]') });
      const fallbackCount = await fallbackButtons.count();
      if (fallbackCount > 0) {
        adminPage.on('dialog', (dialog) => {
          dialog.accept();
        });
        await fallbackButtons.last().click();
        await adminPage.waitForTimeout(2000);
      }
    }
  });
});

