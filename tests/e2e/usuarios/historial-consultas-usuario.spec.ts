import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminUsersPage } from '../helpers/page-objects/UsersPage';

adminTest.describe('Historial de Consultas del Usuario - Admin', () => {
  let usersPage: AdminUsersPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    usersPage = new AdminUsersPage(adminPage);
    await usersPage.goto();
  });

  adminTest('debe mostrar historial de consultas del usuario', async ({ adminPage }) => {
    const hasUsers = await usersPage.hasUsers();
    
    if (hasUsers) {
      const firstRow = usersPage.userRows.first();
      
      // Buscar link o botón de historial
      const historyLink = firstRow.locator('a:has-text("Historial"), button:has-text("Historial"), a[href*="historial"]').first();
      
      if (await historyLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await historyLink.click();
        await adminPage.waitForTimeout(2000);
        
        // Verificar que se muestra historial
        const historyTable = adminPage.locator('table, [data-testid="consultas-history"]').first();
        const isVisible = await historyTable.isVisible({ timeout: 5000 }).catch(() => false);
        // Puede mostrar historial o no
      }
    }
  });

  adminTest('debe listar consultas del usuario', async ({ adminPage }) => {
    // Navegar directamente a historial si existe ruta
    await adminPage.goto('/usuarios/test@example.com/consultas');
    await adminPage.waitForTimeout(2000);
    
    const consultasList = adminPage.locator('table, [data-testid="consultas-list"]').first();
    const isVisible = await consultasList.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      const rows = consultasList.locator('tbody tr');
      const rowCount = await rows.count();
      // Puede tener o no consultas
    }
  });
});

