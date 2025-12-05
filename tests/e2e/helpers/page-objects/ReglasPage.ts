import { Page, Locator } from '@playwright/test';
import { AdminSelectors } from '../selectors';

/**
 * Page Object Model para la página de Gestión de Reglas (Admin)
 */
export class AdminReglasPage {
  readonly page: Page;
  readonly reglasList: Locator;
  readonly reglaRows: Locator;
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly filterSelect: Locator;
  readonly searchInput: Locator;
  readonly statusBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.reglasList = page.locator(AdminSelectors.reglas.list).or(page.locator('table').first());
    this.reglaRows = page.locator(AdminSelectors.reglas.reglaRow).or(page.locator('tbody tr'));
    this.createButton = page.locator(AdminSelectors.reglas.createButton).or(
      page.locator('button:has-text("Nueva"), button:has-text("Crear")').first()
    );
    this.editButton = page.locator(AdminSelectors.reglas.editButton);
    this.deleteButton = page.locator(AdminSelectors.reglas.deleteButton);
    this.enableButton = page.locator(AdminSelectors.reglas.enableButton).or(
      page.locator('button:has-text("Activar")')
    );
    this.disableButton = page.locator(AdminSelectors.reglas.disableButton).or(
      page.locator('button:has-text("Desactivar")')
    );
    this.filterSelect = page.locator(AdminSelectors.reglas.filterSelect).or(
      page.locator('select').first()
    );
    this.searchInput = page.locator('input[type="search"], input[placeholder*="buscar"]').first();
    this.statusBadge = page.locator('.bg-green-100, .bg-red-100, [class*="activo"]');
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/reglas-logicas', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to reglas-logicas page');
      }
      throw error;
    }
  }

  async getReglaRow(reglaId: string): Promise<Locator> {
    return this.page.locator(`tr:has-text("${reglaId}")`).first();
  }

  async createRegla() {
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async editRegla(reglaId: string) {
    const reglaRow = await this.getReglaRow(reglaId);
    const editBtn = reglaRow.locator(AdminSelectors.reglas.editButton);
    await editBtn.click();
    await this.page.waitForTimeout(500);
  }

  async deleteRegla(reglaId: string) {
    const reglaRow = await this.getReglaRow(reglaId);
    const deleteBtn = reglaRow.locator(AdminSelectors.reglas.deleteButton);
    await deleteBtn.click();
    
    // Confirmar eliminación
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async enableRegla(reglaId: string) {
    const reglaRow = await this.getReglaRow(reglaId);
    // Buscar botón de activar o checkbox
    const enableBtn = reglaRow.locator('button:has-text("Activar"), input[type="checkbox"]').first();
    await enableBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async disableRegla(reglaId: string) {
    const reglaRow = await this.getReglaRow(reglaId);
    // Buscar botón de desactivar o checkbox
    const disableBtn = reglaRow.locator('button:has-text("Desactivar"), input[type="checkbox"]').first();
    await disableBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getReglaStatus(reglaId: string): Promise<'active' | 'inactive' | null> {
    const reglaRow = await this.getReglaRow(reglaId);
    const badge = reglaRow.locator('.bg-green-100, .bg-red-100').first();
    
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

  async filterByDistrito(distrito: string) {
    await this.filterSelect.selectOption({ label: new RegExp(distrito, 'i') });
    await this.page.waitForTimeout(1000);
  }

  async searchReglas(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async getReglaCount(): Promise<number> {
    return await this.reglaRows.count();
  }
}

