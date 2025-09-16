import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';

interface PlanTag {
  _id?: string;
  slug: string;
  name: string;
  bgClass: string;
  icon?: string;
}

const emptyTag: PlanTag = { slug: '', name: '', bgClass: '', icon: '' };

const PlanTagsPage: React.FC = () => {
  const [tags, setTags] = useState<PlanTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlanTag | null>(null);
  const [confirmDel, setConfirmDel] = useState<PlanTag | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    const { data } = await axios.get<PlanTag[]>('/api/admin/plan-tags');
    setTags(data);
    setLoading(false);
  };

  useEffect(() => { fetchTags(); }, []);

  const saveTag = async (tag: PlanTag) => {
    if (tag._id) await axios.put(`/api/admin/plan-tags/${tag._id}`, tag);
    else await axios.post('/api/admin/plan-tags', tag);
    setEditing(null);
    fetchTags();
  };

  const deleteTag = async () => {
    if (!confirmDel?._id) return;
    await axios.delete(`/api/admin/plan-tags/${confirmDel._id}`);
    setConfirmDel(null);
    fetchTags();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Etiquetas de Planes</h1>
        <NewItemButton label="Nueva" onClick={() => setEditing({ ...emptyTag })} />
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table className="min-w-full text-sm border bg-white shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Icono</th>
              <th className="px-4 py-2 text-left">Classes</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(t => (
              <tr key={t._id} className="border-t">
                <td className="px-4 py-2 font-mono">{t.slug}</td>
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2 text-center">{t.icon||'—'}</td>
                <td className="px-4 py-2 text-xs">{t.bgClass}</td>
                <td className="px-4 py-2 space-x-2 text-center">
                  <EditIconButton onClick={() => setEditing(t)} />
                  <DeleteIconButton onClick={() => setConfirmDel(t)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <TagModal
          tag={editing}
          onClose={() => setEditing(null)}
          onSave={saveTag}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          open={true}
          title="Eliminar etiqueta"
          message={`¿Eliminar "${confirmDel.name}"?`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={deleteTag}
        />
      )}
    </div>
  );
};

export default PlanTagsPage;

// Modal inline
const TagModal: React.FC<{ tag: PlanTag; onClose: () => void; onSave: (t: PlanTag) => void }> = ({ tag: init, onClose, onSave }) => {
  const [tag, setTag] = useState<PlanTag>(init);
  const handle = (k: keyof PlanTag, v: any) => setTag(prev => ({ ...prev, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-lg font-semibold">{tag._id ? 'Editar' : 'Nueva'} Etiqueta</h3>
        <label className="block text-sm font-medium">Slug
          <input className="input-field w-full" value={tag.slug} onChange={e=>handle('slug',e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Nombre
          <input className="input-field w-full" value={tag.name} onChange={e=>handle('name',e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Clases Tailwind
          <input className="input-field w-full" value={tag.bgClass} onChange={e=>handle('bgClass',e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Icono (emoji opcional)
          <input className="input-field w-full" value={tag.icon||''} onChange={e=>handle('icon',e.target.value)} />
        </label>
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={()=>onSave(tag)}>Guardar</button>
        </div>
      </div>
    </div>
  );
}; 