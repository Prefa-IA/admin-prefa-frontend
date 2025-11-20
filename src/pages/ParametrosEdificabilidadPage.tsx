import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import SettingModal from '../components/modals/SettingModal';
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
import { Setting } from '../types/settings';

const CATEGORY = 'edificabilidad';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando parámetros...</p>
    </div>
  </div>
);

const SettingRow: React.FC<{
  setting: Setting;
  onEdit: (s: Setting) => void;
  onDelete: (s: Setting) => void;
}> = ({ setting, onEdit, onDelete }) => (
  <TableRow key={setting._id}>
    <TableCell className="font-mono text-sm">{setting.key}</TableCell>
    <TableCell className="max-w-xs truncate">{JSON.stringify(setting.value)}</TableCell>
    <TableCell>{setting.description}</TableCell>
    <TableCell align="right">
      <div className="flex items-center justify-end gap-1">
        <EditIconButton onClick={() => onEdit(setting)} />
        <DeleteIconButton onClick={() => onDelete(setting)} />
      </div>
    </TableCell>
  </TableRow>
);

const saveSetting = async (data: Setting): Promise<void> => {
  if (data._id) {
    await axios.put(`/api/admin/settings/${data._id}`, data);
  } else {
    await axios.post('/api/admin/settings', data);
  }
};

const useSettingsData = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/settings', { params: { category: CATEGORY } });
    setSettings(res.data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  return { settings, loading, refetch: fetchSettings };
};

const SettingsTable: React.FC<{
  settings: Setting[];
  onEdit: (s: Setting) => void;
  onDelete: (s: Setting) => void;
}> = ({ settings, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Clave</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay parámetros registrados
            </TableCell>
          </TableRow>
        ) : (
          settings.map((s) => (
            <SettingRow key={s._id} setting={s} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const ParametrosEdificabilidadPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Setting | undefined>();
  const [toDelete, setToDelete] = useState<Setting | null>(null);
  const { settings, loading, refetch } = useSettingsData();

  const handleSave = async (data: Setting) => {
    await saveSetting(data);
    setShowModal(false);
    setEditing(undefined);
    void refetch();
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    await axios.delete(`/api/admin/settings/${toDelete._id}`);
    setToDelete(null);
    void refetch();
  };

  const handleEdit = (setting: Setting) => {
    setEditing(setting);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditing(undefined);
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Parámetros de Edificabilidad"
        description="Gestiona los parámetros de edificabilidad del sistema"
        actions={<NewItemButton label="Nuevo parámetro" onClick={handleNew} />}
      />

      <SettingsTable settings={settings} onEdit={handleEdit} onDelete={setToDelete} />

      {showModal && editing && (
        <SettingModal
          initial={editing}
          category={CATEGORY}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            void handleSave(data);
          }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar parámetro"
          message={`¿Estás seguro de que deseas eliminar el parámetro "${toDelete.key}"?`}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            void handleDelete();
          }}
        />
      )}
    </div>
  );
};

export default ParametrosEdificabilidadPage;
