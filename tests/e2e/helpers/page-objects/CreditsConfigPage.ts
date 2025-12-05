import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Configuración de Créditos
 */
export class CreditsConfigPage {
  readonly page: Page;
  readonly dailyLimitInput: Locator;
  readonly monthlyLimitInput: Locator;
  readonly basicCreditsInput: Locator;
  readonly completeCreditsInput: Locator;
  readonly compoundCreditsInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dailyLimitInput = page.locator('input[name*="daily"], input[name*="diario"], input[placeholder*="diario"]').first();
    this.monthlyLimitInput = page.locator('input[name*="monthly"], input[name*="mensual"], input[placeholder*="mensual"]').first();
    this.basicCreditsInput = page.locator('input[name*="basic"], input[name*="basica"], input[placeholder*="100"]').first();
    this.completeCreditsInput = page.locator('input[name*="complete"], input[name*="completa"], input[placeholder*="200"]').first();
    this.compoundCreditsInput = page.locator('input[name*="compound"], input[name*="compuesta"], input[placeholder*="300"]').first();
    this.saveButton = page.locator('button:has-text("Guardar"), button[type="submit"]').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/creditos', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to creditos page');
      }
      throw error;
    }
  }

  async fillDailyLimit(limit: number) {
    await this.dailyLimitInput.fill(limit.toString());
  }

  async fillMonthlyLimit(limit: number) {
    await this.monthlyLimitInput.fill(limit.toString());
  }

  async fillBasicCredits(credits: number) {
    await this.basicCreditsInput.fill(credits.toString());
  }

  async fillCompleteCredits(credits: number) {
    await this.completeCreditsInput.fill(credits.toString());
  }

  async fillCompoundCredits(credits: number) {
    await this.compoundCreditsInput.fill(credits.toString());
  }

  async save() {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }
}

