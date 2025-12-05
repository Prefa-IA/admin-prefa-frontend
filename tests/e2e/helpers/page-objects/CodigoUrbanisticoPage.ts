import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Código Urbanístico
 */
export class CodigoUrbanisticoPage {
  readonly page: Page;
  readonly articlesList: Locator;
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly searchInput: Locator;
  readonly articleRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.articlesList = page.locator('table').first();
    // El botón de crear puede tener diferentes textos o estar oculto
    this.createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has(svg[class*="Plus"]), button:has(svg[class*="plus"]), button:has-text("Nuevo artículo")').first();
    this.editButton = page.locator('button[title*="Editar"], button:has(svg)').first();
    this.deleteButton = page.locator('button[title*="Eliminar"], button:has(svg)').last();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="buscar"]').first();
    this.articleRows = page.locator('tbody tr');
  }

  async goto() {
    // Verificar que la página no esté cerrada antes de navegar
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/codigo-urbanistico', { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Esperar a que la página esté lista
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      // Si la página se cerró durante la navegación, lanzar error descriptivo
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to codigo-urbanistico page');
      }
      // Re-lanzar el error original si no es un problema de página cerrada
      throw error;
    }
  }

  async createArticle() {
    // Verificar que el botón existe antes de hacer click
    const isVisible = await this.createButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      throw new Error('Create button not found or not visible');
    }
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async editArticle(index = 0) {
    const editButtons = this.page.locator('button[title*="Editar"], button:has(svg)');
    await editButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async deleteArticle(index = 0) {
    const deleteButtons = this.page.locator('button[title*="Eliminar"], button:has(svg)');
    await deleteButtons.nth(index).click();
    
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async searchArticles(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async getArticleCount(): Promise<number> {
    return await this.articleRows.count();
  }
}

