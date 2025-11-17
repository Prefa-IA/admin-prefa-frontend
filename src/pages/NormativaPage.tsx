import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import NewTipologiaModal from '../components/modals/NewTipologiaModal';
import NewZonificacionModal from '../components/modals/NewZonificacionModal';
import NewItemButton from '../components/NewItemButton';
import {
  Card,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Tipologia, Zonificacion } from '../types/normativa';

const NormativaPage: React.FC = () => {
  const [tab, setTab] = useState<'tipologias' | 'zonificaciones'>('tipologias');
  const [tipos, setTipos] = useState<Tipologia[]>([]);
  const [zonis, setZonis] = useState<Zonificacion[]>([]);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showZoniModal, setShowZoniModal] = useState(false);

  const reload = useCallback(async () => {
    if (tab === 'tipologias') {
      const res = await axios.get('/api/admin/parametros/tipologias');
      setTipos(res.data);
    } else {
      const res = await axios.get('/api/admin/parametros/zonificaciones');
      setZonis(res.data);
    }
  }, [tab]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const tabs = [
    { id: 'tipologias' as const, label: 'Tipologías' },
    { id: 'zonificaciones' as const, label: 'Zonificaciones' },
  ];

  return (
    <div>
      <PageHeader title="Normativa" description="Gestiona tipologías y zonificaciones" />

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

      {tab === 'tipologias' && (
        <Card
          title="Tipologías"
          headerActions={
            <NewItemButton label="Nueva tipología" onClick={() => setShowTipModal(true)} />
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etiqueta</TableHead>
                <TableHead>Altura (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No hay tipologías registradas
                  </TableCell>
                </TableRow>
              ) : (
                tipos.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">{t.etiqueta}</TableCell>
                    <TableCell>
                      {t.alturaMin} – {t.alturaMax}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 'zonificaciones' && (
        <Card
          title="Zonificaciones"
          headerActions={
            <NewItemButton label="Nueva zonificación" onClick={() => setShowZoniModal(true)} />
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Altura Máx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zonis.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No hay zonificaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                zonis.map((z) => (
                  <TableRow key={z._id}>
                    <TableCell className="font-medium">{z.codigo}</TableCell>
                    <TableCell>{z.nombre}</TableCell>
                    <TableCell>{z.alturaMax}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {showTipModal && (
        <NewTipologiaModal
          onClose={() => setShowTipModal(false)}
          onSave={(payload: Record<string, unknown>) => {
            const handleSave = async () => {
              await axios.post('/api/admin/parametros/tipologias', payload);
              setShowTipModal(false);
              void reload();
            };
            void handleSave();
          }}
        />
      )}

      {showZoniModal && (
        <NewZonificacionModal
          onClose={() => setShowZoniModal(false)}
          onSave={(payload: Record<string, unknown>) => {
            const handleSave = async () => {
              await axios.post('/api/admin/parametros/zonificaciones', payload);
              setShowZoniModal(false);
              void reload();
            };
            void handleSave();
          }}
        />
      )}
    </div>
  );
};

export default NormativaPage;
