import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';
import PromptTemplateModal from '../components/modals/PromptTemplateModal';

interface PromptTemplate {
  _id?: string;
  id?: string;
  nombre?: string;
  name?: string;
  version: string;
  contenido_prompt?: string;
  template?: string;
  activo?: boolean;
  isActive?: boolean;
  fecha_creacion?: string;
}

const PromptTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [toDelete, setToDelete] = useState<PromptTemplate | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<PromptTemplate[]>('/api/prompts');
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (tpl: PromptTemplate) => {
    try {
      if (editing && editing._id) {
        await axios.put(`/api/prompts/${editing._id}`, tpl);
      } else {
        await axios.post('/api/prompts', tpl);
      }
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error guardando plantilla');
    }
  };

  const handleActivate = async (tpl: PromptTemplate) => {
    if (!tpl._id) return;
    try {
      await axios.put(`/api/prompts/${tpl._id}/activate`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    try {
      await axios.delete(`/api/prompts/${toDelete._id}`);
      setToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Plantillas de Prompt</h1>
        <NewItemButton label="Nueva" onClick={() => setShowModal(true)} />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2">Versión</th>
                <th className="px-4 py-2">Activo</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tpl => {
                const activo = tpl.activo ?? tpl.isActive;
                const nombre = tpl.nombre || tpl.name;
                return (
                  <tr key={tpl._id} className="border-t">
                    <td className="px-4 py-2">{nombre}</td>
                    <td className="px-4 py-2 text-center">{tpl.version}</td>
                    <td className="px-4 py-2 text-center">
                      {activo ? <span className="text-green-600 font-semibold">Activo</span> : '—'}
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        className="btn-secondary text-xs"
                        onClick={() => handleActivate(tpl)}
                      >Activar</button>
                      <EditIconButton onClick={() => { setEditing(tpl); setShowModal(true); }} />
                      <DeleteIconButton onClick={() => setToDelete(tpl)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PromptTemplateModal
          initialData={editing || undefined}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar plantilla"
          message={`¿Seguro que deseas eliminar "${toDelete.nombre || toDelete.name}"?`}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default PromptTemplatesPage; 