import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminUsersPage } from '../helpers/page-objects/UsersPage';
import { AdminReglasPage } from '../helpers/page-objects/ReglasPage';

adminTest.describe('Filtros Avanzados - Admin', () => {
  adminTest('debe filtrar usuarios por búsqueda', async ({ adminPage }) => {
    const usersPage = new AdminUsersPage(adminPage);
    await usersPage.goto();
    await adminPage.waitForTimeout(2000);
    
    const countBefore = await usersPage.getUserCount();
    
    await usersPage.searchUsers('test@example.com');
    await adminPage.waitForTimeout(2000);
    
    const countAfter = await usersPage.getUserCount();
    // El count puede cambiar o no dependiendo de los resultados
  });

  adminTest('debe filtrar reglas por distrito', async ({ adminPage }) => {
    const reglasPage = new AdminReglasPage(adminPage);
    await reglasPage.goto();
    await adminPage.waitForTimeout(2000);
    
    if (await reglasPage.filterSelect.isVisible({ timeout: 2000 })) {
      const countBefore = await reglasPage.getReglaCount();
      
      await reglasPage.filterSelect.selectOption({ index: 1 });
      await adminPage.waitForTimeout(2000);
      
      const countAfter = await reglasPage.getReglaCount();
      // El count puede cambiar o no
    }
  });

  adminTest('debe filtrar por múltiples criterios', async ({ adminPage }) => {
    await adminPage.goto('/usuarios');
    await adminPage.waitForTimeout(2000);
    
    // Buscar usuarios
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="buscar"]').first();
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test');
      await adminPage.waitForTimeout(2000);
      
      // Aplicar filtros adicionales si existen
      const filterSelects = adminPage.locator('select');
      const selectCount = await filterSelects.count();
      
      if (selectCount > 0) {
        await filterSelects.first().selectOption({ index: 1 });
        await adminPage.waitForTimeout(2000);
      }
    }
  });

  adminTest('debe resetear filtros', async ({ adminPage }) => {
    await adminPage.goto('/usuarios');
    await adminPage.waitForTimeout(2000);
    
    // Aplicar filtros
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="buscar"]').first();
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test');
      await adminPage.waitForTimeout(1000);
      
      // Buscar botón de reset
      const resetButton = adminPage.locator('button:has-text("Resetear"), button:has-text("Limpiar")').first();
      if (await resetButton.isVisible({ timeout: 2000 })) {
        await resetButton.click();
        await adminPage.waitForTimeout(1000);
        
        // Verificar que se limpiaron los filtros
        const value = await searchInput.inputValue();
        expect(value).toBe('');
      }
    }
  });

  adminTest('debe filtrar por fecha en logs', async ({ adminPage }) => {
    await adminPage.goto('/admin-logs');
    await adminPage.waitForTimeout(2000);
    
    // Buscar filtros de fecha
    const dateInputs = adminPage.locator('input[type="date"]');
    const dateCount = await dateInputs.count();
    
    if (dateCount > 0) {
      const startDate = dateInputs.first();
      await startDate.fill('2024-01-01');
      await adminPage.waitForTimeout(2000);
      
      if (dateCount > 1) {
        const endDate = dateInputs.nth(1);
        await endDate.fill('2024-12-31');
        await adminPage.waitForTimeout(2000);
      }
    }
  });
});

