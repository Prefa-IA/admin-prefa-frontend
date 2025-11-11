import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, DocumentTextIcon, Cog6ToothIcon, Square3Stack3DIcon, CurrencyDollarIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { slugify } from '../utils/slugify';

interface LinkItem {
  to?: string;
  label: string;
  children?: LinkItem[];
}
interface Group {
  label: string;
  icon: React.ComponentType<any>;
  links: LinkItem[];
}

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
    links: [
      { to: '/informes', label: 'Consultas' },
    ],
  },
  {
    label: 'Normativa',
    icon: Square3Stack3DIcon,
    links: [
      { to: '/codigo-urbanistico', label: 'Código Urb.' },
      { label: 'Reglas', children: [
        { to: '/reglas', label: 'Administrar Reglas' },
        { to: '/reglas/ver-todas', label: 'Ver todas' },
      ] },
    ],
  },
  {
    label: 'Facturación',
    icon: CurrencyDollarIcon,
    links: [
      { to: '/facturacion', label: 'Facturación' },
    ],
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

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get<string[]>('/api/reglas/categorias');
        if (Array.isArray(data)) {
          const links = data.map((cat: string) => ({
            to: `/reglas/${slugify(cat)}`,
            label: cat,
          }));
          setDynGroups(prev => prev.map(g => {
            if (g.label !== 'Normativa') return g;
            return {
              ...g,
              links: g.links.map(link => {
                if (link.label !== 'Reglas' || !link.children) return link;
                const baseChildren = link.children!.filter(ch => ch.to === '/reglas' || ch.to === '/reglas/ver-todas');
                const merged = [...baseChildren, ...links].reduce<LinkItem[]>((arr,item)=>{
                  if (!arr.find(i=>i.to===item.to)) arr.push(item);
                  return arr;
                },[]);
                return { ...link, children: merged };
              })
            };
          }));
        }
      } catch {}
    };

    fetchCats();
    const handler = () => fetchCats();
    window.addEventListener('reglas-actualizadas', handler);
    return () => window.removeEventListener('reglas-actualizadas', handler);
  }, []);

  const groups = dynGroups;

  const toggle = (label: string) => setOpen(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="bg-[#1976d2] text-white w-64 h-screen fixed inset-y-0 left-0 flex flex-col z-40 overflow-y-auto">
      <div className="p-6 text-xl font-bold">PreFactibilidadYa</div>
      <nav className="flex-1 px-2 space-y-1">
        {groups.map(group => {
          const Icon = group.icon;
          const singleLink = group.links.length === 1 && !group.links[0].children;
          if (singleLink) {
            const link = group.links[0];
            return (
              <NavLink
                key={link.to}
                to={link.to!}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 ${isActive ? 'bg-blue-700' : ''}`
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
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none"
              >
                <Icon className="h-5 w-5 mr-3" /> {group.label}
                <ChevronRightIcon className={`h-4 w-4 ml-auto transition-transform ${open[group.label] ? 'rotate-90' : ''}`} />
              </button>
              {open[group.label] && (
                <div className="ml-8 space-y-1">
                  {group.links.map(link => (
                    <NavItem link={link} key={link.label} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

function NavItem({ link }: { link: LinkItem }) {
  const [openLocal, setOpenLocal] = React.useState(false);
  if (link.children) {
    return (
      <div>
        <button onClick={() => setOpenLocal(o=>!o)} className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none">
          {link.label}
          <ChevronRightIcon className={`h-4 w-4 ml-auto transition-transform ${openLocal ? 'rotate-90' : ''}`} />
        </button>
        {openLocal && (
          <div className="ml-6 space-y-1">
            {link.children.map(ch => (
              <NavLink key={ch.to||ch.label} to={ch.to!} className={({isActive})=>`block px-3 py-2 rounded-md text-sm hover:bg-blue-600 ${isActive?'bg-blue-700':''}`}>{ch.label}</NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <NavLink
      to={link.to!}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm hover:bg-blue-600 ${isActive ? 'bg-blue-700' : ''}`}
    >
      {link.label}
    </NavLink>
  );
} 