import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  HomeIcon,
  Square3Stack3DIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { slugify } from '../utils/slugify';

import ThemeButton from './ThemeButton';

const ACTIVE_LINK_CLASS = 'bg-blue-700';

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
    ],
  },
  {
    label: 'Consultas',
    icon: DocumentTextIcon,
    links: [{ to: '/informes', label: 'Consultas' }],
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
    links: [{ to: '/facturacion', label: 'Facturación' }],
  },
  {
    label: 'Configuración',
    icon: Cog6ToothIcon,
    links: [
      { to: '/plan-tags', label: 'Etiquetas de Planes' },
      { to: '/constantes-troneras', label: 'Constantes Troneras' },
      { to: '/creditos', label: 'Créditos' },
      { to: '/prompts', label: 'Prompts' },
      { to: '/email-templates', label: 'Email Templates' },
      { to: '/newsletter', label: 'Newsletters' },
      { to: '/newsletter-history', label: 'Historial Newsletters' },
      { to: '/calculo-pasos', label: 'Pasos de Cálculo' },
      { to: '/reglas-logicas', label: 'Reglas Lógicas' },
      { to: '/chatbot', label: 'Chatbot' },
      { to: ROUTE_LEGAL_CONTENT, label: 'Contenido Legal' },
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
          return canAccessRoute(child.to);
        });
        if (filteredChildren.length === 0) return null;
        return { ...link, children: filteredChildren };
      }
      if (!link.to) return link;
      if (link.to === ROUTE_LEGAL_CONTENT && !isSuperAdmin) return null;
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

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [dynGroups, setDynGroups] = useState<Group[]>(baseGroups);
  const { logout } = useAuth();
  const { canAccessRoute, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

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
    <aside className="bg-[#1976d2] text-white w-64 h-screen fixed inset-y-0 left-0 flex flex-col z-40 overflow-y-auto">
      <div className="p-6 flex items-center justify-center">
        <img src="/logo.png" alt="PreFactibilidadYa" className="w-auto" />
      </div>
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
      <div className="px-2 pb-4 border-t border-blue-600 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center flex-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none text-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Cerrar sesión
          </button>
          <ThemeButton />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

function NavItem({ link }: { link: LinkItem }) {
  const [openLocal, setOpenLocal] = React.useState(false);
  const { canAccessRoute } = usePermissions();

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
              .map((ch) => (
                <NavLink
                  key={ch.to || ch.label}
                  to={ch.to!}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm hover:bg-blue-600 ${isActive ? ACTIVE_LINK_CLASS : ''}`
                  }
                >
                  {ch.label}
                </NavLink>
              ))}
          </div>
        )}
      </div>
    );
  }
  if (link.to && !canAccessRoute(link.to)) {
    return null;
  }

  return (
    <NavLink
      to={link.to!}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm hover:bg-blue-600 ${isActive ? ACTIVE_LINK_CLASS : ''}`
      }
    >
      {link.label}
    </NavLink>
  );
}
