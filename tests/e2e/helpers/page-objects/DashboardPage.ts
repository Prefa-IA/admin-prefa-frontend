import { Page, Locator } from '@playwright/test';
import { AdminSelectors } from '../selectors';

/**
 * Page Object Model para el Dashboard del Admin Panel
 */
export class DashboardPage {
  readonly page: Page;
  readonly container: Locator;
  readonly metrics: Locator;
  readonly charts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator(AdminSelectors.dashboard.container).or(page.locator('main').first());
    this.metrics = page.locator(AdminSelectors.dashboard.metrics).or(
      page.locator('.metric, [class*="metric"]')
    );
    this.charts = page.locator('canvas, svg, .chart').first();
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to dashboard');
      }
      throw error;
    }
  }

  async getMetricsCount(): Promise<number> {
    return await this.metrics.count();
  }

  async hasCharts(): Promise<boolean> {
    return await this.charts.isVisible({ timeout: 5000 }).catch(() => false);
  }
}

