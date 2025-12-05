import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Contenido Legal
 */
export class LegalContentPage {
  readonly page: Page;
  readonly termsTab: Locator;
  readonly privacyTab: Locator;
  readonly editor: Locator;
  readonly saveButton: Locator;
  readonly accessDeniedMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.termsTab = page.locator('[role="tab"]:has-text("Términos"), button:has-text("Términos")').first();
    this.privacyTab = page.locator('[role="tab"]:has-text("Privacidad"), button:has-text("Privacidad")').first();
    this.editor = page.locator('textarea, [contenteditable="true"], .editor').first();
    this.saveButton = page.locator('button:has-text("Guardar"), button[type="submit"]').first();
    this.accessDeniedMessage = page.locator('text=Solo los super administradores').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/legal-content', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to legal-content page');
      }
      throw error;
    }
  }

  async switchToTermsTab() {
    await this.termsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToPrivacyTab() {
    await this.privacyTab.click();
    await this.page.waitForTimeout(500);
  }

  async editContent(content: string) {
    if (await this.editor.isVisible({ timeout: 2000 })) {
      await this.editor.fill(content);
    }
  }

  async save() {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async hasAccessDenied(): Promise<boolean> {
    return await this.accessDeniedMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }
}

