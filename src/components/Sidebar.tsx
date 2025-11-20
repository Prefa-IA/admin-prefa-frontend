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
      { to: '/prompts', label: 'Prompts' },
      { to: '/email-templates', label: 'Email Templates' },
      { to: '/newsletter', label: 'Newsletters' },
      { to: '/newsletter-history', label: 'Historial Newsletters' },
      { to: '/calculo-pasos', label: 'Pasos de Cálculo' },
      { to: '/reglas-logicas', label: 'Reglas Lógicas' },
    ],
  },
];

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [dynGroups, setDynGroups] = useState<Group[]>(baseGroups);
  const { logout } = useAuth();
  const { canAccessRoute } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get<string[]>('/api/reglas/categorias');
        if (Array.isArray(data)) {
          const links = data.map((cat: string) => ({
            to: `${REGLAS_PATH}/${slugify(cat)}`,
            label: cat,
          }));
          setDynGroups((prev) =>
            prev.map((g) => {
              if (g.label !== 'Normativa') return g;
              return {
                ...g,
                links: g.links.map((link) => {
                  if (link.label !== 'Reglas' || !link.children) return link;
                  const baseChildren = link.children.filter(
                    (ch) => ch.to === REGLAS_PATH || ch.to === `${REGLAS_PATH}/ver-todas`
                  );
                  const merged = [...baseChildren, ...links].reduce<LinkItem[]>((arr, item) => {
                    if (!arr.find((i) => i.to === item.to)) arr.push(item);
                    return arr;
                  }, []);
                  return { ...link, children: merged };
                }),
              };
            })
          );
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

  const filteredGroups = React.useMemo(() => {
    return dynGroups
      .map((group) => {
        const filteredLinks = group.links
          .map((link) => {
            if (link.children) {
              const filteredChildren = link.children.filter((child) => {
                if (!child.to) return true;
                return canAccessRoute(child.to);
              });
              if (filteredChildren.length === 0) return null;
              return { ...link, children: filteredChildren };
            }
            if (!link.to) return link;
            return canAccessRoute(link.to) ? link : null;
          })
          .filter((link): link is LinkItem => link !== null);

        if (filteredLinks.length === 0) return null;
        return { ...group, links: filteredLinks };
      })
      .filter((group): group is Group => group !== null);
  }, [dynGroups, canAccessRoute]);

  const groups = filteredGroups;

  const toggle = (label: string) =>
    setOpen((prev) => {
      const currentValue = Reflect.get(prev, label);
      return { ...prev, [label]: !currentValue };
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const BASE_LINK_CLASSES =
    'flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600';

  return (
    <aside className="bg-[#1976d2] text-white w-64 h-screen fixed inset-y-0 left-0 flex flex-col z-40 overflow-y-auto">
      <div className="p-6 flex items-center justify-center">
        <img src="/logo.png" alt="PreFactibilidadYa" className="w-auto" />
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {groups.map((group) => {
          const Icon = group.icon;
          const singleLink = group.links.length === 1 && !group.links[0]?.children;
          if (singleLink) {
            const link = group.links[0];
            if (!link) return null;
            if (link.to && !canAccessRoute(link.to)) return null;
            return (
              <NavLink
                key={link.to}
                to={link.to ?? '/'}
                className={({ isActive }) =>
                  `${BASE_LINK_CLASSES} ${isActive ? ACTIVE_LINK_CLASS : ''}`
                }
              >
                <Icon className="h-5 w-5 mr-3" /> {link.label}
              </NavLink>
            );
          }
          return (
            <div key={group.label} className="space-y-1">
              <button
                onClick={() => toggle(group.label)}
                className={`${BASE_LINK_CLASSES} w-full focus:outline-none`}
              >
                <Icon className="h-5 w-5 mr-3" /> {group.label}
                <ChevronRightIcon
                  className={`h-4 w-4 ml-auto transition-transform ${open[group.label] ? 'rotate-90' : ''}`}
                />
              </button>
              {open[group.label] && (
                <div className="ml-8 space-y-1">
                  {group.links.map((link) => (
                    <NavItem link={link} key={link.label} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="px-2 pb-4 border-t border-blue-600 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none text-white"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Cerrar sesión
        </button>
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
