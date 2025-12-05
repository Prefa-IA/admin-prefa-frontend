import { useMemo } from 'react';

import { useAuth } from '../contexts/AuthContext';

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_EDIT: 'admins.edit',
  ADMINS_DELETE: 'admins.delete',
  PLANS_VIEW: 'plans.view',
  PLANS_EDIT: 'plans.edit',
  BILLING_VIEW: 'billing.view',
  BILLING_EDIT: 'billing.edit',
  REPORTS_VIEW: 'reports.view',
  NORMATIVA_VIEW: 'normativa.view',
  NORMATIVA_EDIT: 'normativa.edit',
  CONFIG_VIEW: 'config.view',
  CONFIG_EDIT: 'config.edit',
} as const;

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/': [PERMISSIONS.DASHBOARD_VIEW],
  '/usuarios': [PERMISSIONS.USERS_VIEW],
  '/admin-users': [PERMISSIONS.ADMINS_VIEW],
  '/informes': [PERMISSIONS.REPORTS_VIEW],
  '/facturacion': [PERMISSIONS.BILLING_VIEW],
  '/normativa': [PERMISSIONS.NORMATIVA_VIEW],
  '/codigo-urbanistico': [PERMISSIONS.NORMATIVA_VIEW],
  '/reglas': [PERMISSIONS.NORMATIVA_VIEW],
  '/reglas/ver-todas': [PERMISSIONS.NORMATIVA_VIEW],
  '/plan-tags': [PERMISSIONS.PLANS_VIEW],
  '/constantes-troneras': [PERMISSIONS.CONFIG_VIEW],
  '/creditos': [PERMISSIONS.CONFIG_VIEW],
  '/prompts': [PERMISSIONS.CONFIG_VIEW],
  '/email-templates': [PERMISSIONS.CONFIG_VIEW],
  '/newsletter': [PERMISSIONS.CONFIG_VIEW],
  '/newsletter-history': [PERMISSIONS.CONFIG_VIEW],
  '/calculo-pasos': [PERMISSIONS.CONFIG_VIEW],
  '/reglas-logicas': [PERMISSIONS.CONFIG_VIEW],
  '/legal-content': [PERMISSIONS.CONFIG_EDIT],
  '/chatbot': [PERMISSIONS.CONFIG_EDIT],
};

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      if (!user.permissions || !Array.isArray(user.permissions)) return false;
      return user.permissions.includes(permission);
    };
  }, [user]);

  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!user || !permissions || permissions.length === 0) return false;
      if (user.isSuperAdmin) return true;
      if (!user.permissions || !Array.isArray(user.permissions)) return false;
      return permissions.some((perm) => user.permissions?.includes(perm));
    };
  }, [user]);

  const canAccessRoute = useMemo(() => {
    return (route: string): boolean => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      if (!route || typeof route !== 'string') return false;

      const requiredPermissions: string[] | undefined = (() => {
        if (route.startsWith('/reglas/')) {
          const reglasKey = '/reglas';
          if (Object.prototype.hasOwnProperty.call(ROUTE_PERMISSIONS, reglasKey)) {
            const descriptor = Object.getOwnPropertyDescriptor(ROUTE_PERMISSIONS, reglasKey);
            return descriptor?.value;
          }
        } else {
          if (Object.prototype.hasOwnProperty.call(ROUTE_PERMISSIONS, route)) {
            const descriptor = Object.getOwnPropertyDescriptor(ROUTE_PERMISSIONS, route);
            return descriptor?.value;
          }
        }
        return undefined;
      })();

      if (!requiredPermissions || requiredPermissions.length === 0) return false;
      return hasAnyPermission(requiredPermissions);
    };
  }, [user, hasAnyPermission]);

  const userPermissions = useMemo(() => {
    return user?.permissions || [];
  }, [user]);

  const isSuperAdmin = useMemo(() => {
    return user?.isSuperAdmin === true;
  }, [user]);

  return {
    hasPermission,
    hasAnyPermission,
    canAccessRoute,
    userPermissions,
    isSuperAdmin,
  };
}
