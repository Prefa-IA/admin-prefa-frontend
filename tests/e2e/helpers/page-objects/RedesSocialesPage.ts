import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Redes Sociales
 */
export class RedesSocialesPage {
  readonly page: Page;
  readonly redesList: Locator;
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly nombreInput: Locator;
  readonly urlInput: Locator;
  readonly logoSelect: Locator;
  readonly ordenInput: Locator;
  readonly activoCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.redesList = page.locator('table').first();
    // El botón de crear puede tener diferentes textos o estar oculto
    this.createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has(svg[class*="Plus"]), button:has(svg[class*="plus"]), button:has-text("Nueva red social")').first();
    this.editButton = page.locator('button[title*="Editar"], button:has(svg)').first();
    this.deleteButton = page.locator('button[title*="Eliminar"], button:has(svg)').last();
    this.nombreInput = page.locator('input[name="nombre"], input[placeholder*="nombre"]').first();
    this.urlInput = page.locator('input[name="url"], input[type="url"]').first();
    this.logoSelect = page.locator('select').first();
    this.ordenInput = page.locator('input[name="orden"], input[type="number"]').first();
    this.activoCheckbox = page.locator('input[name="activo"], input[type="checkbox"]').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/redes-sociales', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to redes-sociales page');
      }
      throw error;
    }
  }

  async createRedSocial() {
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async editRedSocial(index = 0) {
    // Buscar botones de editar dentro de las filas de la tabla, excluyendo botones del menú
    const table = this.page.locator('table').first();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount === 0 || index >= rowCount) {
      throw new Error(`Row not found at index ${index}`);
    }
    
    const row = rows.nth(index);
    const actionsCell = row.locator('td').last();
    
    // Buscar botón de editar, excluyendo botones con aria-label que contenga "Cerrar"
    let editButton = actionsCell.locator('button[title*="Editar"], button[title*="editar"]').first();
    let isVisible = await editButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!isVisible) {
      // Fallback: buscar botones con SVG que no tengan aria-label="Cerrar menú"
      const allButtons = actionsCell.locator('button:has(svg)');
      const buttonCount = await allButtons.count();
      for (let i = 0; i < buttonCount; i++) {
        const btn = allButtons.nth(i);
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
        if (!ariaLabel || !ariaLabel.toLowerCase().includes('cerrar')) {
          editButton = btn;
          isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) break;
        }
      }
    }
    
    if (!isVisible) {
      throw new Error(`Edit button not found at index ${index}`);
    }
    
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteRedSocial(index = 0) {
    // Buscar botones de eliminar dentro de las filas de la tabla, excluyendo botones del menú
    const table = this.page.locator('table').first();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount === 0 || index >= rowCount) {
      throw new Error(`Row not found at index ${index}`);
    }
    
    const row = rows.nth(index);
    const actionsCell = row.locator('td').last();
    
    // Buscar botón de eliminar, excluyendo botones con aria-label que contenga "Cerrar"
    let deleteButton = actionsCell.locator('button[title*="Eliminar"], button[title*="eliminar"]').first();
    let isVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!isVisible) {
      // Fallback: buscar botones con SVG que no tengan aria-label="Cerrar menú"
      // Para eliminar, generalmente es el último botón en la fila
      const allButtons = actionsCell.locator('button:has(svg)');
      const buttonCount = await allButtons.count();
      // Empezar desde el final hacia atrás
      for (let i = buttonCount - 1; i >= 0; i--) {
        const btn = allButtons.nth(i);
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
        if (!ariaLabel || !ariaLabel.toLowerCase().includes('cerrar')) {
          deleteButton = btn;
          isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) break;
        }
      }
    }
    
    if (!isVisible) {
      throw new Error(`Delete button not found at index ${index}`);
    }
    
    await deleteButton.click();
    
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async fillForm(nombre: string, url: string, logo: string, orden: number, activo: boolean) {
    // Esperar a que el modal esté completamente visible
    const modal = this.page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    await modal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Esperar un poco más para que los inputs se rendericen dentro del modal
    await this.page.waitForTimeout(500);
    
    // Buscar los inputs dentro del modal
    const modalNombreInput = modal.locator('input[name="nombre"], input[placeholder*="nombre"]').first();
    const modalUrlInput = modal.locator('input[name="url"], input[type="url"]').first();
    const modalLogoSelect = modal.locator('select').first();
    const modalOrdenInput = modal.locator('input[name="orden"], input[type="number"]').first();
    const modalActivoCheckbox = modal.locator('input[name="activo"], input[type="checkbox"]').first();
    
    // Verificar que los inputs existen antes de llenarlos
    const nombreVisible = await modalNombreInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (!nombreVisible) {
      // Intentar con los selectores originales como fallback
      const fallbackVisible = await this.nombreInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (!fallbackVisible) {
        throw new Error('Form inputs not found or not visible');
      }
      // Usar los selectores originales
      await this.nombreInput.fill(nombre);
      const urlVisible = await this.urlInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (urlVisible) {
        await this.urlInput.fill(url);
      }
      const logoVisible = await this.logoSelect.isVisible({ timeout: 2000 }).catch(() => false);
      if (logoVisible) {
        await this.logoSelect.selectOption({ label: new RegExp(logo, 'i') });
      }
      const ordenVisible = await this.ordenInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (ordenVisible) {
        await this.ordenInput.fill(orden.toString());
      }
      const checkboxVisible = await this.activoCheckbox.isVisible({ timeout: 2000 }).catch(() => false);
      if (checkboxVisible) {
        const isChecked = await this.activoCheckbox.isChecked();
        if (isChecked !== activo) {
          await this.activoCheckbox.click();
        }
      }
      return;
    }
    
    // Usar los inputs del modal
    await modalNombreInput.fill(nombre);
    
    const urlVisible = await modalUrlInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (urlVisible) {
      await modalUrlInput.fill(url);
    }
    
    const logoVisible = await modalLogoSelect.isVisible({ timeout: 2000 }).catch(() => false);
    if (logoVisible) {
      await modalLogoSelect.selectOption({ label: new RegExp(logo, 'i') });
    }
    
    const ordenVisible = await modalOrdenInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (ordenVisible) {
      await modalOrdenInput.fill(orden.toString());
    }
    
    const checkboxVisible = await modalActivoCheckbox.isVisible({ timeout: 2000 }).catch(() => false);
    if (checkboxVisible) {
      const isChecked = await modalActivoCheckbox.isChecked();
      if (isChecked !== activo) {
        await modalActivoCheckbox.click();
      }
    }
  }

  async getRedesCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }
}

