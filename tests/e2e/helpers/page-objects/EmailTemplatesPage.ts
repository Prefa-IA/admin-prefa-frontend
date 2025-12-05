import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Email Templates
 */
export class EmailTemplatesPage {
  readonly page: Page;
  readonly templateList: Locator;
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly activeCheckbox: Locator;
  readonly previewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.templateList = page.locator('table').first();
    // El botón de crear puede tener diferentes textos o estar oculto
    this.createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has(svg[class*="Plus"]), button:has(svg[class*="plus"]), button:has-text("Nuevo template")').first();
    this.editButton = page.locator('button[title*="Editar"], button:has(svg)').first();
    this.deleteButton = page.locator('button[title*="Eliminar"], button:has(svg)').last();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="buscar"]').first();
    this.filterSelect = page.locator('select').first();
    this.activeCheckbox = page.locator('input[type="checkbox"]').first();
    this.previewButton = page.locator('button:has-text("Vista previa"), button:has-text("Preview")').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/email-templates', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to email-templates page');
      }
      throw error;
    }
  }

  async createTemplate() {
    // Verificar que el botón existe antes de hacer click
    const isVisible = await this.createButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      throw new Error('Create button not found or not visible');
    }
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async editTemplate(index = 0) {
    // Buscar botones de editar dentro de las filas de la tabla, excluyendo botones del menú
    const table = this.page.locator('table').first();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount === 0 || index >= rowCount) {
      throw new Error(`Row not found at index ${index}`);
    }
    
    const row = rows.nth(index);
    
    // Hacer scroll a la fila para asegurar que sea visible
    await row.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    const actionsCell = row.locator('td').last();
    
    // Buscar botón de editar, excluyendo botones con aria-label que contenga "Cerrar"
    let editButton = actionsCell.locator('button[title*="Editar"], button[title*="editar"]').first();
    let isVisible = await editButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isVisible) {
      // Fallback: buscar todos los botones en la celda de acciones
      const allButtons = actionsCell.locator('button');
      const buttonCount = await allButtons.count();
      
      // Si hay botones, buscar el primero que no sea "Cerrar"
      if (buttonCount > 0) {
        for (let i = 0; i < buttonCount; i++) {
          const btn = allButtons.nth(i);
          const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
          const title = await btn.getAttribute('title').catch(() => '');
          
          // Excluir botones de cerrar menú
          if (ariaLabel && ariaLabel.toLowerCase().includes('cerrar')) {
            continue;
          }
          
          // Preferir botones con title que contenga "Editar" o "editar"
          if (title && title.toLowerCase().includes('editar')) {
            editButton = btn;
            isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) break;
          } else if (!editButton || (await editButton.count() === 0)) {
            // Si no hay botón seleccionado aún, usar este
            editButton = btn;
            isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
            // Si es visible, usarlo; si no, continuar buscando
            if (isVisible) break;
          }
        }
      }
      
      // Si aún no es visible pero existe en el DOM, intentar hacer click forzado
      if (!isVisible) {
        const buttonExists = await editButton.count() > 0;
        if (buttonExists) {
          try {
            await editButton.click({ force: true, timeout: 2000 });
            await this.page.waitForTimeout(500);
            return;
          } catch {
            // Continuar con el error
          }
        }
      }
    }
    
    if (!isVisible) {
      throw new Error(`Edit button not found at index ${index}. Row count: ${rowCount}, Button count in actions cell: ${await actionsCell.locator('button').count()}`);
    }
    
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteTemplate(index = 0) {
    // Buscar botones de eliminar dentro de las filas de la tabla, excluyendo botones del menú
    const table = this.page.locator('table').first();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount === 0 || index >= rowCount) {
      throw new Error(`Row not found at index ${index}`);
    }
    
    const row = rows.nth(index);
    
    // Hacer scroll a la fila para asegurar que sea visible
    await row.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    const actionsCell = row.locator('td').last();
    
    // Buscar botón de eliminar, excluyendo botones con aria-label que contenga "Cerrar"
    let deleteButton = actionsCell.locator('button[title*="Eliminar"], button[title*="eliminar"]').first();
    let isVisible = await deleteButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isVisible) {
      // Fallback: buscar todos los botones en la celda de acciones
      // Para eliminar, generalmente es el último botón en la fila
      const allButtons = actionsCell.locator('button');
      const buttonCount = await allButtons.count();
      
      // Empezar desde el final hacia atrás
      if (buttonCount > 0) {
        for (let i = buttonCount - 1; i >= 0; i--) {
          const btn = allButtons.nth(i);
          const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
          const title = await btn.getAttribute('title').catch(() => '');
          
          // Excluir botones de cerrar menú
          if (ariaLabel && ariaLabel.toLowerCase().includes('cerrar')) {
            continue;
          }
          
          // Preferir botones con title que contenga "Eliminar" o "eliminar"
          if (title && title.toLowerCase().includes('eliminar')) {
            deleteButton = btn;
            isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) break;
          } else if (!deleteButton || (await deleteButton.count() === 0)) {
            // Si no hay botón seleccionado aún, usar este (generalmente el último)
            deleteButton = btn;
            isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
            // Si es visible o si es el último botón, usarlo
            if (isVisible || i === buttonCount - 1) break;
          }
        }
      }
      
      // Si aún no es visible pero existe en el DOM, intentar hacer click forzado
      if (!isVisible) {
        const buttonExists = await deleteButton.count() > 0;
        if (buttonExists) {
          try {
            await deleteButton.click({ force: true, timeout: 2000 });
            await this.page.waitForTimeout(500);
            // Confirmar eliminación
            const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
            if (await confirmButton.isVisible({ timeout: 2000 })) {
              await confirmButton.click();
            }
            await this.page.waitForTimeout(1000);
            return;
          } catch {
            // Continuar con el error
          }
        }
      }
    }
    
    if (!isVisible) {
      throw new Error(`Delete button not found at index ${index}. Row count: ${rowCount}, Button count in actions cell: ${await actionsCell.locator('button').count()}`);
    }
    
    await deleteButton.click();
    
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async searchTemplates(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async filterByActive(active: boolean) {
    const checkboxes = this.page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 0) {
      const checkbox = checkboxes.first();
      const isChecked = await checkbox.isChecked();
      if (isChecked !== active) {
        await checkbox.click();
      }
    }
  }

  async getTemplateCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }
}

