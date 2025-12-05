import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import EditReglaLogicaModal from '../components/modals/EditReglaLogicaModal';
import NewItemButton from '../components/NewItemButton';
import {
  Card,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Paso } from '../types/pasos';
import { ReglaLogica } from '../types/reglas';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando reglas lógicas...</p>
    </div>
  </div>
);

const formatCuReferencia = (idCu: string | string[] | undefined): string => {
  if (Array.isArray(idCu)) return idCu.join(', ');
  if (idCu) return idCu;
  return '';
};

const ReglaLogicaRow: React.FC<{
  regla: ReglaLogica;
  pasoNombre: (id?: string) => string;
  onEdit: (r: ReglaLogica) => void;
  onDelete: (r: ReglaLogica) => void;
}> = ({ regla, pasoNombre, onEdit, onDelete }) => (
  <TableRow key={regla._id}>
    <TableCell>{pasoNombre(regla.id_paso)}</TableCell>
    <TableCell>{regla.distrito_cpu}</TableCell>
    <TableCell>{formatCuReferencia(regla.id_cu_referencia)}</TableCell>
    <TableCell>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          regla.activo
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {regla.activo ? 'Sí' : 'No'}
      </span>
    </TableCell>
    <TableCell align="right">
      <div className="flex items-center justify-end gap-1">
        <EditIconButton onClick={() => onEdit(regla)} />
        <DeleteIconButton onClick={() => onDelete(regla)} />
      </div>
    </TableCell>
  </TableRow>
);

const saveReglaLogica = async (regla: ReglaLogica, editing: ReglaLogica | null): Promise<void> => {
  if (editing && editing._id) {
    await axios.put(`/admin/reglas-logicas/${editing._id}`, regla);
  } else {
    await axios.post('/admin/reglas-logicas', regla);
  }
};

const useReglasLogicasData = () => {
  const [reglas, setReglas] = useState<ReglaLogica[]>([]);
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: reglasData }, { data: pasosData }] = await Promise.all([
        axios.get<ReglaLogica[]>('/admin/reglas-logicas'),
        axios.get<Paso[]>('/admin/calculo-pasos'),
      ]);
      setReglas(reglasData);
      setPasos(pasosData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  return { reglas, pasos, loading, refetch: fetchAll };
};

const ReglasTable: React.FC<{
  reglas: ReglaLogica[];
  pasoNombre: (id?: string) => string;
  onEdit: (r: ReglaLogica) => void;
  onDelete: (r: ReglaLogica) => void;
}> = ({ reglas, pasoNombre, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paso</TableHead>
          <TableHead>Distrito</TableHead>
          <TableHead>Ref CU</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reglas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay reglas lógicas registradas
            </TableCell>
          </TableRow>
        ) : (
          reglas.map((r) => (
            <ReglaLogicaRow
              key={r._id}
              regla={r}
              pasoNombre={pasoNombre}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const getOpcionesPasos = (
  pasos: (Paso & { _id: string })[]
): Array<{ value: string; label: string }> => [
  { value: '', label: 'Todos los pasos' },
  ...pasos.map((p) => ({
    value: p._id,
    label: p.nombre_paso || 'Sin nombre',
  })),
];

const filtrarReglasPorPaso = (reglas: ReglaLogica[], filtroPaso: string): ReglaLogica[] =>
  filtroPaso ? reglas.filter((r) => r.id_paso === filtroPaso) : reglas;

const useReglasLogicasHandlers = (
  editing: ReglaLogica | null,
  setShowModal: (show: boolean) => void,
  setEditing: (r: ReglaLogica | null) => void,
  toDelete: ReglaLogica | null,
  setToDelete: (r: ReglaLogica | null) => void,
  refetch: () => Promise<void>
) => {
  const handleSave = async (r: ReglaLogica) => {
    if (!r.distrito_cpu || r.distrito_cpu.trim() === '') {
      toast.error('El distrito CPU es requerido');
      return;
    }
    try {
      await saveReglaLogica(r, editing);
      toast.success(editing ? 'Regla actualizada correctamente' : 'Regla creada correctamente');
      setShowModal(false);
      setEditing(null);
      void refetch();
    } catch (e) {
      console.error(e);
      const errorMessage =
        (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ||
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error guardando regla';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    try {
      await axios.delete(`/admin/reglas-logicas/${toDelete._id}`);
      toast.success('Regla eliminada correctamente');
      setToDelete(null);
      void refetch();
    } catch (e) {
      console.error(e);
      const errorMessage =
        (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ||
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error eliminando regla';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (regla: ReglaLogica) => {
    setEditing(regla);
    setShowModal(true);
  };

  return { handleSave, handleDelete, handleEdit };
};

const useReglasLogicasComputed = (pasos: Paso[], reglas: ReglaLogica[], filtroPaso: string) => {
  const pasoNombre = (id?: string) => pasos.find((p) => p._id === id)?.nombre_paso || '';
  const pasosSafe = pasos.filter((p): p is Paso & { _id: string } => !!p._id);
  const reglasFiltradas = filtrarReglasPorPaso(reglas, filtroPaso);
  const opcionesPasos = getOpcionesPasos(pasosSafe);
  return { pasoNombre, pasosSafe, reglasFiltradas, opcionesPasos };
};

const ReglasLogicasPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ReglaLogica | null>(null);
  const [toDelete, setToDelete] = useState<ReglaLogica | null>(null);
  const [filtroPaso, setFiltroPaso] = useState<string>('');
  const { reglas, pasos, loading, refetch } = useReglasLogicasData();
  const { handleSave, handleDelete, handleEdit } = useReglasLogicasHandlers(
    editing,
    setShowModal,
    setEditing,
    toDelete,
    setToDelete,
    refetch
  );
  const { pasoNombre, pasosSafe, reglasFiltradas, opcionesPasos } = useReglasLogicasComputed(
    pasos,
    reglas,
    filtroPaso
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Reglas Lógicas"
        description="Gestiona las reglas lógicas del sistema"
        actions={<NewItemButton label="Nueva regla" onClick={() => setShowModal(true)} />}
      />

      <div className="mb-6">
        <Select
          label="Filtrar por paso"
          value={filtroPaso}
          onChange={(e) => setFiltroPaso(e.target.value)}
          options={opcionesPasos}
          className="max-w-xs"
        />
      </div>

      <ReglasTable
        reglas={reglasFiltradas}
        pasoNombre={pasoNombre}
        onEdit={handleEdit}
        onDelete={setToDelete}
      />

      {showModal && (
        <EditReglaLogicaModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={(r) => {
            void handleSave(r);
          }}
          editing={editing}
          pasos={pasosSafe}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            void handleDelete();
          }}
          title="Eliminar regla"
          message="¿Estás seguro de que deseas eliminar esta regla lógica?"
        />
      )}
    </div>
  );
};

export default ReglasLogicasPage;
