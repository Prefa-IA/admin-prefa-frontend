import { Page, Locator } from '@playwright/test';
import { AdminSelectors } from '../selectors';

/**
 * Page Object Model para la página de Gestión de Planes (Admin)
 */
export class AdminPlanesPage {
  readonly page: Page;
  readonly planesList: Locator;
  readonly planCards: Locator;
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly tabs: Locator;
  readonly pagosTab: Locator;
  readonly planesTab: Locator;
  readonly overagesTab: Locator;
  readonly overageCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.planesList = page.locator(AdminSelectors.planes.list).or(page.locator('table').first());
    this.planCards = page.locator(AdminSelectors.planes.planCard);
    this.createButton = page.locator(AdminSelectors.planes.createButton).or(
      page.locator('button:has-text("Nuevo"), button:has-text("Crear")').first()
    );
    this.editButton = page.locator(AdminSelectors.planes.editButton);
    this.deleteButton = page.locator('button:has-text("Eliminar")');
    this.enableButton = page.locator(AdminSelectors.planes.enableButton).or(
      page.locator('button:has-text("Activar"), input[type="checkbox"]')
    );
    this.disableButton = page.locator(AdminSelectors.planes.disableButton).or(
      page.locator('button:has-text("Desactivar"), input[type="checkbox"]')
    );
    this.tabs = page.locator('[role="tablist"], .tabs').first();
    this.pagosTab = page.locator('[role="tab"]:has-text("Pagos"), button:has-text("Pagos")').first();
    this.planesTab = page.locator('[role="tab"]:has-text("Planes"), button:has-text("Planes")').first();
    this.overagesTab = page.locator('[role="tab"]:has-text("Overages"), button:has-text("Overages")').first();
    this.overageCards = page.locator('tbody tr, .overage-card');
  }

  async goto() {
    if (this.page.isClosed()) {
      throw new Error('Page was closed before navigation');
    }

    try {
      await this.page.goto('/facturacion', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } catch (error: any) {
      if (this.page.isClosed()) {
        throw new Error('Page was closed during navigation to facturacion page');
      }
      throw error;
    }
  }

  async switchToPlanesTab() {
    const isVisible = await this.planesTab.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      return;
    }
    await this.planesTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToPagosTab() {
    const isVisible = await this.pagosTab.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      return;
    }
    await this.pagosTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToOveragesTab() {
    const isVisible = await this.overagesTab.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      return;
    }
    await this.overagesTab.click();
    await this.page.waitForTimeout(500);
  }

  async getPlanRow(planName: string): Promise<Locator> {
    // Buscar la fila que contiene el nombre del plan en cualquier celda
    // El nombre del plan está en la primera columna (TableCell con className="font-medium")
    const row = this.page.locator(`tr:has-text("${planName}")`).first();
    
    // Verificar que la fila existe y es visible
    const isVisible = await row.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      // Intentar hacer scroll a la tabla primero
      const table = this.page.locator('table').first();
      await table.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      
      // Intentar nuevamente
      const retryVisible = await row.isVisible({ timeout: 3000 }).catch(() => false);
      if (!retryVisible) {
        throw new Error(`Plan row not found for plan: ${planName}`);
      }
    }
    
    return row;
  }

  async createPlan() {
    // Verificar que el botón existe antes de hacer click
    const isVisible = await this.createButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      throw new Error('Create button not found or not visible');
    }
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  async editPlan(planName: string) {
    const planRow = await this.getPlanRow(planName);
    
    // Buscar el botón de editar dentro de la fila, en la columna de acciones (última columna)
    const actionsCell = planRow.locator('td').last();
    
    // Buscar botón de editar, excluyendo botones con aria-label que contenga "Cerrar"
    let editButton = actionsCell.locator('button[title="Editar"], button[title*="Editar"]').first();
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
      // Intentar hacer scroll a la fila para que sea visible
      await planRow.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      
      // Intentar nuevamente
      isVisible = await editButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!isVisible) {
        // Si aún no es visible, intentar hacer click de todos modos (puede estar fuera del viewport pero existir)
        try {
          await editButton.click({ timeout: 2000 });
          await this.page.waitForTimeout(500);
          return;
        } catch (error) {
          throw new Error(`Edit button not found or not clickable for plan: ${planName}`);
        }
      }
    }
    
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  async deletePlan(planName: string) {
    const planRow = await this.getPlanRow(planName);
    
    // Buscar el botón de eliminar dentro de la fila, en la columna de acciones (última columna)
    const actionsCell = planRow.locator('td').last();
    
    // Buscar botón de eliminar, excluyendo botones con aria-label que contenga "Cerrar"
    let deleteButton = actionsCell.locator('button[title="Eliminar"], button[title*="Eliminar"]').first();
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
      // Intentar hacer scroll a la fila para que sea visible
      await planRow.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      
      // Intentar nuevamente
      isVisible = await deleteButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!isVisible) {
        // Si aún no es visible, intentar hacer click de todos modos (puede estar fuera del viewport pero existir)
        try {
          await deleteButton.click({ timeout: 2000 });
          await this.page.waitForTimeout(500);
        } catch (error) {
          throw new Error(`Delete button not found or not clickable for plan: ${planName}`);
        }
      }
    }
    
    await deleteButton.click();
    await this.page.waitForTimeout(500);
    
    // Confirmar eliminación
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async enablePlan(planName: string) {
    const planRow = await this.getPlanRow(planName);
    const enableBtn = planRow.locator('button:has-text("Activar"), input[type="checkbox"]').first();
    await enableBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async disablePlan(planName: string) {
    const planRow = await this.getPlanRow(planName);
    const disableBtn = planRow.locator('button:has-text("Desactivar"), input[type="checkbox"]').first();
    await disableBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getPlanCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }
}

