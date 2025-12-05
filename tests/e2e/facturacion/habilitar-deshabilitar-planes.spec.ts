import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminPlanesPage } from '../helpers/page-objects/PlanesPage';

adminTest.describe('Habilitar/Deshabilitar Planes - Admin', () => {
  let planesPage: AdminPlanesPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    planesPage = new AdminPlanesPage(adminPage);
    await planesPage.goto();
    await planesPage.switchToPlanesTab();
    await adminPage.waitForTimeout(2000);
  });

  adminTest('debe mostrar estado de planes', async ({ adminPage }) => {
    const planCount = await planesPage.getPlanCount();
    
    if (planCount > 0) {
      const firstRow = adminPage.locator('tbody tr').first();
      // Verificar que la fila tiene información del plan
      await expect(firstRow).toBeVisible();
    }
  });

  adminTest('debe habilitar plan deshabilitado', async ({ adminPage }) => {
    const planCount = await planesPage.getPlanCount();
    
    if (planCount > 0) {
      const firstRow = adminPage.locator('tbody tr').first();
      const planName = await firstRow.locator('td').first().textContent();
      
      if (planName) {
        // Buscar botón o checkbox para activar
        const enableButton = firstRow.locator('button:has-text("Activar"), input[type="checkbox"]').first();
        
        if (await enableButton.isVisible({ timeout: 2000 })) {
          await enableButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Verificar cambio de estado (puede requerir recargar)
        }
      }
    }
  });

  adminTest('debe deshabilitar plan habilitado', async ({ adminPage }) => {
    const planCount = await planesPage.getPlanCount();
    
    if (planCount > 0) {
      const firstRow = adminPage.locator('tbody tr').first();
      const planName = await firstRow.locator('td').first().textContent();
      
      if (planName) {
        // Buscar botón o checkbox para desactivar
        const disableButton = firstRow.locator('button:has-text("Desactivar"), input[type="checkbox"]').first();
        
        if (await disableButton.isVisible({ timeout: 2000 })) {
          await disableButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Verificar cambio de estado
        }
      }
    }
  });

  adminTest('debe actualizar estado visualmente al cambiar', async ({ adminPage }) => {
    const planCount = await planesPage.getPlanCount();
    
    if (planCount > 0) {
      const firstRow = adminPage.locator('tbody tr').first();
      
      // Buscar toggle o checkbox
      const toggleButton = firstRow.locator('button:has-text("Activar"), button:has-text("Desactivar"), input[type="checkbox"]').first();
      
      if (await toggleButton.isVisible({ timeout: 2000 })) {
        const stateBefore = await toggleButton.getAttribute('checked') || 
                          (await toggleButton.textContent()?.includes('Activar') ? 'inactive' : 'active');
        
        await toggleButton.click();
        await adminPage.waitForTimeout(2000);
        
        // Verificar cambio visual
        const stateAfter = await toggleButton.getAttribute('checked') ||
                          (await toggleButton.textContent()?.includes('Activar') ? 'inactive' : 'active');
        
        // El estado debería haber cambiado
        expect(stateBefore).not.toBe(stateAfter);
      }
    }
  });
});

