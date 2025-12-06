import React, { useEffect, useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { EyeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Prism from 'prismjs';

import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import NewItemButton from '../components/NewItemButton';
import {
  Button,
  Card,
  Checkbox,
  FilterBar,
  Input,
  Modal,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Template } from '../types/emails';

import 'prismjs/themes/prism-tomorrow.css';

const defaultTemplate: Template = {
  slug: '',
  nombre: '',
  subject: '',
  html: '<p>Hola {{nombre}}</p>',
  variables: ['nombre'],
  description: '',
  isActive: true,
};

const useEmailTemplatesData = () => {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    void load();
  }, []);

  return { items, loading, refetch: load };
};

const useEmailTemplateModal = () => {
  const [selected, setSelected] = useState<Template | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const openModal = (tpl?: Template) => {
    setSelected(tpl ? { ...tpl } : { ...defaultTemplate });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const save = async (onSuccess: () => void) => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = { ...selected };
      if (payload._id) {
        await axios.put(`/admin/email-templates/${payload._id}`, payload);
      } else {
        await axios.post('/admin/email-templates', payload);
      }
      onSuccess();
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return { selected, showModal, saving, openModal, closeModal, setSelected, save };
};

const useEmailTemplatePreview = () => {
  const [previewHtml, setPreviewHtml] = useState('');

  const preview = async (t: Template) => {
    try {
      const res = await axios
        .get(`/email-templates/slug/${t.slug}`, { params: { preview: true } })
        .catch(() => ({ data: t }));
      setPreviewHtml(res.data.html || t.html);
    } catch {
      setPreviewHtml(t.html);
    }
  };

  return { previewHtml, setPreviewHtml, preview };
};

const useEmailTemplateDelete = (onSuccess: () => void) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | undefined>();

  const askDelete = (id?: string) => {
    if (!id) return;
    setPendingDelete(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    await axios.delete(`/admin/email-templates/${pendingDelete}`);
    setPendingDelete(undefined);
    setConfirmOpen(false);
    onSuccess();
  };

  return { confirmOpen, pendingDelete, askDelete, doDelete, setConfirmOpen };
};

const TemplatesTable: React.FC<{
  templates: Template[];
  onEdit: (t: Template) => void;
  onDelete: (id?: string) => void;
  onPreview: (t: Template) => void;
}> = ({ templates, onEdit, onDelete, onPreview }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slug</TableHead>
          <TableHead className="hidden md:table-cell">Descripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay plantillas registradas
            </TableCell>
          </TableRow>
        ) : (
          templates.map((t) => (
            <TableRow key={t._id}>
              <TableCell className="font-medium font-mono text-sm">{t.slug}</TableCell>
              <TableCell className="hidden md:table-cell">{t.description || '—'}</TableCell>
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
                    onClick={() => {
                      void onPreview(t);
                    }}
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <EditIconButton onClick={() => onEdit(t)} />
                  <DeleteIconButton onClick={() => onDelete(t._id)} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const HtmlEditor: React.FC<{
  value: string;
  onChange: (code: string) => void;
}> = ({ value, onChange }) => (
  <div>
    <label
      htmlFor="html-editor"
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      HTML / CSS
    </label>
    <div id="html-editor" className="border rounded-lg overflow-hidden dark:border-gray-600">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
        padding={12}
        className="w-full font-mono text-sm dark:bg-gray-900"
        style={{
          minHeight: '300px',
          background: '#1e293b',
          color: '#e2e8f0',
          overflow: 'auto',
        }}
      />
    </div>
  </div>
);

const EmailTemplateForm: React.FC<{
  template: Template;
  onTemplateChange: (t: Template) => void;
}> = ({ template, onTemplateChange }) => (
  <div className="space-y-4">
    <Input
      label="Slug"
      value={template.slug}
      onChange={(e) => onTemplateChange({ ...template, slug: e.target.value })}
      placeholder="ej: bienvenida-usuario"
    />
    <Input
      label="Subject"
      value={template.subject}
      onChange={(e) => onTemplateChange({ ...template, subject: e.target.value })}
      placeholder="Asunto del email"
    />
    <HtmlEditor
      value={template.html}
      onChange={(code) => onTemplateChange({ ...template, html: code })}
    />
    <Input
      label="Variables (coma separadas)"
      value={(template.variables || []).join(', ')}
      onChange={(e) =>
        onTemplateChange({
          ...template,
          variables: e.target.value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        })
      }
      placeholder="nombre, email, fecha"
    />
    <Input
      label="Descripción"
      value={template.description || ''}
      onChange={(e) => onTemplateChange({ ...template, description: e.target.value })}
      placeholder="Descripción del template"
    />
    <Checkbox
      label="Activo"
      checked={!!template.isActive}
      onChange={(e) => onTemplateChange({ ...template, isActive: e.target.checked })}
    />
  </div>
);

const EmailTemplateEditor: React.FC<{
  template: Template;
  onTemplateChange: (t: Template) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}> = ({ template, onTemplateChange, saving, onSave, onClose }) => (
  <Modal
    show={true}
    title={template._id ? 'Editar Template' : 'Nuevo Template'}
    onClose={onClose}
    size="xl"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
          Guardar
        </Button>
      </>
    }
  >
    <EmailTemplateForm template={template} onTemplateChange={onTemplateChange} />
  </Modal>
);

const EmailTemplatesContent: React.FC<{
  items: Template[];
  q: string;
  selected: Template | null;
  showModal: boolean;
  saving: boolean;
  previewHtml: string;
  confirmOpen: boolean;
  onQueryChange: (q: string) => void;
  onNewTemplate: () => void;
  onEditTemplate: (t: Template) => void;
  onDeleteTemplate: (id?: string) => void;
  onPreviewTemplate: (t: Template) => void;
  onTemplateChange: (t: Template) => void;
  onSave: () => void;
  onCloseModal: () => void;
  onClosePreview: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}> = ({
  items,
  q,
  selected,
  showModal,
  saving,
  previewHtml,
  confirmOpen,
  onQueryChange,
  onNewTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onPreviewTemplate,
  onTemplateChange,
  onSave,
  onCloseModal,
  onClosePreview,
  onConfirmDelete,
  onCancelDelete,
}) => {
  const filtered = useMemo(() => {
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter(
      (t) =>
        t.slug.toLowerCase().includes(needle) ||
        (t.nombre || '').toLowerCase().includes(needle) ||
        (t.subject || '').toLowerCase().includes(needle)
    );
  }, [q, items]);

  return (
    <div>
      <PageHeader
        title="Templates de Email"
        description="Gestiona las plantillas de correo electrónico"
        actions={<NewItemButton label="Nueva plantilla" onClick={onNewTemplate} />}
      />

      <FilterBar
        searchValue={q}
        onSearchChange={onQueryChange}
        searchPlaceholder="Buscar por slug, nombre o subject..."
      />

      <TemplatesTable
        templates={filtered}
        onEdit={onEditTemplate}
        onDelete={onDeleteTemplate}
        onPreview={onPreviewTemplate}
      />

      {showModal && selected && (
        <EmailTemplateEditor
          template={selected}
          onTemplateChange={onTemplateChange}
          saving={saving}
          onSave={onSave}
          onClose={onCloseModal}
        />
      )}

      {previewHtml && (
        <Modal show={true} title="Vista previa del email" onClose={onClosePreview} size="xl">
          <iframe title="preview" className="w-full h-[70vh] border rounded" srcDoc={previewHtml} />
        </Modal>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar template"
        message="¿Seguro que deseas eliminar este template?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
};

const EmailTemplatesPage: React.FC = () => {
  const [q, setQ] = useState('');
  const { items, loading, refetch } = useEmailTemplatesData();
  const { selected, showModal, saving, openModal, closeModal, setSelected, save } =
    useEmailTemplateModal();
  const { previewHtml, setPreviewHtml, preview } = useEmailTemplatePreview();
  const { confirmOpen, askDelete, doDelete, setConfirmOpen } = useEmailTemplateDelete(() => {
    void refetch();
  });

  const handleSave = () => {
    void save(() => {
      void refetch();
    });
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
    <EmailTemplatesContent
      items={items}
      q={q}
      selected={selected}
      showModal={showModal}
      saving={saving}
      previewHtml={previewHtml || ''}
      confirmOpen={confirmOpen}
      onQueryChange={setQ}
      onNewTemplate={() => openModal()}
      onEditTemplate={(t) => openModal(t)}
      onDeleteTemplate={(id) => {
        if (id) {
          askDelete(id);
        }
      }}
      onPreviewTemplate={(t) => {
        void preview(t);
      }}
      onTemplateChange={setSelected}
      onSave={handleSave}
      onCloseModal={closeModal}
      onClosePreview={() => setPreviewHtml('')}
      onConfirmDelete={() => {
        void doDelete();
      }}
      onCancelDelete={() => setConfirmOpen(false)}
    />
  );
};

export default EmailTemplatesPage;
