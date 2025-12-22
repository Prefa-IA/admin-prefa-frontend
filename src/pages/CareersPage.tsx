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

interface Career {
  _id?: string;
  titulo: string;
  tipo: 'developer' | 'marketing' | 'design' | 'sales' | 'support' | 'other';
  descripcion?: string;
  url: string;
  orden: number;
  activo: boolean;
}

const TIPO_OPTIONS = [
  { value: 'developer', label: 'Developer' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Other' },
];

const emptyCareer: Career = {
  titulo: '',
  tipo: 'other',
  descripcion: '',
  url: '',
  orden: 0,
  activo: true,
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando postulaciones...</p>
    </div>
  </div>
);

const getErrorMessage = (err: unknown): string => {
  const error = err as { response?: { data?: { error?: string } }; message?: string };
  return error.response?.data?.error || error.message || 'Error al cargar postulaciones';
};

const CareerRow: React.FC<{
  career: Career;
  onEdit: (c: Career) => void;
  onDelete: (c: Career) => void;
}> = ({ career, onEdit, onDelete }) => {
  const tipoLabel = TIPO_OPTIONS.find((opt) => opt.value === career.tipo)?.label || career.tipo;

  return (
    <TableRow key={career._id}>
      <TableCell className="font-medium">{career.titulo}</TableCell>
      <TableCell className="hidden md:table-cell">{tipoLabel}</TableCell>
      <TableCell className="hidden lg:table-cell">
        {career.descripcion ? (
          <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {career.descripcion}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">-</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <a
          href={career.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          {career.url}
        </a>
      </TableCell>
      <TableCell className="text-center hidden lg:table-cell">{career.orden}</TableCell>
      <TableCell className="text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            career.activo
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {career.activo ? 'Activa' : 'Inactiva'}
        </span>
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => onEdit(career)} />
          <DeleteIconButton onClick={() => onDelete(career)} />
        </div>
      </TableCell>
    </TableRow>
  );
};

const saveCareer = async (career: Career): Promise<void> => {
  if (!career.titulo || career.titulo.trim() === '') {
    toast.error('El título es requerido');
    throw new Error('Título requerido');
  }
  if (!career.url || career.url.trim() === '') {
    toast.error('La URL es requerida');
    throw new Error('URL requerida');
  }
  if (!career.tipo || !TIPO_OPTIONS.find((opt) => opt.value === career.tipo)) {
    career.tipo = 'other';
  }
  try {
    if (career._id) {
      await axios.put(`/api/admin/careers/${career._id}`, career);
      toast.success('Postulación actualizada correctamente');
    } else {
      await axios.post('/api/admin/careers', career);
      toast.success('Postulación creada correctamente');
    }
  } catch (err: unknown) {
    const errorMessage =
      (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
        ?.error ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Error guardando postulación';
    toast.error(errorMessage);
    throw err;
  }
};

const useCareersData = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Career[]>('/api/admin/careers');
      setCareers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Error al cargar postulaciones:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setCareers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCareers();
  }, []);

  return { careers, loading, error, refetch: fetchCareers };
};

const CareersTable: React.FC<{
  careers: Career[];
  error: string | null;
  loading: boolean;
  onEdit: (c: Career) => void;
  onDelete: (c: Career) => void;
}> = ({ careers, error, loading, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead className="hidden md:table-cell">Tipo</TableHead>
          <TableHead className="hidden lg:table-cell">Descripción</TableHead>
          <TableHead className="hidden lg:table-cell">URL</TableHead>
          <TableHead className="text-center hidden lg:table-cell">Orden</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {careers.length === 0 && !loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
              {error ? 'Error al cargar postulaciones' : 'No hay postulaciones registradas'}
            </TableCell>
          </TableRow>
        ) : (
          careers.map((c) => <CareerRow key={c._id} career={c} onEdit={onEdit} onDelete={onDelete} />)
        )}
      </TableBody>
    </Table>
  </Card>
);

const CareerForm: React.FC<{
  career: Career;
  onChange: (key: keyof Career, value: string | number | boolean) => void;
}> = ({ career, onChange }) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={career.titulo}
      onChange={(e) => onChange('titulo', e.target.value)}
      placeholder="Ej: Desarrollador Full Stack"
      required
    />
    <Select
      label="Tipo"
      value={career.tipo || 'other'}
      onChange={(e) => onChange('tipo', e.target.value as Career['tipo'])}
      options={TIPO_OPTIONS}
      required
    />
    <div>
      <label
        htmlFor="descripcion"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Descripción
      </label>
      <textarea
        id="descripcion"
        value={career.descripcion || ''}
        onChange={(e) => onChange('descripcion', e.target.value)}
        placeholder="Descripción de la postulación..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
        rows={4}
      />
    </div>
    <Input
      label="URL"
      value={career.url}
      onChange={(e) => onChange('url', e.target.value)}
      placeholder="https://..."
      type="url"
      required
    />
    <Input
      label="Orden"
      value={career.orden.toString()}
      onChange={(e) => onChange('orden', Number.parseInt(e.target.value, 10) || 0)}
      type="number"
      min="0"
    />
    <div className="flex items-center">
      <input
        type="checkbox"
        id="activo"
        checked={career.activo}
        onChange={(e) => onChange('activo', e.target.checked)}
        className="mr-2"
      />
      <label htmlFor="activo" className="text-sm text-gray-700 dark:text-gray-300">
        Activa
      </label>
    </div>
  </div>
);

const CareerModal: React.FC<{
  career: Career;
  onClose: () => void;
  onSave: (c: Career) => void;
}> = ({ career: init, onClose, onSave }) => {
  const [career, setCareer] = useState<Career>({
    ...init,
    tipo: init.tipo || 'other',
  });

  const handleChange = (key: keyof Career, value: string | number | boolean) => {
    setCareer((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      show={true}
      title={career._id ? 'Editar Postulación' : 'Nueva Postulación'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onSave(career)}>
            Guardar
          </Button>
        </>
      }
    >
      <CareerForm career={career} onChange={handleChange} />
    </Modal>
  );
};

const CareersPage: React.FC = () => {
  const [editing, setEditing] = useState<Career | null>(null);
  const [confirmDel, setConfirmDel] = useState<Career | null>(null);
  const { careers, loading, error, refetch } = useCareersData();

  const saveCareerHandler = async (career: Career) => {
    try {
      await saveCareer(career);
      setEditing(null);
      void refetch();
    } catch {
    }
  };

  const deleteCareer = async () => {
    if (!confirmDel?._id) return;
    try {
      await axios.delete(`/api/admin/careers/${confirmDel._id}`);
      toast.success('Postulación eliminada correctamente');
      setConfirmDel(null);
      void refetch();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error eliminando postulación';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Trabaja con Nosotros"
        description="Gestiona las postulaciones que aparecen en la sección de carreras"
        actions={
          <NewItemButton
            label="Nueva postulación"
            onClick={() => setEditing({ ...emptyCareer })}
          />
        }
      />

      <CareersTable
        careers={careers}
        error={error}
        loading={loading}
        onEdit={setEditing}
        onDelete={setConfirmDel}
      />

      {editing && (
        <CareerModal
          career={editing}
          onClose={() => setEditing(null)}
          onSave={(c) => {
            void saveCareerHandler(c);
          }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          open={true}
          title="Eliminar postulación"
          message={`¿Estás seguro de que deseas eliminar la postulación "${confirmDel.titulo}"?`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => {
            void deleteCareer();
          }}
        />
      )}
    </div>
  );
};

export default CareersPage;

