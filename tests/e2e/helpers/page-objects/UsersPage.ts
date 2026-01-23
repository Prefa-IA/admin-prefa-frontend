import { Page, Locator } from '@playwright/test';
import { AdminSelectors } from '../selectors';

/**
 * Page Object Model para la página de Gestión de Usuarios (Admin)
 */
export class AdminUsersPage {
  readonly page: Page;
  readonly userList: Locator;
  readonly searchInput: Locator;
  readonly userRows: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly createButton: Locator;
  readonly statusBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userList = page.locator(AdminSelectors.usuarios.list).or(page.locator('table').first());
    // El input de búsqueda puede estar en FilterBar o directamente en la página
    this.searchInput = page.locator(AdminSelectors.usuarios.searchInput).or(
      page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="Buscar"], input[placeholder*="nombre o email"]').first()
    );
    this.userRows = page.locator(AdminSelectors.usuarios.userRow).or(page.locator('tbody tr'));
    this.enableButton = page.locator(AdminSelectors.usuarios.enableButton).or(
      page.locator('button:has-text("Activar")')
    );
    this.disableButton = page.locator(AdminSelectors.usuarios.disableButton).or(
      page.locator('button:has-text("Suspender"), button:has-text("Deshabilitar")')
    );
    this.editButton = page.locator(AdminSelectors.usuarios.editButton);
    this.deleteButton = page.locator(AdminSelectors.usuarios.deleteButton);
    // El botón de crear puede tener diferentes textos dependiendo del contexto
    this.createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has(svg[class*="Plus"]), button:has(svg[class*="plus"])').first();
    this.statusBadge = page.locator('.bg-green-100, .bg-red-100, [class*="status"]');
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/usuarios', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to usuarios page');
      }
      throw error;
    }
  }

  async searchUsers(query: string) {
    // Verificar que el input existe y está visible antes de usarlo
    const isVisible = await this.searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await this.searchInput.fill(query);
      await this.page.waitForTimeout(1000); // Esperar búsqueda
    } else {
      return;
    }
  }

  async getUserRow(email: string): Promise<Locator> {
    return this.page.locator(`tr:has-text("${email}")`).first();
  }

  async enableUser(email: string) {
    const userRow = await this.getUserRow(email);
    const activateButton = userRow.locator('button:has-text("Activar")');
    await activateButton.click();
    await this.page.waitForTimeout(1000);
  }

  async disableUser(email: string) {
    const userRow = await this.getUserRow(email);
    const suspendButton = userRow.locator('button:has-text("Suspender")');
    await suspendButton.click();
    await this.page.waitForTimeout(1000);
  }

  async editUser(email: string) {
    const userRow = await this.getUserRow(email);
    const editBtn = userRow.locator(AdminSelectors.usuarios.editButton);
    await editBtn.click();
  }

  async deleteUser(email: string) {
    const userRow = await this.getUserRow(email);
    const deleteBtn = userRow.locator(AdminSelectors.usuarios.deleteButton);
    await deleteBtn.click();
    
    // Confirmar eliminación
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async getUserStatus(email: string): Promise<'active' | 'inactive' | null> {
    const userRow = await this.getUserRow(email);
    const badge = userRow.locator('.bg-green-100, .bg-red-100').first();
    
    if (await badge.isVisible({ timeout: 2000 })) {
      const text = await badge.textContent();
      if (text?.includes('Sí') || text?.includes('Activo')) {
        return 'active';
      }
      if (text?.includes('No') || text?.includes('Inactivo')) {
        return 'inactive';
      }
    }
    return null;
  }

  async getUserCount(): Promise<number> {
    return await this.userRows.count();
  }

  async hasUsers(): Promise<boolean> {
    const count = await this.getUserCount();
    return count > 0;
  }
}

