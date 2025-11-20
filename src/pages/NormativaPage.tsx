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

const TabButton: React.FC<{
  id: 'tipologias' | 'zonificaciones';
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ id, label, isActive, onClick }) => (
  <button
    key={id}
    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const TipologiasTable: React.FC<{ tipos: Tipologia[] }> = ({ tipos }) => (
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
          <TableCell colSpan={2} className="text-center py-8 text-gray-500 dark:text-gray-400">
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
);

const ZonificacionesTable: React.FC<{ zonis: Zonificacion[] }> = ({ zonis }) => (
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
          <TableCell colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">
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
);

const useNormativaData = (tab: 'tipologias' | 'zonificaciones') => {
  const [tipos, setTipos] = useState<Tipologia[]>([]);
  const [zonis, setZonis] = useState<Zonificacion[]>([]);

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

  return { tipos, zonis, reload };
};

const NormativaTabs: React.FC<{
  tab: 'tipologias' | 'zonificaciones';
  tipos: Tipologia[];
  zonis: Zonificacion[];
  onTabChange: (tab: 'tipologias' | 'zonificaciones') => void;
  onShowTipModal: () => void;
  onShowZoniModal: () => void;
}> = ({ tab, tipos, zonis, onTabChange, onShowTipModal, onShowZoniModal }) => {
  const tabs = [
    { id: 'tipologias' as const, label: 'Tipologías' },
    { id: 'zonificaciones' as const, label: 'Zonificaciones' },
  ];

  return (
    <>
      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <TabButton
            key={t.id}
            id={t.id}
            label={t.label}
            isActive={tab === t.id}
            onClick={() => onTabChange(t.id)}
          />
        ))}
      </div>

      {tab === 'tipologias' && (
        <Card
          title="Tipologías"
          headerActions={<NewItemButton label="Nueva tipología" onClick={onShowTipModal} />}
        >
          <TipologiasTable tipos={tipos} />
        </Card>
      )}

      {tab === 'zonificaciones' && (
        <Card
          title="Zonificaciones"
          headerActions={<NewItemButton label="Nueva zonificación" onClick={onShowZoniModal} />}
        >
          <ZonificacionesTable zonis={zonis} />
        </Card>
      )}
    </>
  );
};

const NormativaModals: React.FC<{
  showTipModal: boolean;
  showZoniModal: boolean;
  onCloseTipModal: () => void;
  onCloseZoniModal: () => void;
  onSaveTipologia: (payload: Record<string, unknown>) => void;
  onSaveZonificacion: (payload: Record<string, unknown>) => void;
}> = ({
  showTipModal,
  showZoniModal,
  onCloseTipModal,
  onCloseZoniModal,
  onSaveTipologia,
  onSaveZonificacion,
}) => (
  <>
    {showTipModal && (
      <NewTipologiaModal
        onClose={onCloseTipModal}
        onSave={(payload: Record<string, unknown>) => {
          onSaveTipologia(payload);
        }}
      />
    )}

    {showZoniModal && (
      <NewZonificacionModal
        onClose={onCloseZoniModal}
        onSave={(payload: Record<string, unknown>) => {
          onSaveZonificacion(payload);
        }}
      />
    )}
  </>
);

const NormativaPage: React.FC = () => {
  const [tab, setTab] = useState<'tipologias' | 'zonificaciones'>('tipologias');
  const [showTipModal, setShowTipModal] = useState(false);
  const [showZoniModal, setShowZoniModal] = useState(false);
  const { tipos, zonis, reload } = useNormativaData(tab);

  const handleSaveTipologiaWrapper = useCallback(
    async (payload: Record<string, unknown>): Promise<void> => {
      try {
        await axios.post('/api/admin/parametros/tipologias', payload);
        setShowTipModal(false);
        await reload();
      } catch (err) {
        console.error('Error guardando tipología:', err);
      }
    },
    [reload]
  );

  const handleSaveZonificacionWrapper = useCallback(
    async (payload: Record<string, unknown>): Promise<void> => {
      try {
        await axios.post('/api/admin/parametros/zonificaciones', payload);
        setShowZoniModal(false);
        await reload();
      } catch (err) {
        console.error('Error guardando zonificación:', err);
      }
    },
    [reload]
  );

  return (
    <div>
      <PageHeader title="Normativa" description="Gestiona tipologías y zonificaciones" />
      <NormativaTabs
        tab={tab}
        tipos={tipos}
        zonis={zonis}
        onTabChange={setTab}
        onShowTipModal={() => setShowTipModal(true)}
        onShowZoniModal={() => setShowZoniModal(true)}
      />
      <NormativaModals
        showTipModal={showTipModal}
        showZoniModal={showZoniModal}
        onCloseTipModal={() => setShowTipModal(false)}
        onCloseZoniModal={() => setShowZoniModal(false)}
        onSaveTipologia={(payload) => {
          void handleSaveTipologiaWrapper(payload);
        }}
        onSaveZonificacion={(payload) => {
          void handleSaveZonificacionWrapper(payload);
        }}
      />
    </div>
  );
};

export default NormativaPage;
