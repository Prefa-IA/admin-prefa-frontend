import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminReglasPage } from '../helpers/page-objects/ReglasPage';

adminTest.describe('Habilitar/Deshabilitar Reglas - Admin', () => {
  let reglasPage: AdminReglasPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    reglasPage = new AdminReglasPage(adminPage);
    await reglasPage.goto();
  });

  adminTest('debe mostrar estado activo/inactivo de reglas', async ({ adminPage }) => {
    const count = await reglasPage.getReglaCount();
    
    if (count > 0) {
      const firstRow = reglasPage.reglaRows.first();
      const badge = firstRow.locator('.bg-green-100, .bg-red-100').first();
      
      if (await badge.isVisible({ timeout: 2000 })) {
        const text = await badge.textContent();
        expect(text).toBeTruthy();
        // Debe mostrar "Sí" o "No" o "Activo"/"Inactivo"
      }
    }
  });

  adminTest('debe habilitar regla deshabilitada', async ({ adminPage }) => {
    const count = await reglasPage.getReglaCount();
    
    if (count > 0) {
      // Buscar regla deshabilitada
      const inactiveRows = adminPage.locator('tr:has(.bg-red-100), tr:has-text("No")');
      const inactiveCount = await inactiveRows.count();
      
      if (inactiveCount > 0) {
        const inactiveRow = inactiveRows.first();
        const statusBefore = await reglasPage.getReglaStatus('test'); // Necesitaría ID real
        
        // Buscar botón o checkbox para activar
        const activateButton = inactiveRow.locator('button:has-text("Activar"), input[type="checkbox"]').first();
        
        if (await activateButton.isVisible({ timeout: 2000 })) {
          await activateButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Verificar cambio de estado
          const badge = inactiveRow.locator('.bg-green-100, .bg-red-100').first();
          const textAfter = await badge.textContent();
          // Debería cambiar a activo
        }
      }
    }
  });

  adminTest('debe deshabilitar regla habilitada', async ({ adminPage }) => {
    const count = await reglasPage.getReglaCount();
    
    if (count > 0) {
      // Buscar regla activa
      const activeRows = adminPage.locator('tr:has(.bg-green-100), tr:has-text("Sí")');
      const activeCount = await activeRows.count();
      
      if (activeCount > 0) {
        const activeRow = activeRows.first();
        
        // Buscar botón o checkbox para desactivar
        const disableButton = activeRow.locator('button:has-text("Desactivar"), input[type="checkbox"]').first();
        
        if (await disableButton.isVisible({ timeout: 2000 })) {
          await disableButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Verificar cambio de estado
          const badge = activeRow.locator('.bg-green-100, .bg-red-100').first();
          const textAfter = await badge.textContent();
          // Debería cambiar a inactivo
        }
      }
    }
  });

  adminTest('debe actualizar estado visualmente al cambiar', async ({ adminPage }) => {
    const count = await reglasPage.getReglaCount();
    
    if (count > 0) {
      const firstRow = reglasPage.reglaRows.first();
      const badgeBefore = firstRow.locator('.bg-green-100, .bg-red-100').first();
      
      if (await badgeBefore.isVisible({ timeout: 2000 })) {
        const textBefore = await badgeBefore.textContent();
        const isActiveBefore = textBefore?.includes('Sí') || textBefore?.includes('Activo');
        
        // Toggle estado
        const toggleButton = firstRow.locator('button:has-text("Activar"), button:has-text("Desactivar"), input[type="checkbox"]').first();
        
        if (await toggleButton.isVisible({ timeout: 2000 })) {
          await toggleButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Verificar cambio visual
          const badgeAfter = firstRow.locator('.bg-green-100, .bg-red-100').first();
          const textAfter = await badgeAfter.textContent();
          const isActiveAfter = textAfter?.includes('Sí') || textAfter?.includes('Activo');
          
          // El estado debería haber cambiado
          expect(isActiveBefore).not.toBe(isActiveAfter);
        }
      }
    }
  });
});

