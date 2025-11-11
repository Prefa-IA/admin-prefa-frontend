import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '../components/ui';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';
import EditCalculoPasoModal from '../components/modals/EditCalculoPasoModal';
import { Paso } from '../types/pasos';

const CalculoPasosPage: React.FC = () => {
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Paso | null>(null);
  const [toDelete, setToDelete] = useState<Paso | null>(null);

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

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (p: Paso) => {
    try {
      if (editing && editing._id) {
        await axios.put(`/admin/calculo-pasos/${editing._id}`, p);
      } else {
        await axios.post('/admin/calculo-pasos', p);
      }
      setShowModal(false);
      setEditing(null);
      fetchData();
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
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando pasos de cálculo...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Secuencia de Cálculo"
        description="Gestiona los pasos del proceso de cálculo"
        actions={
          <NewItemButton label="Nuevo paso" onClick={()=>setShowModal(true)} />
        }
      />

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
              pasos.map(p=> (
                <TableRow key={p._id}>
                  <TableCell className="text-center">{p.orden}</TableCell>
                  <TableCell className="font-medium">{p.nombre_paso}</TableCell>
                  <TableCell>{p.metodo_interno}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {p.activo ? 'Sí' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <EditIconButton onClick={()=>{setEditing(p); setShowModal(true);}}/>
                      <DeleteIconButton onClick={()=>setToDelete(p)}/>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {showModal && (
        <EditCalculoPasoModal show={showModal} onClose={()=>{setShowModal(false); setEditing(null);}} onSave={handleSave} editing={editing} />
      )}
      {toDelete && (
        <ConfirmModal
          open={true}
          onCancel={()=>setToDelete(null)}
          onConfirm={handleDelete}
          title="Eliminar paso"
          message="¿Estás seguro de que deseas eliminar este paso?"
        />
      )}
    </div>
  );
};
export default CalculoPasosPage;
