import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import EditCalculoPasoModal from '../components/modals/EditCalculoPasoModal';
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
import { Paso } from '../types/pasos';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando pasos de cálculo...</p>
    </div>
  </div>
);

const PasoRow: React.FC<{
  paso: Paso;
  onEdit: (p: Paso) => void;
  onDelete: (p: Paso) => void;
}> = ({ paso, onEdit, onDelete }) => (
  <TableRow key={paso._id}>
    <TableCell className="text-center">{paso.orden}</TableCell>
    <TableCell className="font-medium">{paso.nombre_paso}</TableCell>
    <TableCell>{paso.metodo_interno}</TableCell>
    <TableCell>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          paso.activo
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {paso.activo ? 'Sí' : 'No'}
      </span>
    </TableCell>
    <TableCell align="right">
      <div className="flex items-center justify-end gap-1">
        <EditIconButton onClick={() => onEdit(paso)} />
        <DeleteIconButton onClick={() => onDelete(paso)} />
      </div>
    </TableCell>
  </TableRow>
);

const savePaso = async (paso: Paso, editing: Paso | null): Promise<void> => {
  if (editing && editing._id) {
    await axios.put(`/admin/calculo-pasos/${editing._id}`, paso);
  } else {
    await axios.post('/admin/calculo-pasos', paso);
  }
};

const usePasosData = () => {
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Paso[]>('/admin/calculo-pasos');
      setPasos(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return { pasos, loading, refetch: fetchData };
};

const PasosTable: React.FC<{
  pasos: Paso[];
  onEdit: (p: Paso) => void;
  onDelete: (p: Paso) => void;
}> = ({ pasos, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Orden</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Método</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pasos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay pasos de cálculo registrados
            </TableCell>
          </TableRow>
        ) : (
          pasos.map((p) => <PasoRow key={p._id} paso={p} onEdit={onEdit} onDelete={onDelete} />)
        )}
      </TableBody>
    </Table>
  </Card>
);

const CalculoPasosPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Paso | null>(null);
  const [toDelete, setToDelete] = useState<Paso | null>(null);
  const { pasos, loading, refetch } = usePasosData();

  const handleSave = async (p: Paso) => {
    try {
      await savePaso(p, editing);
      setShowModal(false);
      setEditing(null);
      void refetch();
    } catch (err) {
      console.error(err);
      alert('Error guardando paso');
    }
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    try {
      await axios.delete(`/admin/calculo-pasos/${toDelete._id}`);
      setToDelete(null);
      void refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (paso: Paso) => {
    setEditing(paso);
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Secuencia de Cálculo"
        description="Gestiona los pasos del proceso de cálculo"
        actions={<NewItemButton label="Nuevo paso" onClick={() => setShowModal(true)} />}
      />

      <PasosTable pasos={pasos} onEdit={handleEdit} onDelete={setToDelete} />

      {showModal && (
        <EditCalculoPasoModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={(p) => {
            void handleSave(p);
          }}
          editing={editing}
        />
      )}
      {toDelete && (
        <ConfirmModal
          open={true}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            void handleDelete();
          }}
          title="Eliminar paso"
          message="¿Estás seguro de que deseas eliminar este paso?"
        />
      )}
    </div>
  );
};
export default CalculoPasosPage;
