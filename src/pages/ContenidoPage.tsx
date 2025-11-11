import React, { useEffect, useState } from 'react';
import { Card, PageHeader, Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '../components/ui';
import NewItemButton from '../components/NewItemButton';
import NewCodigoModal from '../components/modals/NewCodigoModal';
import NewPrecioModal from '../components/modals/NewPrecioModal';
import axios from 'axios';
import { Codigo, Precio } from '../types/contenido';

const ContenidoPage: React.FC = () => {
  const [tab, setTab] = useState<'codigos' | 'precios'>('codigos');
  const [codigos, setCodigos] = useState<Codigo[]>([]);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [showPrecioModal, setShowPrecioModal] = useState(false);

  const reload = async () => {
    if (tab === 'codigos') {
      const res = await axios.get('/api/admin/content/codigos');
      setCodigos(res.data);
    } else {
      const res = await axios.get('/api/admin/content/precios');
      setPrecios(res.data);
    }
  };

  useEffect(() => {
    reload();
  }, [tab]);

  const tabs = [
    { id: 'codigos' as const, label: 'Códigos Urbanísticos' },
    { id: 'precios' as const, label: 'Precios m²' }
  ];

  return (
    <div>
      <PageHeader
        title="Contenido"
        description="Gestiona códigos urbanísticos y precios por m²"
      />

      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === t.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'codigos' && (
        <Card
          title="Códigos Urbanísticos"
          headerActions={
            <NewItemButton label="Nuevo código" onClick={() => setShowCodigoModal(true)} />
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codigos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay códigos registrados
                  </TableCell>
                </TableRow>
              ) : (
                codigos.map(c => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.codigo}</TableCell>
                    <TableCell>{c.descripcion}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 'precios' && (
        <Card
          title="Precios por m²"
          headerActions={
            <NewItemButton label="Nuevo precio" onClick={() => setShowPrecioModal(true)} />
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barrio</TableHead>
                <TableHead>Valor USD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {precios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay precios registrados
                  </TableCell>
                </TableRow>
              ) : (
                precios.map(p => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.barrio}</TableCell>
                    <TableCell>${p.valor}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {showCodigoModal && (
        <NewCodigoModal
          onClose={() => setShowCodigoModal(false)}
          onSave={async (payload: any) => {
            await axios.post('/api/admin/content/codigos', payload);
            setShowCodigoModal(false);
            reload();
          }}
        />
      )}

      {showPrecioModal && (
        <NewPrecioModal
          onClose={() => setShowPrecioModal(false)}
          onSave={async (payload: any) => {
            await axios.post('/api/admin/content/precios', payload);
            setShowPrecioModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default ContenidoPage; 