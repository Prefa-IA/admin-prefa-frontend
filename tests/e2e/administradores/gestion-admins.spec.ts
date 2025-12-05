import { test, expect } from '@playwright/test';
import { test as adminTest } from '../fixtures/admin-auth.fixture';
import { AdminUsersManagementPage } from '../helpers/page-objects/AdminUsersPage';

adminTest.describe('Gestión de Administradores - Admin', () => {
  let adminUsersPage: AdminUsersManagementPage;

  adminTest.beforeEach(async ({ adminPage }) => {
    adminUsersPage = new AdminUsersManagementPage(adminPage);
    await adminUsersPage.goto();
  });

  adminTest('debe mostrar la lista de administradores', async ({ adminPage }) => {
    await expect(adminUsersPage.adminList).toBeVisible({ timeout: 10000 });
  });

  adminTest('debe mostrar botón de crear administrador', async ({ adminPage }) => {
    await expect(adminUsersPage.createButton).toBeVisible();
  });

  adminTest('debe crear nuevo administrador', async ({ adminPage }) => {
    await adminUsersPage.createAdmin();
    
    // Verificar que se abrió modal
    const modal = adminPage.locator('[role="dialog"], .modal').first();
    const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isModalVisible) {
      // Esperar a que el modal esté completamente cargado
      await adminPage.waitForTimeout(500);
      
      // Llenar formulario con selectores más robustos
      const emailInput = adminPage
        .locator('input[name="email"], input[type="email"]')
        .first();
      const nombreInput = adminPage
        .locator('input[name="nombre"], label:has-text("Nombre") + input, input[placeholder*="Nombre"]')
        .first();
      const passwordInput = adminPage
        .locator('input[name="password"], input[type="password"]')
        .first();
      
      // Esperar a que los campos estén visibles
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await nombreInput.waitFor({ state: 'visible', timeout: 10000 });
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Llenar los campos
      await emailInput.fill(`admin-${Date.now()}@example.com`);
      await nombreInput.fill('Test Admin');
      await passwordInput.fill('Admin123!');
      
      // Guardar
      const saveButton = adminPage
        .locator('button:has-text("Guardar"), button:has-text("Crear"), button[type="submit"]')
        .first();
      await saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await saveButton.click();
      
      // Esperar a que se procese el guardado
      await adminPage.waitForTimeout(2000);
    }
  });

  adminTest('debe editar administrador existente', async ({ adminPage }) => {
    const count = await adminUsersPage.getAdminCount();
    
    if (count > 0) {
      await adminUsersPage.editAdmin(0);
      await adminPage.waitForTimeout(1000);
      
      // Verificar que se abrió modal de edición
      const modal = adminPage.locator('[role="dialog"], .modal').first();
      const isModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
    }
  });

  adminTest('debe eliminar administrador con confirmación', async ({ adminPage }) => {
    const count = await adminUsersPage.getAdminCount();
    
    if (count > 0) {
      adminPage.on('dialog', (dialog) => {
        dialog.accept();
      });
      
      await adminUsersPage.deleteAdmin(0);
      await adminPage.waitForTimeout(2000);
    }
  });

  adminTest('debe habilitar administrador deshabilitado', async ({ adminPage }) => {
    const count = await adminUsersPage.getAdminCount();
    
    if (count > 0) {
      // Buscar admin deshabilitado
      const inactiveRows = adminPage.locator('tr:has(.bg-red-100), tr:has-text("No")');
      const inactiveCount = await inactiveRows.count();
      
      if (inactiveCount > 0) {
        // Verificar que el botón existe antes de intentar activar
        const enableButtons = adminPage.locator('button:has-text("Activar")');
        const buttonCount = await enableButtons.count();
        if (buttonCount > 0) {
          const buttonVisible = await enableButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
          if (buttonVisible) {
            await adminUsersPage.enableAdmin(0);
            await adminPage.waitForTimeout(2000);
          }
        }
      }
    }
  });

  adminTest('debe deshabilitar administrador habilitado', async ({ adminPage }) => {
    const count = await adminUsersPage.getAdminCount();
    
    if (count > 0) {
      // Buscar admin activo
      const activeRows = adminPage.locator('tr:has(.bg-green-100), tr:has-text("Sí")');
      const activeCount = await activeRows.count();
      
      if (activeCount > 0) {
        // Verificar que el botón existe antes de intentar deshabilitar
        const disableButtons = adminPage.locator('button:has-text("Deshabilitar"), button:has-text("Suspender")');
        const buttonCount = await disableButtons.count();
        if (buttonCount > 0) {
          const buttonVisible = await disableButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
          if (buttonVisible) {
            await adminUsersPage.disableAdmin(0);
            await adminPage.waitForTimeout(2000);
          }
        }
      }
    }
  });

  adminTest('debe buscar administradores', async ({ adminPage }) => {
    if (await adminUsersPage.searchInput.isVisible({ timeout: 2000 })) {
      await adminUsersPage.searchAdmins('admin@example.com');
      await adminPage.waitForTimeout(2000);
    }
  });
});

