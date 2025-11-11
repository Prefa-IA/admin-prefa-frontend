import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { EyeIcon } from '@heroicons/react/24/outline';
import { PageHeader, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Modal, Input, Button, Checkbox, FilterBar } from '../components/ui';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import NewItemButton from '../components/NewItemButton';
import ConfirmModal from '../components/ConfirmModal';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';
import { Template } from '../types/emails';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando plantillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Templates de Email"
        description="Gestiona las plantillas de correo electrónico"
        actions={
          <NewItemButton label="Nueva plantilla" onClick={startNew} />
        }
      />

      <FilterBar
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Buscar por slug, nombre o subject..."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay plantillas registradas
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(t => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium font-mono text-sm">{t.slug}</TableCell>
                  <TableCell>{t.description || '—'}</TableCell>
                  <TableCell>
                    {t.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Activo
                      </span>
                    ) : (
                      <span className="text-gray-400">Inactivo</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Preview"
                        onClick={() => preview(t)}
                        className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <EditIconButton onClick={() => edit(t)} />
                      <DeleteIconButton onClick={() => askDelete(t._id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de edición/creación */}
      {showModal && selected && (
        <Modal
          show={true}
          title={selected._id ? 'Editar Template' : 'Nuevo Template'}
          onClose={closeModal}
          size="xl"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button variant="primary" onClick={save} disabled={saving} isLoading={saving}>
                Guardar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Slug"
              value={selected.slug}
              onChange={(e) => setSelected(s => ({ ...(s as Template), slug: e.target.value }))}
              placeholder="ej: bienvenida-usuario"
            />
            <Input
              label="Subject"
              value={selected.subject}
              onChange={(e) => setSelected(s => ({ ...(s as Template), subject: e.target.value }))}
              placeholder="Asunto del email"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                HTML / CSS
              </label>
              <div className="border rounded-lg overflow-hidden dark:border-gray-600">
                <Editor
                  value={selected.html}
                  onValueChange={code => setSelected(s => ({ ...(s as Template), html: code }))}
                  highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                  padding={12}
                  className="w-full font-mono text-sm dark:bg-gray-900"
                  style={{ minHeight: '300px', background: '#1e293b', color: '#e2e8f0', overflow: 'auto' }}
                />
              </div>
            </div>
            <Input
              label="Variables (coma separadas)"
              value={(selected.variables || []).join(', ')}
              onChange={(e) => setSelected(s => ({ ...(s as Template), variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))}
              placeholder="nombre, email, fecha"
            />
            <Input
              label="Descripción"
              value={selected.description || ''}
              onChange={(e) => setSelected(s => ({ ...(s as Template), description: e.target.value }))}
              placeholder="Descripción del template"
            />
            <Checkbox
              label="Activo"
              checked={!!selected.isActive}
              onChange={(e) => setSelected(s => ({ ...(s as Template), isActive: e.target.checked }))}
            />
          </div>
        </Modal>
      )}

      {/* Modal Preview */}
      {previewHtml && (
        <Modal
          show={true}
          title="Vista previa del email"
          onClose={() => setPreviewHtml('')}
          size="xl"
        >
          <iframe title="preview" className="w-full h-[70vh] border rounded" srcDoc={previewHtml} />
        </Modal>
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



