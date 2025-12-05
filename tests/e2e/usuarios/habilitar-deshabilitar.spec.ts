import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminUsersPage } from '../helpers/page-objects/UsersPage';

adminTest.describe('Habilitar/Deshabilitar Usuarios - Admin', () => {
  let usersPage: AdminUsersPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    usersPage = new AdminUsersPage(adminPage);
    await usersPage.goto();
  });

  adminTest('debe mostrar estado activo/inactivo de usuarios', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      const badge = firstRow.locator('.bg-green-100, .bg-red-100').first();
      
      if (await badge.isVisible({ timeout: 2000 })) {
        const text = await badge.textContent();
        expect(text).toBeTruthy();
        // Debe mostrar "Sí" o "No" o "Activo"/"Inactivo"
      }
    }
  });

  adminTest('debe habilitar usuario deshabilitado', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      // Buscar usuario deshabilitado
      const inactiveRows = adminPage.locator('tr:has(.bg-red-100), tr:has-text("No")');
      const inactiveCount = await inactiveRows.count();
      
      if (inactiveCount > 0) {
        const inactiveRow = inactiveRows.first();
        const statusBadge = inactiveRow.locator('.bg-red-100, .bg-green-100').first();
        const badgeVisible = await statusBadge.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (badgeVisible) {
          const statusBefore = await statusBadge.textContent();
          const activateButton = inactiveRow.locator('button:has-text("Activar")');
          
          if (await activateButton.isVisible({ timeout: 2000 })) {
            await activateButton.click();
            await adminPage.waitForTimeout(2000);
            
            // Verificar cambio de estado
            const statusAfter = await statusBadge.textContent();
            // Debería cambiar a activo
            if (statusAfter && statusBefore) {
              expect(statusAfter).not.toBe(statusBefore);
            }
          }
        }
      }
    }
  });

  adminTest('debe deshabilitar usuario habilitado', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      // Buscar usuario activo
      const activeRows = adminPage.locator('tr:has(.bg-green-100), tr:has-text("Sí")');
      const activeCount = await activeRows.count();
      
      if (activeCount > 0) {
        const activeRow = activeRows.first();
        const statusBefore = await activeRow.locator('.bg-red-100, .bg-green-100').first().textContent();
        
        const suspendButton = activeRow.locator('button:has-text("Suspender")');
        
        if (await suspendButton.isVisible({ timeout: 2000 })) {
          await suspendButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Verificar cambio de estado
          const statusAfter = await activeRow.locator('.bg-red-100, .bg-green-100').first().textContent();
          // Debería cambiar a inactivo
          expect(statusAfter).not.toBe(statusBefore);
        }
      }
    }
  });

  adminTest('debe actualizar estado visualmente al cambiar', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      const badgeBefore = firstRow.locator('.bg-green-100, .bg-red-100').first();
      
      if (await badgeBefore.isVisible({ timeout: 2000 })) {
        const textBefore = await badgeBefore.textContent();
        const isActiveBefore = textBefore?.includes('Sí') || textBefore?.includes('Activo');
        
        // Toggle estado
        const toggleButton = firstRow.locator('button:has-text("Activar"), button:has-text("Suspender")').first();
        
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

  adminTest('debe mantener estado después de recargar página', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      const badgeBefore = firstRow.locator('.bg-green-100, .bg-red-100').first();
      
      if (await badgeBefore.isVisible({ timeout: 2000 })) {
        const textBefore = await badgeBefore.textContent();
        
        // Cambiar estado
        const toggleButton = firstRow.locator('button:has-text("Activar"), button:has-text("Suspender")').first();
        
        if (await toggleButton.isVisible({ timeout: 2000 })) {
          await toggleButton.click();
          await adminPage.waitForTimeout(2000);
          
          // Recargar página
          await adminPage.reload();
          await adminPage.waitForTimeout(2000);
          
          // Verificar que el estado se mantiene
          const firstRowAfter = usersPage.userRows.first();
          const badgeAfter = firstRowAfter.locator('.bg-green-100, .bg-red-100').first();
          const textAfter = await badgeAfter.textContent();
          
          // El estado debería ser diferente al inicial
          expect(textAfter).not.toBe(textBefore);
        }
      }
    }
  });
});

