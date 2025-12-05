import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Consultas Fallidas
 */
export class FailedConsultationsPage {
  readonly page: Page;
  readonly consultationsList: Locator;
  readonly searchInput: Locator;
  readonly consultationRows: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    this.page = page;
    this.consultationsList = page.locator('table').first();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="buscar"]').first();
    this.consultationRows = page.locator('tbody tr');
    this.paginationNext = page.locator('button:has-text("Siguiente"), button[aria-label*="next"]').first();
    this.paginationPrev = page.locator('button:has-text("Anterior"), button[aria-label*="prev"]').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/consultas-fallidas', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to consultas-fallidas page');
      }
      throw error;
    }
  }

  async searchConsultations(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async getConsultationCount(): Promise<number> {
    return await this.consultationRows.count();
  }

  async goToNextPage() {
    if (await this.paginationNext.isEnabled()) {
      await this.paginationNext.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async goToPrevPage() {
    if (await this.paginationPrev.isEnabled()) {
      await this.paginationPrev.click();
      await this.page.waitForTimeout(1000);
    }
  }
}

