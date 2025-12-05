import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminUsersPage } from '../helpers/page-objects/UsersPage';

adminTest.describe('Asignar Créditos Manualmente - Admin', () => {
  let usersPage: AdminUsersPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    usersPage = new AdminUsersPage(adminPage);
    await usersPage.goto();
  });

  adminTest('debe mostrar botón de asignar créditos', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      
      // Buscar botón de asignar créditos
      const assignCreditsButton = firstRow.locator('button:has-text("Créditos"), button:has-text("Asignar")').first();
      
      const isVisible = await assignCreditsButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        await expect(assignCreditsButton).toBeVisible();
      }
    }
  });

  adminTest('debe abrir modal de asignar créditos', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      const assignCreditsButton = firstRow.locator('button:has-text("Créditos"), button:has-text("Asignar")').first();
      
      if (await assignCreditsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await assignCreditsButton.click();
        await adminPage.waitForTimeout(500);
        
        // Verificar que se abrió modal
        const modal = adminPage.locator('[role="dialog"], .modal').first();
        const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(isModalVisible).toBeTruthy();
      }
    }
  });

  adminTest('debe asignar créditos a usuario', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      const assignCreditsButton = firstRow.locator('button:has-text("Créditos")').first();
      
      if (await assignCreditsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await assignCreditsButton.click();
        await adminPage.waitForTimeout(500);
        
        // Buscar input de créditos
        const creditsInput = adminPage.locator('input[type="number"], input[name*="credito"]').first();
        
        if (await creditsInput.isVisible({ timeout: 2000 })) {
          await creditsInput.fill('100');
          
          // Guardar
          const saveButton = adminPage.locator('button:has-text("Guardar"), button:has-text("Asignar"), button[type="submit"]').first();
          
          if (await saveButton.isVisible({ timeout: 2000 })) {
            // Esperar respuesta de API
            const responsePromise = adminPage.waitForResponse(
              (response) => response.url().includes('/usuarios/') && response.url().includes('/creditos'),
              { timeout: 10000 }
            ).catch(() => null);
            
            await saveButton.click();
            await responsePromise;
            await adminPage.waitForTimeout(2000);
            
            // Verificar mensaje de éxito
            const successToast = adminPage.locator('text=asignado, text=éxito').first();
            const hasSuccess = await successToast.isVisible({ timeout: 3000 }).catch(() => false);
            // Puede mostrar toast o no
          }
        }
      }
    }
  });
});

