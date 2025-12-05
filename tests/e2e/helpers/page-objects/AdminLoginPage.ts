import { Page, Locator } from '@playwright/test';
import { AdminSelectors } from '../selectors';

/**
 * Page Object Model para la página de Login del Admin Panel
 */
export class AdminLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator(AdminSelectors.auth.emailInput);
    this.passwordInput = page.locator(AdminSelectors.auth.passwordInput);
    this.submitButton = page.locator(AdminSelectors.auth.loginButton).or(
      page.locator('button[type="submit"]')
    );
    this.errorMessage = page.locator('[role="alert"], .error-message').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to login page');
      }
      throw error;
    }
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Verificar que redirigió al dashboard o que hay sidebar
      await this.page.waitForURL(/\/$|\/dashboard/, { timeout: 5000 });
      return true;
    } catch {
      // Verificar sidebar
      const sidebar = this.page.locator(AdminSelectors.sidebar.sidebar);
      return await sidebar.isVisible({ timeout: 2000 }).catch(() => false);
    }
  }
}

