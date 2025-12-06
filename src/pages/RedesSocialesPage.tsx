import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import NewItemButton from '../components/NewItemButton';
import {
  Button,
  Card,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';

interface RedSocial {
  _id?: string;
  nombre: string;
  logo: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'whatsapp';
  url: string;
  orden: number;
  activo: boolean;
}

const LOGO_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const emptyRedSocial: RedSocial = {
  nombre: '',
  logo: 'facebook',
  url: '',
  orden: 0,
  activo: true,
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando redes sociales...</p>
    </div>
  </div>
);

const getErrorMessage = (err: unknown): string => {
  const error = err as { response?: { data?: { error?: string } }; message?: string };
  return error.response?.data?.error || error.message || 'Error al cargar redes sociales';
};

const RedSocialRow: React.FC<{
  redSocial: RedSocial;
  onEdit: (r: RedSocial) => void;
  onDelete: (r: RedSocial) => void;
}> = ({ redSocial, onEdit, onDelete }) => {
  const logoLabel =
    LOGO_OPTIONS.find((opt) => opt.value === redSocial.logo)?.label || redSocial.logo;

  return (
    <TableRow key={redSocial._id}>
      <TableCell className="font-medium">{redSocial.nombre}</TableCell>
      <TableCell className="hidden md:table-cell">{logoLabel}</TableCell>
      <TableCell className="hidden lg:table-cell">
        <a
          href={redSocial.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          {redSocial.url}
        </a>
      </TableCell>
      <TableCell className="text-center hidden lg:table-cell">{redSocial.orden}</TableCell>
      <TableCell className="text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            redSocial.activo
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {redSocial.activo ? 'Activa' : 'Inactiva'}
        </span>
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => onEdit(redSocial)} />
          <DeleteIconButton onClick={() => onDelete(redSocial)} />
        </div>
      </TableCell>
    </TableRow>
  );
};

const saveRedSocial = async (redSocial: RedSocial): Promise<void> => {
  if (!redSocial.nombre || redSocial.nombre.trim() === '') {
    toast.error('El nombre es requerido');
    throw new Error('Nombre requerido');
  }
  if (!redSocial.url || redSocial.url.trim() === '') {
    toast.error('La URL es requerida');
    throw new Error('URL requerida');
  }
  try {
    if (redSocial._id) {
      await axios.put(`/api/admin/redes-sociales/${redSocial._id}`, redSocial);
      toast.success('Red social actualizada correctamente');
    } else {
      await axios.post('/api/admin/redes-sociales', redSocial);
      toast.success('Red social creada correctamente');
    }
  } catch (err: unknown) {
    const errorMessage =
      (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
        ?.error ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Error guardando red social';
    toast.error(errorMessage);
    throw err;
  }
};

const useRedesSocialesData = () => {
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRedes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<RedSocial[]>('/api/admin/redes-sociales');
      setRedes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Error al cargar redes sociales:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setRedes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRedes();
  }, []);

  return { redes, loading, error, refetch: fetchRedes };
};

const RedesSocialesTable: React.FC<{
  redes: RedSocial[];
  error: string | null;
  loading: boolean;
  onEdit: (r: RedSocial) => void;
  onDelete: (r: RedSocial) => void;
}> = ({ redes, error, loading, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead className="hidden md:table-cell">Logo</TableHead>
          <TableHead className="hidden lg:table-cell">URL</TableHead>
          <TableHead className="text-center hidden lg:table-cell">Orden</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {redes.length === 0 && !loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
              {error ? 'Error al cargar redes sociales' : 'No hay redes sociales registradas'}
            </TableCell>
          </TableRow>
        ) : (
          redes.map((r) => (
            <RedSocialRow key={r._id} redSocial={r} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const RedSocialModal: React.FC<{
  redSocial: RedSocial;
  onClose: () => void;
  onSave: (r: RedSocial) => void;
}> = ({ redSocial: init, onClose, onSave }) => {
  const [redSocial, setRedSocial] = useState<RedSocial>(init);

  const handleChange = (key: keyof RedSocial, value: string | number | boolean) => {
    setRedSocial((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      show={true}
      title={redSocial._id ? 'Editar Red Social' : 'Nueva Red Social'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onSave(redSocial)}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          value={redSocial.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Ej: Facebook Oficial"
        />
        <Select
          label="Logo"
          value={redSocial.logo}
          onChange={(e) => handleChange('logo', e.target.value as RedSocial['logo'])}
          options={LOGO_OPTIONS}
        />
        <Input
          label="URL"
          value={redSocial.url}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://..."
          type="url"
        />
        <Input
          label="Orden"
          value={redSocial.orden.toString()}
          onChange={(e) => handleChange('orden', Number.parseInt(e.target.value, 10) || 0)}
          type="number"
          min="0"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            checked={redSocial.activo}
            onChange={(e) => handleChange('activo', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="activo" className="text-sm text-gray-700 dark:text-gray-300">
            Activa
          </label>
        </div>
      </div>
    </Modal>
  );
};

const RedesSocialesPage: React.FC = () => {
  const [editing, setEditing] = useState<RedSocial | null>(null);
  const [confirmDel, setConfirmDel] = useState<RedSocial | null>(null);
  const { redes, loading, error, refetch } = useRedesSocialesData();

  const saveRed = async (redSocial: RedSocial) => {
    try {
      await saveRedSocial(redSocial);
      setEditing(null);
      void refetch();
    } catch {
      // Error ya manejado en saveRedSocial
    }
  };

  const deleteRed = async () => {
    if (!confirmDel?._id) return;
    try {
      await axios.delete(`/api/admin/redes-sociales/${confirmDel._id}`);
      toast.success('Red social eliminada correctamente');
      setConfirmDel(null);
      void refetch();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error eliminando red social';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Redes Sociales"
        description="Gestiona las redes sociales que aparecen en el footer de la aplicación"
        actions={
          <NewItemButton
            label="Nueva red social"
            onClick={() => setEditing({ ...emptyRedSocial })}
          />
        }
      />

      <RedesSocialesTable
        redes={redes}
        error={error}
        loading={loading}
        onEdit={setEditing}
        onDelete={setConfirmDel}
      />

      {editing && (
        <RedSocialModal
          redSocial={editing}
          onClose={() => setEditing(null)}
          onSave={(r) => {
            void saveRed(r);
          }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          open={true}
          title="Eliminar red social"
          message={`¿Estás seguro de que deseas eliminar la red social "${confirmDel.nombre}"?`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => {
            void deleteRed();
          }}
        />
      )}
    </div>
  );
};

export default RedesSocialesPage;
