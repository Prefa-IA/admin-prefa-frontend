import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Button } from '../components/ui';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';
import SettingModal from '../components/modals/SettingModal';
import { Setting } from '../types/settings';

const CATEGORY = 'edificabilidad';

const ParametrosEdificabilidadPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Setting | undefined>();
  const [toDelete, setToDelete] = useState<Setting | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/settings', { params: { category: CATEGORY } });
    setSettings(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (data: Setting) => {
    if (data._id) {
      await axios.put(`/api/admin/settings/${data._id}`, data);
    } else {
      await axios.post('/api/admin/settings', data);
    }
    setShowModal(false);
    setEditing(undefined);
    fetchSettings();
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    await axios.delete(`/api/admin/settings/${toDelete._id}`);
    setToDelete(null);
    fetchSettings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando parámetros...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Parámetros de Edificabilidad"
        description="Gestiona los parámetros de edificabilidad del sistema"
        actions={
          <NewItemButton label="Nuevo parámetro" onClick={() => { setEditing(undefined); setShowModal(true); }} />
        }
      />

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
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-sm">{s.key}</TableCell>
                  <TableCell className="max-w-xs truncate">{JSON.stringify(s.value)}</TableCell>
                  <TableCell>{s.description}</TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <EditIconButton onClick={() => { setEditing(s); setShowModal(true); }} />
                      <DeleteIconButton onClick={() => setToDelete(s)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {showModal && (
        <SettingModal
          initial={editing}
          category={CATEGORY}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar parámetro"
          message={`¿Estás seguro de que deseas eliminar el parámetro "${toDelete.key}"?`}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default ParametrosEdificabilidadPage; 