import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Newsletter
 */
export class NewsletterPage {
  readonly page: Page;
  readonly sendButton: Locator;
  readonly subjectInput: Locator;
  readonly contentEditor: Locator;
  readonly historyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sendButton = page.locator('button:has-text("Enviar"), button:has-text("Enviar newsletter")').first();
    this.subjectInput = page.locator('input[name="subject"], input[placeholder*="asunto"]').first();
    this.contentEditor = page.locator('textarea, [contenteditable="true"], .editor').first();
    this.historyLink = page.locator('a:has-text("Historial"), a[href*="newsletter-history"]').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/newsletter', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to newsletter page');
      }
      throw error;
    }
  }

  async gotoHistory() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/newsletter-history', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to newsletter-history page');
      }
      throw error;
    }
  }

  async fillSubject(subject: string) {
    await this.subjectInput.fill(subject);
  }

  async fillContent(content: string) {
    await this.contentEditor.fill(content);
  }

  async sendNewsletter() {
    await this.sendButton.click();
    await this.page.waitForTimeout(2000);
  }
}

