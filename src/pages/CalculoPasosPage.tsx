import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';
import EditCalculoPasoModal from '../components/modals/EditCalculoPasoModal';

interface Paso {
  _id?: string;
  orden: number;
  nombre_paso: string;
  metodo_interno: string;
  descripcion?: string;
  activo?: boolean;
}

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

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Secuencia de Cálculo</h1>
        <NewItemButton label="Nuevo" onClick={()=>setShowModal(true)} />
      </div>
      {loading ? <p>Cargando…</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Orden</th><th className="px-4 py-2 text-left">Nombre</th><th className="px-4 py-2">Método</th><th className="px-4 py-2">Activo</th><th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pasos.map(p=> (
                <tr key={p._id} className="border-t">
                  <td className="px-4 py-2 text-center">{p.orden}</td>
                  <td className="px-4 py-2">{p.nombre_paso}</td>
                  <td className="px-4 py-2">{p.metodo_interno}</td>
                  <td className="px-4 py-2 text-center">{p.activo? '✓':'—'}</td>
                  <td className="px-4 py-2 flex gap-2 justify-center"><EditIconButton onClick={()=>{setEditing(p); setShowModal(true);}}/><DeleteIconButton onClick={()=>setToDelete(p)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <EditCalculoPasoModal show={showModal} onClose={()=>{setShowModal(false); setEditing(null);}} onSave={handleSave} editing={editing} /> )}
      {toDelete && (<ConfirmModal open={true} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} title="Eliminar" message="¿Eliminar paso?" />)}
    </div>
  );
};
export default CalculoPasosPage;
