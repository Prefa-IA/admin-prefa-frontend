/**
 * Selectores centralizados para tests E2E del Admin Panel
 * 
 * IMPORTANTE: Para que estos selectores funcionen, los componentes deben tener
 * atributos data-testid correspondientes.
 */

export const AdminSelectors = {
  // Autenticación Admin
  auth: {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]:has-text("Iniciar sesión"), button:has-text("Iniciar sesión"), [data-testid="admin-login-button"]',
    logoutButton: '[data-testid="admin-logout-button"]',
  },

  // Sidebar y Navegación
  sidebar: {
    sidebar: '[data-testid="admin-sidebar"]',
    dashboardLink: '[data-testid="sidebar-dashboard"]',
    usuariosLink: '[data-testid="sidebar-usuarios"]',
    reglasLink: '[data-testid="sidebar-reglas"]',
    facturacionLink: '[data-testid="sidebar-facturacion"]',
  },

  // Dashboard
  dashboard: {
    container: '[data-testid="dashboard-container"]',
    metrics: '[data-testid="dashboard-metric"]',
  },

  // Usuarios
  usuarios: {
    list: '[data-testid="usuarios-list"]',
    userRow: '[data-testid="user-row"]',
    searchInput: '[data-testid="usuarios-search"]',
    enableButton: '[data-testid="enable-user-button"]',
    disableButton: '[data-testid="disable-user-button"]',
    editButton: '[data-testid="edit-user-button"]',
    deleteButton: '[data-testid="delete-user-button"]',
  },

  // Reglas
  reglas: {
    list: '[data-testid="reglas-list"]',
    reglaRow: '[data-testid="regla-row"]',
    createButton: '[data-testid="create-regla-button"]',
    editButton: '[data-testid="edit-regla-button"]',
    deleteButton: '[data-testid="delete-regla-button"]',
    enableButton: '[data-testid="enable-regla-button"]',
    disableButton: '[data-testid="disable-regla-button"]',
    filterSelect: '[data-testid="reglas-filter"]',
  },

  // Planes
  planes: {
    list: '[data-testid="planes-list"]',
    planCard: '[data-testid="plan-card"]',
    createButton: '[data-testid="create-plan-button"]',
    editButton: '[data-testid="edit-plan-button"]',
    enableButton: '[data-testid="enable-plan-button"]',
    disableButton: '[data-testid="disable-plan-button"]',
  },

  // Modales
  modals: {
    confirmModal: '[data-testid="confirm-modal"]',
    confirmButton: '[data-testid="confirm-button"]',
    cancelButton: '[data-testid="cancel-button"]',
  },
} as const;

