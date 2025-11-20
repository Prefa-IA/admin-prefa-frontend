import React, { useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { PlanTag } from '../types/planTags';

const emptyTag: PlanTag = { slug: '', name: '', bgClass: '', icon: '' };

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando etiquetas...</p>
    </div>
  </div>
);

const getErrorMessage = (err: unknown): string => {
  const error = err as { response?: { data?: { error?: string } }; message?: string };
  return error.response?.data?.error || error.message || 'Error al cargar etiquetas';
};

const TagRow: React.FC<{
  tag: PlanTag;
  onEdit: (t: PlanTag) => void;
  onDelete: (t: PlanTag) => void;
}> = ({ tag, onEdit, onDelete }) => (
  <TableRow key={tag._id || tag.slug}>
    <TableCell className="font-mono text-sm">{tag.slug}</TableCell>
    <TableCell className="font-medium">{tag.name}</TableCell>
    <TableCell className="text-center">{tag.icon || '—'}</TableCell>
    <TableCell className="text-xs font-mono">{tag.bgClass}</TableCell>
    <TableCell align="right">
      <div className="flex items-center justify-end gap-1">
        <EditIconButton onClick={() => onEdit(tag)} />
        <DeleteIconButton onClick={() => onDelete(tag)} />
      </div>
    </TableCell>
  </TableRow>
);

const savePlanTag = async (tag: PlanTag): Promise<void> => {
  if (tag._id) await axios.put(`/api/admin/plan-tags/${tag._id}`, tag);
  else await axios.post('/api/admin/plan-tags', tag);
};

const usePlanTagsData = () => {
  const [tags, setTags] = useState<PlanTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<PlanTag[]>('/api/admin/plan-tags');
      console.log('PlanTags recibidos:', data);
      setTags(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Error al cargar etiquetas:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTags();
  }, []);

  return { tags, loading, error, refetch: fetchTags };
};

const TagsTable: React.FC<{
  tags: PlanTag[];
  error: string | null;
  loading: boolean;
  onEdit: (t: PlanTag) => void;
  onDelete: (t: PlanTag) => void;
}> = ({ tags, error, loading, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slug</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Icono</TableHead>
          <TableHead>Clases</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tags.length === 0 && !loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
              {error ? 'Error al cargar etiquetas' : 'No hay etiquetas registradas'}
            </TableCell>
          </TableRow>
        ) : (
          tags.map((t) => (
            <TagRow key={t._id || t.slug} tag={t} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const PlanTagsPage: React.FC = () => {
  const [editing, setEditing] = useState<PlanTag | null>(null);
  const [confirmDel, setConfirmDel] = useState<PlanTag | null>(null);
  const { tags, loading, error, refetch } = usePlanTagsData();

  const saveTag = async (tag: PlanTag) => {
    await savePlanTag(tag);
    setEditing(null);
    void refetch();
  };

  const deleteTag = async () => {
    if (!confirmDel?._id) return;
    await axios.delete(`/api/admin/plan-tags/${confirmDel._id}`);
    setConfirmDel(null);
    void refetch();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Etiquetas de Planes"
        description="Gestiona las etiquetas visuales para los planes"
        actions={
          <NewItemButton label="Nueva etiqueta" onClick={() => setEditing({ ...emptyTag })} />
        }
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <TagsTable
        tags={tags}
        error={error}
        loading={loading}
        onEdit={setEditing}
        onDelete={setConfirmDel}
      />

      {editing && (
        <TagModal
          tag={editing}
          onClose={() => setEditing(null)}
          onSave={(t) => {
            void saveTag(t);
          }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          open={true}
          title="Eliminar etiqueta"
          message={`¿Estás seguro de que deseas eliminar la etiqueta "${confirmDel.name}"?`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => {
            void deleteTag();
          }}
        />
      )}
    </div>
  );
};

export default PlanTagsPage;

const TagModal: React.FC<{ tag: PlanTag; onClose: () => void; onSave: (t: PlanTag) => void }> = ({
  tag: init,
  onClose,
  onSave,
}) => {
  const [tag, setTag] = useState<PlanTag>(init);
  const handle = (k: keyof PlanTag, v: string | boolean) => setTag((prev) => ({ ...prev, [k]: v }));

  return (
    <Modal
      show={true}
      title={tag._id ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onSave(tag)}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Slug"
          value={tag.slug}
          onChange={(e) => handle('slug', e.target.value)}
          placeholder="ej: super-save"
        />
        <Input
          label="Nombre"
          value={tag.name}
          onChange={(e) => handle('name', e.target.value)}
          placeholder="Ej: Super Ahorro"
        />
        <Input
          label="Clases Tailwind"
          value={tag.bgClass}
          onChange={(e) => handle('bgClass', e.target.value)}
          placeholder="Ej: bg-gradient-to-r from-emerald-500 to-green-600"
        />
        <Input
          label="Icono (emoji opcional)"
          value={tag.icon || ''}
          onChange={(e) => handle('icon', e.target.value)}
          placeholder="Ej: ⚡"
        />
      </div>
    </Modal>
  );
};
