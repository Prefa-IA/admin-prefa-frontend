import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import NewItemButton from '../components/NewItemButton';
import ConfirmModal from '../components/ConfirmModal';
import Card from '../components/Card';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

type Template = {
  _id?: string;
  slug: string;
  nombre: string;
  subject: string;
  html: string;
  variables?: string[];
  description?: string;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

const defaultTemplate: Template = {
  slug: '',
  nombre: '',
  subject: '',
  html: '<p>Hola {{nombre}}</p>',
  variables: ['nombre'],
  description: '',
  isActive: true,
};


const EmailTemplatesPage: React.FC = () => {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter(t =>
      t.slug.toLowerCase().includes(needle) ||
      (t.nombre || '').toLowerCase().includes(needle) ||
      (t.subject || '').toLowerCase().includes(needle)
    );
  }, [q, items]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/email-templates');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (tpl?: Template) => {
    setSelected(tpl ? { ...tpl } : { ...defaultTemplate });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setSelected(null); };
  const startNew = () => openModal();
  const edit = (t: Template) => openModal(t);
  const preview = async (t: Template) => {
    try {
      const res = await axios.get(`/email-templates/slug/${t.slug}`, { params: { preview: true } }).catch(()=>({ data: t }));
      setPreviewHtml(res.data.html || t.html);
    } catch {
      setPreviewHtml(t.html);
    }
  };
  const doDelete = async () => {
    if (!pendingDelete) return;
    await axios.delete(`/admin/email-templates/${pendingDelete}`);
    setSelected(null);
    setConfirmOpen(false);
    setPendingDelete(undefined);
    load();
  };

  const askDelete = (id?: string) => {
    if (!id) return;
    setPendingDelete(id);
    setConfirmOpen(true);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = { ...selected };
      if (payload._id) {
        const { data } = await axios.put(`/admin/email-templates/${payload._id}`, payload);
        setSelected(data);
      } else {
        const { data } = await axios.post('/admin/email-templates', payload);
        setSelected(data);
      }
      await load();
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  // removed variable preview logic

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Templates de Email</h1>
        <NewItemButton label="Nuevo" onClick={startNew} />
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar" className="w-full border rounded px-3 py-2" />
      {loading ? (
        <div>Cargando…</div>
      ) : (
        <Card className="p-0 divide-y">
          {filtered.map(t => (
            <div key={t._id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.slug}</div>
                <div className="text-sm text-gray-600 truncate">{t.description}</div>
              </div>
              <div className="flex gap-2">
                <EditIconButton onClick={() => edit(t)} />
                <button title="Preview" onClick={() => preview(t)} className="p-1 hover:bg-gray-100 rounded"><EyeIcon className="h-5 w-5"/></button>
                <DeleteIconButton onClick={() => askDelete(t._id)} />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Modal de edición/creación */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl mt-10 rounded shadow-lg p-6 relative">
            <button onClick={closeModal} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"><XMarkIcon className="h-6 w-6"/></button>
            <h2 className="text-lg font-semibold mb-4">{selected._id ? 'Editar' : 'Nuevo'} Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Slug</label>
                <input className="w-full border rounded px-3 py-2" value={selected.slug} onChange={e => setSelected(s => ({ ...(s as Template), slug: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Subject</label>
                <input className="w-full border rounded px-3 py-2" value={selected.subject} onChange={e => setSelected(s => ({ ...(s as Template), subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">HTML / CSS</label>
                <Editor
                  value={selected.html}
                  onValueChange={code => setSelected(s => ({ ...(s as Template), html: code }))}
                  highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                  padding={12}
                  className="w-full border rounded font-mono text-sm"
                  style={{ minHeight: '240px', background: '#2d2d2d', color: '#ccc', overflow: 'auto' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Variables (coma separadas)</label>
                <input className="w-full border rounded px-3 py-2" value={(selected.variables || []).join(', ')} onChange={e => setSelected(s => ({ ...(s as Template), variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <input className="w-full border rounded px-3 py-2" value={selected.description || ''} onChange={e => setSelected(s => ({ ...(s as Template), description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!selected.isActive} onChange={e => setSelected(s => ({ ...(s as Template), isActive: e.target.checked }))} />
                <span className="text-sm">Activo</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="px-4 py-2 border rounded" onClick={closeModal}>Cancelar</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {previewHtml && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 overflow-y-auto" onClick={()=>setPreviewHtml('')}>
          <div className="bg-white w-full max-w-4xl mt-10 rounded shadow-lg p-4 relative" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setPreviewHtml('')} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"><XMarkIcon className="h-6 w-6"/></button>
            <iframe title="preview" className="w-full h-[70vh] border rounded" srcDoc={previewHtml} />
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar template"
        message="¿Seguro que deseas eliminar este template?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default EmailTemplatesPage;



