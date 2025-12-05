import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  CalculatorIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  Square3Stack3DIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { slugify } from '../utils/slugify';

import ThemeButton from './ThemeButton';

const ACTIVE_LINK_CLASS = 'bg-blue-700';
const ROUTE_FACTURACION = '/facturacion';

interface LinkItem {
  to?: string;
  label: string;
  children?: LinkItem[];
}
interface Group {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  links: LinkItem[];
}

const REGLAS_PATH = '/reglas';
const ROUTE_LEGAL_CONTENT = '/legal-content';
const ROUTE_ADMIN_LOGS = '/admin-logs';

const baseGroups: Group[] = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    links: [{ to: '/', label: 'Dashboard' }],
  },
  {
    label: 'Usuarios',
    icon: UsersIcon,
    links: [
      { to: '/usuarios', label: 'Usuarios' },
      { to: '/admin-users', label: 'Administradores' },
      { to: '/usuarios/datos-estrategicos', label: 'Datos Estratégicos' },
    ],
  },
  {
    label: 'Consultas',
    icon: DocumentTextIcon,
    links: [
      { to: '/informes', label: 'Consultas' },
      { to: '/consultas-fallidas', label: 'Consultas Fallidas' },
      { to: '/creditos', label: 'Créditos' },
    ],
  },
  {
    label: 'Normativa',
    icon: Square3Stack3DIcon,
    links: [
      { to: '/codigo-urbanistico', label: 'Código Urb.' },
      {
        label: 'Reglas',
        children: [
          { to: '/reglas', label: 'Administrar Reglas' },
          { to: '/reglas/ver-todas', label: 'Ver todas' },
        ],
      },
    ],
  },
  {
    label: 'Facturación',
    icon: CurrencyDollarIcon,
    links: [
      { to: '/facturacion?tab=pagos', label: 'Pagos' },
      { to: '/facturacion?tab=planes', label: 'Planes' },
      { to: '/facturacion?tab=overages', label: 'Overages' },
      { to: '/plan-tags', label: 'Etiquetas de Planes' },
    ],
  },
  {
    label: 'Cálculos',
    icon: CalculatorIcon,
    links: [
      { to: '/constantes-troneras', label: 'Constantes Troneras' },
      { to: '/calculo-pasos', label: 'Pasos de Cálculo' },
      { to: '/reglas-logicas', label: 'Reglas Lógicas' },
    ],
  },
  {
    label: 'Comunicación',
    icon: EnvelopeIcon,
    links: [
      { to: '/email-templates', label: 'Email Templates' },
      { to: '/newsletter', label: 'Newsletters' },
      { to: '/newsletter-history', label: 'Historial Newsletters' },
      { to: '/chatbot', label: 'Chatbot' },
    ],
  },
  {
    label: 'Contenido',
    icon: DocumentTextIcon,
    links: [
      { to: '/prompts', label: 'Prompts' },
      { to: ROUTE_LEGAL_CONTENT, label: 'Contenido Legal' },
      { to: '/redes-sociales', label: 'Redes Sociales' },
    ],
  },
];

const mergeCategoryLinks = (categories: string[]): LinkItem[] =>
  categories.map((cat) => ({
    to: `${REGLAS_PATH}/${slugify(cat)}`,
    label: cat,
  }));

const updateGroupsWithCategories = (groups: Group[], categoryLinks: LinkItem[]): Group[] =>
  groups.map((g) => {
    if (g.label !== 'Normativa') return g;
    return {
      ...g,
      links: g.links.map((link) => {
        if (link.label !== 'Reglas' || !link.children) return link;
        const baseChildren = link.children.filter(
          (ch) => ch.to === REGLAS_PATH || ch.to === `${REGLAS_PATH}/ver-todas`
        );
        const merged = [...baseChildren, ...categoryLinks].reduce<LinkItem[]>((arr, item) => {
          if (!arr.find((i) => i.to === item.to)) arr.push(item);
          return arr;
        }, []);
        return { ...link, children: merged };
      }),
    };
  });

const filterLinksByPermission = (
  links: LinkItem[],
  canAccessRoute: (route: string) => boolean,
  isSuperAdmin: boolean
): LinkItem[] =>
  links
    .map((link) => {
      if (link.children) {
        const filteredChildren = link.children.filter((child) => {
          if (!child.to) return true;
          if (child.to === ROUTE_LEGAL_CONTENT && !isSuperAdmin) return false;
          if (child.to === ROUTE_ADMIN_LOGS && !isSuperAdmin) return false;
          return canAccessRoute(child.to);
        });
        if (filteredChildren.length === 0) return null;
        return { ...link, children: filteredChildren };
      }
      if (!link.to) return link;
      if (link.to === ROUTE_LEGAL_CONTENT && !isSuperAdmin) return null;
      if (link.to === ROUTE_ADMIN_LOGS && !isSuperAdmin) return null;
      return canAccessRoute(link.to) ? link : null;
    })
    .filter((link): link is LinkItem => link !== null);

const filterGroupsByPermission = (
  groups: Group[],
  canAccessRoute: (route: string) => boolean,
  isSuperAdmin: boolean
): Group[] =>
  groups
    .map((group) => {
      const filteredLinks = filterLinksByPermission(group.links, canAccessRoute, isSuperAdmin);
      if (filteredLinks.length === 0) return null;
      return { ...group, links: filteredLinks };
    })
    .filter((group): group is Group => group !== null);

const SingleLinkGroup: React.FC<{
  group: Group;
  canAccessRoute: (route: string) => boolean;
  isSuperAdmin: boolean;
}> = ({ group, canAccessRoute, isSuperAdmin }) => {
  const link = group.links[0];
  if (!link) return null;
  if (link.to === '/legal-content' && !isSuperAdmin) return null;
  if (link.to && !canAccessRoute(link.to)) return null;
  const Icon = group.icon;
  return (
    <NavLink
      key={link.to}
      to={link.to ?? '/'}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 ${isActive ? ACTIVE_LINK_CLASS : ''}`
      }
    >
      <Icon className="h-5 w-5 mr-3" /> {link.label}
    </NavLink>
  );
};

const MultiLinkGroup: React.FC<{
  group: Group;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ group, isOpen, onToggle }) => {
  const Icon = group.icon;
  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 w-full focus:outline-none"
      >
        <Icon className="h-5 w-5 mr-3" /> {group.label}
        <ChevronRightIcon
          className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="ml-8 space-y-1">
          {group.links.map((link) => (
            <NavItem link={link} key={link.label} />
          ))}
        </div>
      )}
    </div>
  );
};

const useCategories = (): [Group[], React.Dispatch<React.SetStateAction<Group[]>>] => {
  const [dynGroups, setDynGroups] = useState<Group[]>(baseGroups);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get<string[]>('/api/reglas/categorias');
        if (Array.isArray(data)) {
          const categoryLinks = mergeCategoryLinks(data);
          setDynGroups((prev) => updateGroupsWithCategories(prev, categoryLinks));
        }
      } catch {
        // Silently handle errors
      }
    };

    void fetchCats();
    const handler = () => {
      void fetchCats();
    };
    window.addEventListener('reglas-actualizadas', handler);
    return () => window.removeEventListener('reglas-actualizadas', handler);
  }, []);

  return [dynGroups, setDynGroups];
};

const NavigationGroups: React.FC<{
  groups: Group[];
  open: Record<string, boolean>;
  toggle: (label: string) => void;
  canAccessRoute: (route: string) => boolean;
  isSuperAdmin: boolean;
}> = ({ groups, open, toggle, canAccessRoute, isSuperAdmin }) => (
  <nav className="flex-1 px-2 space-y-1">
    {groups.map((group) => {
      const singleLink = group.links.length === 1 && !group.links[0]?.children;
      if (singleLink) {
        return (
          <SingleLinkGroup
            key={group.label}
            group={group}
            canAccessRoute={canAccessRoute}
            isSuperAdmin={isSuperAdmin}
          />
        );
      }
      return (
        <MultiLinkGroup
          key={group.label}
          group={group}
          isOpen={open[group.label] ?? false}
          onToggle={() => toggle(group.label)}
        />
      );
    })}
  </nav>
);

const SidebarFooter: React.FC<{
  isSuperAdmin: boolean;
  canAccessRoute: (route: string) => boolean;
  onLogout: () => void;
}> = ({ isSuperAdmin, canAccessRoute, onLogout }) => (
  <div className="px-2 pb-4 border-t border-blue-600 pt-4 space-y-2">
    {isSuperAdmin && canAccessRoute(ROUTE_ADMIN_LOGS) && (
      <NavLink
        to={ROUTE_ADMIN_LOGS}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 ${isActive ? ACTIVE_LINK_CLASS : ''}`
        }
      >
        <Cog6ToothIcon className="h-5 w-5 mr-3" />
        Logs de Admin
      </NavLink>
    )}
    <div className="flex items-center gap-2">
      <button
        onClick={onLogout}
        className="flex items-center flex-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none text-white"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
        Cerrar sesión
      </button>
      <ThemeButton />
    </div>
  </div>
);

const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [dynGroups] = useCategories();
  const { logout } = useAuth();
  const { canAccessRoute, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  const groups = React.useMemo(
    () => filterGroupsByPermission(dynGroups, canAccessRoute, isSuperAdmin),
    [dynGroups, canAccessRoute, isSuperAdmin]
  );

  const toggle = (label: string) =>
    setOpen((prev) => {
      const currentValue = Reflect.get(prev, label);
      return { ...prev, [label]: !currentValue };
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#1976d2] text-white w-64 h-screen fixed inset-y-0 left-0 flex flex-col z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Botón cerrar para móvil/tablet */}
      {onClose && (
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-blue-600">
          <div className="flex items-center justify-center flex-1">
            <img src="/logo.png" alt="PreFactibilidadYa" className="w-auto h-8" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Logo para desktop */}
      <div className={`p-6 flex items-center justify-center ${onClose ? 'hidden lg:flex' : ''}`}>
        <img src="/logo.png" alt="PreFactibilidadYa" className="w-auto" />
      </div>

      <NavigationGroups
        groups={groups}
        open={open}
        toggle={toggle}
        canAccessRoute={canAccessRoute}
        isSuperAdmin={isSuperAdmin}
      />
      <SidebarFooter
        isSuperAdmin={isSuperAdmin}
        canAccessRoute={canAccessRoute}
        onLogout={handleLogout}
      />
    </aside>
  );
};

export default Sidebar;

function NavItem({ link }: { link: LinkItem }) {
  const [openLocal, setOpenLocal] = React.useState(false);
  const { canAccessRoute } = usePermissions();
  const location = useLocation();

  const isFacturacionLinkActive = (linkTo: string, currentLocation: typeof location): boolean => {
    if (!linkTo.includes(ROUTE_FACTURACION)) return false;
    const currentSearch = new URLSearchParams(currentLocation.search);
    const linkSearch = new URLSearchParams(linkTo.split('?')[1] || '');
    const currentTab = currentSearch.get('tab');
    const linkTab = linkSearch.get('tab');
    if (linkTab) {
      return currentTab === linkTab && currentLocation.pathname === ROUTE_FACTURACION;
    }
    return false;
  };

  if (link.children) {
    return (
      <div>
        <button
          onClick={() => setOpenLocal((o) => !o)}
          className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none"
        >
          {link.label}
          <ChevronRightIcon
            className={`h-4 w-4 ml-auto transition-transform ${openLocal ? 'rotate-90' : ''}`}
          />
        </button>
        {openLocal && (
          <div className="ml-6 space-y-1">
            {link.children
              .filter((ch) => !ch.to || canAccessRoute(ch.to))
              .map((ch) => {
                const isFacturacion = ch.to?.includes(ROUTE_FACTURACION);
                const customIsActive = isFacturacion
                  ? isFacturacionLinkActive(ch.to!, location)
                  : null;
                return (
                  <NavLink
                    key={ch.to || ch.label}
                    to={ch.to!}
                    end={!isFacturacion}
                    className={({ isActive }) => {
                      const active = customIsActive !== null ? customIsActive : isActive;
                      return `block px-3 py-2 rounded-md text-sm hover:bg-blue-600 ${
                        active ? ACTIVE_LINK_CLASS : ''
                      }`;
                    }}
                  >
                    {ch.label}
                  </NavLink>
                );
              })}
          </div>
        )}
      </div>
    );
  }
  if (link.to && !canAccessRoute(link.to)) {
    return null;
  }

  const isFacturacion = link.to?.includes(ROUTE_FACTURACION);
  const customIsActive = isFacturacion ? isFacturacionLinkActive(link.to!, location) : null;

  return (
    <NavLink
      to={link.to!}
      end={!isFacturacion}
      className={({ isActive }) => {
        const active = customIsActive !== null ? customIsActive : isActive;
        return `block px-3 py-2 rounded-md text-sm hover:bg-blue-600 ${
          active ? ACTIVE_LINK_CLASS : ''
        }`;
      }}
    >
      {link.label}
    </NavLink>
  );
}
