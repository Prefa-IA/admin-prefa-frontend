import fs from 'node:fs';
import path from 'node:path';
import { test as base, Page } from '@playwright/test';
import { AdminSelectors } from '../helpers/selectors';

/**
 * Datos de prueba para autenticación admin
 */
export const adminTestUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!',
  },
} as const;

const authDir = path.resolve(__dirname, '..', '.auth');
const adminStorageStatePath = path.resolve(authDir, 'admin.json');

const ensureAuthDir = () => {
  fs.mkdirSync(authDir, { recursive: true });
};

/**
 * Fixture que proporciona una página autenticada como admin
 */
export const test = base.extend<{
  adminPage: Page;
}>({
  storageState: async ({}, use) => {
    if (fs.existsSync(adminStorageStatePath)) {
      await use(adminStorageStatePath);
    } else {
      await use(undefined);
    }
  },
  adminPage: async ({ page }, use, testInfo) => {
    testInfo.setTimeout(60000);

    // Función auxiliar para realizar login admin con retry
    const performAdminLoginWithRetry = async (maxRetries = 5): Promise<void> => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        // Verificar que la página no esté cerrada antes de comenzar
        if (page.isClosed()) {
          throw new Error('Page was closed before admin login could start');
        }

        // Si no es el primer intento, esperar con backoff exponencial
        if (attempt > 0) {
          // Si el último error fue rate limit, esperar más tiempo pero no tanto
          const isRateLimit = lastError?.message?.includes('429') || lastError?.message?.includes('Rate limit');
          const baseDelay = isRateLimit ? 5000 : 500; // 5s para rate limit, 500ms para otros errores
          const backoffDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), isRateLimit ? 30000 : 5000); // Máximo 30s para rate limit, 5s para otros
          
          // Verificar que la página no esté cerrada antes de esperar
          if (page.isClosed()) {
            throw new Error('Page was closed before backoff delay');
          }
          
          // Esperar en pequeños incrementos para poder detectar si la página se cierra
          const incrementMs = 500;
          let remainingDelay = backoffDelay;
          
          while (remainingDelay > 0 && !page.isClosed()) {
            const currentDelay = Math.min(incrementMs, remainingDelay);
            try {
              await page.waitForTimeout(currentDelay);
            } catch (timeoutError: any) {
              // Si la página se cerró durante el timeout, simplemente continuar con el siguiente intento
              if (page.isClosed()) {
                // No lanzar error aquí, simplemente salir del loop y continuar con el siguiente intento
                break;
              }
              // Si es otro error, re-lanzarlo
              throw timeoutError;
            }
            remainingDelay -= currentDelay;
          }
          
          // Si la página se cerró durante el backoff, simplemente continuar con el siguiente intento
          if (page.isClosed()) {
            // No lanzar error, simplemente continuar con el siguiente intento
            continue;
          }
        }

        // Navegar a login admin primero
        try {
          await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (error: any) {
          if (page.isClosed()) {
            throw new Error('Page was closed during navigation to login page');
          }
          if (attempt === maxRetries - 1) {
            throw error;
          }
          lastError = error;
          continue;
        }
        
        // Verificar que la página no se cerró después de la navegación
        if (page.isClosed()) {
          if (attempt === maxRetries - 1) {
            throw new Error('Page was closed immediately after navigation');
          }
          lastError = new Error('Page was closed immediately after navigation');
          continue;
        }
        
        // Esperar a que el formulario esté listo
        try {
          await page.waitForSelector(AdminSelectors.auth.emailInput, { timeout: 10000 });
        } catch (error: any) {
          if (attempt === maxRetries - 1) {
            throw error;
          }
          lastError = error;
          continue;
        }

        // Limpiar localStorage después de que la página esté cargada
        try {
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
        } catch {
          // Ignorar errores de seguridad si localStorage no está disponible
        }

        // Llenar formulario de login
        await page.fill(AdminSelectors.auth.emailInput, adminTestUsers.admin.email);
        await page.fill(AdminSelectors.auth.passwordInput, adminTestUsers.admin.password);

        // Configurar listener para capturar respuestas del login
        interface LoginResponseData {
          status: number;
          url: string;
          body: any;
        }
        let loginResponseData: LoginResponseData | null = null;
        const responseListener = (response: any) => {
          const url = response.url();
          if (url.includes('/admin/auth/login') || url.includes('/admin/login')) {
            response.json().then((body: any) => {
              loginResponseData = {
                status: response.status(),
                url: url,
                body: body,
              };
            }).catch(() => {
              loginResponseData = {
                status: response.status(),
                url: url,
                body: null,
              };
            });
          }
        };
        page.on('response', responseListener);

        // Esperar respuesta del login ANTES de hacer click
        // Buscar cualquier URL que contenga '/admin/auth/login' o '/admin/login'
        const loginResponsePromise = page.waitForResponse(
          (response) => {
            const url = response.url();
            return url.includes('/admin/auth/login') || url.includes('/admin/login');
          },
          { timeout: 30000 }
        ).catch(() => null);

        // Hacer click en el botón de login
        const loginButton = page.locator(AdminSelectors.auth.loginButton)
          .or(page.locator('button[type="submit"]'))
          .or(page.getByRole('button', { name: /iniciar sesión|login/i }))
          .first();
        
        // Asegurarse de que el botón esté visible antes de hacer click
        try {
          await loginButton.waitFor({ state: 'visible', timeout: 5000 });
          await loginButton.click();
        } catch (error: any) {
          page.off('response', responseListener);
          if (attempt === maxRetries - 1) {
            throw error;
          }
          lastError = error;
          continue;
        }

        // Esperar respuesta del login
        const response = await loginResponsePromise;
        
        // Remover el listener después de obtener la respuesta
        page.off('response', responseListener);

        // Verificar la respuesta del login primero
        if (response) {
          const status = response.status();
          
          // Si es un error 429 (Too Many Requests), reintentar
          if (status === 429) {
            if (attempt < maxRetries - 1) {
              lastError = new Error(`Admin login failed: Rate limit exceeded (429). Retry attempt ${attempt + 1}/${maxRetries}`);
              continue;
            } else {
              throw new Error(`Admin login failed: Rate limit exceeded (429) after ${maxRetries} attempts. Consider reducing test parallelism or increasing rate limit.`);
            }
          }
          
          if (status !== 200 && status !== 201) {
            // Si la respuesta fue un error, obtener el mensaje
            let errorMessage = `Admin login API returned status ${status}`;
            try {
              const body = await response.json().catch(() => null);
              if (body && typeof body === 'object' && 'error' in body) {
                errorMessage = String(body.error);
              }
            } catch {
              // Ignorar errores al parsear JSON
            }
            
            // Solo reintentar si es un error transitorio (5xx) y no es el último intento
            if (status >= 500 && status < 600 && attempt < maxRetries - 1) {
              lastError = new Error(`Admin login failed: ${errorMessage}`);
              continue;
            }
            
            throw new Error(`Admin login failed: ${errorMessage}`);
          }
        }
        
        // Verificar también los datos capturados del listener
        if (!response && loginResponseData) {
          const responseData: LoginResponseData = loginResponseData;
          
          // Si es un error 429, reintentar
          if (responseData.status === 429) {
            if (attempt < maxRetries - 1) {
              lastError = new Error(`Admin login failed: Rate limit exceeded (429). Retry attempt ${attempt + 1}/${maxRetries}`);
              continue;
            } else {
              throw new Error(`Admin login failed: Rate limit exceeded (429) after ${maxRetries} attempts. Consider reducing test parallelism or increasing rate limit.`);
            }
          }
          
          if (responseData.status !== 200 && responseData.status !== 201) {
            // Si tenemos datos de respuesta pero no fue exitosa
            const errorMsg = (responseData.body && typeof responseData.body === 'object' && 'error' in responseData.body)
              ? String(responseData.body.error)
              : `Status ${responseData.status}`;
            
            // Solo reintentar si es un error transitorio (5xx) y no es el último intento
            if (responseData.status >= 500 && responseData.status < 600 && attempt < maxRetries - 1) {
              lastError = new Error(`Admin login failed: ${errorMsg}`);
              continue;
            }
            
            throw new Error(`Admin login failed: ${errorMsg}`);
          }
        }
        
        // Si llegamos aquí, el login fue exitoso
        return;
      }
      
      // Si llegamos aquí después de todos los intentos, lanzar el último error
      if (lastError) {
        throw lastError;
      }
      throw new Error('Admin login failed: Unknown error after retries');
    };

    // Si ya hay storageState, verificar si el usuario sigue logueado
    if (fs.existsSync(adminStorageStatePath)) {
      try {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        const hasAdminUser = await page.evaluate(() => {
          const stored = localStorage.getItem('adminUser');
          if (!stored) return false;
          try {
            const parsed = JSON.parse(stored);
            return Boolean(parsed && parsed.token && parsed.token.length > 0);
          } catch {
            return false;
          }
        });
        if (hasAdminUser) {
          await use(page);
          return;
        }
      } catch {
        // Si falla la verificación, continuar con login normal
      }
    }

    // Realizar login admin con retry
    await performAdminLoginWithRetry();

    // Esperar a que adminUser se guarde en localStorage
    let loginSuccess = false;
    const maxWaitTime = 20000; // 20 segundos máximo
    const startTime = Date.now();

    while (!loginSuccess && Date.now() - startTime < maxWaitTime) {
      // Verificar que la página no esté cerrada antes de continuar
      if (page.isClosed()) {
        throw new Error('Page was closed during admin login process');
      }

      try {
        // Verificar adminUser
        const adminUser = await page.evaluate(() => {
          const stored = localStorage.getItem('adminUser');
          if (!stored) return null;
          try {
            const parsed = JSON.parse(stored);
            return parsed && parsed.token && parsed.token.length > 0 ? stored : null;
          } catch {
            return null;
          }
        }).catch(() => null);
        
        if (adminUser) {
          loginSuccess = true;
          break;
        }

        // Verificar si navegó (indicador de login exitoso)
        const currentUrl = page.url();
        if (!currentUrl.includes('/login') && currentUrl !== 'about:blank') {
          // Si navegó fuera de login, probablemente el login fue exitoso
          // Verificar adminUser una vez más
          const adminUserAfterNav = await page.evaluate(() => {
            const stored = localStorage.getItem('adminUser');
            if (!stored) return null;
            try {
              const parsed = JSON.parse(stored);
              return parsed && parsed.token && parsed.token.length > 0 ? stored : null;
            } catch {
              return null;
            }
          }).catch(() => null);
          
          if (adminUserAfterNav) {
            loginSuccess = true;
            break;
          }
        }

        // Esperar un poco antes de verificar de nuevo
        if (!page.isClosed()) {
          await page.waitForTimeout(500);
        } else {
          throw new Error('Page was closed during admin login wait loop');
        }
      } catch (waitError: any) {
        // Si la página se cerró durante la espera, lanzar error
        if (page.isClosed() || waitError.message?.includes('closed')) {
          throw new Error('Page was closed during admin login verification loop');
        }
        // Si es otro error, continuar el loop
        await page.waitForTimeout(500).catch(() => {});
      }
    }

    // Si aún no hay éxito, verificar errores
    if (!loginSuccess) {
      if (page.isClosed()) {
        throw new Error('Page was closed during admin login process');
      }

      // Esperar un poco más para que aparezcan errores
      await page.waitForTimeout(2000).catch(() => {});

      // Buscar errores en toasts
      const toastError = page.locator('.Toastify__toast--error, [class*="toast-error"], [role="alert"]').first();
      const hasToastError = await toastError.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (hasToastError) {
        const errorText = await toastError.textContent().catch(() => 'Unknown error');
        throw new Error(`Admin login failed: ${errorText}`);
      }

      // Verificar mensajes de error en la página
      const pageError = await page.locator('[role="alert"], .error, [class*="error"]').first().textContent().catch(() => null);
      
      if (pageError) {
        throw new Error(`Admin login failed: ${pageError}`);
      }

      // Verificar adminUser una última vez
      const finalAdminUserCheck = await page.evaluate(() => localStorage.getItem('adminUser')).catch(() => null);
      if (!finalAdminUserCheck) {
        const url = page.url();
        const pageTitle = await page.title().catch(() => 'Unknown');
        
        throw new Error(
          `Admin login failed: No adminUser found after ${maxWaitTime}ms. ` +
          `Still on: ${url}, Page title: ${pageTitle}. ` +
          `Check credentials (${adminTestUsers.admin.email}) and API connection. ` +
          `Make sure the auth-ms service is running and the admin user exists in the database.`
        );
      }
    }

    // Verificar adminUser final antes de continuar
    const finalAdminUser = await page.evaluate(() => localStorage.getItem('adminUser')).catch(() => null);
    if (!finalAdminUser) {
      throw new Error('Admin login failed: adminUser not found after login process');
    }

    // Esperar navegación a / (el código navega después de guardar adminUser)
    try {
      await page.waitForURL(/\/$/, { timeout: 10000 });
    } catch {
      // Si no navegó automáticamente, verificar URL actual
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        // Verificar que tenemos adminUser antes de navegar manualmente
        const adminUser = await page.evaluate(() => localStorage.getItem('adminUser')).catch(() => null);
        if (adminUser) {
          // Intentar navegar manualmente
          await page.goto('/');
          await page.waitForURL(/\/$/, { timeout: 5000 });
        } else {
          throw new Error('Admin login failed: No adminUser found and could not navigate');
        }
      }
    }

    // Usar la página autenticada
    await use(page);

    // Cleanup: limpiar localStorage después del test
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch {
      // Ignorar errores de cleanup si la página ya está cerrada
    }
  },
});

export { expect } from '@playwright/test';

