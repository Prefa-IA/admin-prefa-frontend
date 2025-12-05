import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Chatbot
 */
export class ChatbotPage {
  readonly page: Page;
  readonly questionList: Locator;
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly activeFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.questionList = page.locator('table').first();
    // El botón de crear puede tener diferentes textos o estar oculto
    this.createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has(svg[class*="Plus"]), button:has(svg[class*="plus"]), button:has-text("Nueva pregunta")').first();
    this.editButton = page.locator('button[title*="Editar"], button:has(svg)').first();
    this.deleteButton = page.locator('button[title*="Eliminar"], button:has(svg)').last();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="buscar"]').first();
    this.categoryFilter = page.locator('select').first();
    this.activeFilter = page.locator('input[type="checkbox"]').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/chatbot', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to chatbot page');
      }
      throw error;
    }
  }

  async createQuestion() {
    // Verificar que el botón existe antes de hacer click
    const isVisible = await this.createButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      throw new Error('Create button not found or not visible');
    }
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async editQuestion(index = 0) {
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

  async deleteQuestion(index = 0) {
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

  async searchQuestions(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption({ label: new RegExp(category, 'i') });
    await this.page.waitForTimeout(1000);
  }

  async getQuestionCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }
}

