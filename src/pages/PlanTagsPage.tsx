import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Modal, Input, Button } from '../components/ui';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';
import { PlanTag } from '../types/planTags';

const emptyTag: PlanTag = { slug: '', name: '', bgClass: '', icon: '' };

const PlanTagsPage: React.FC = () => {
  const [tags, setTags] = useState<PlanTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PlanTag | null>(null);
  const [confirmDel, setConfirmDel] = useState<PlanTag | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<PlanTag[]>('/api/admin/plan-tags');
      console.log('PlanTags recibidos:', data);
      setTags(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al cargar etiquetas:', err);
      console.error('Response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar etiquetas';
      setError(errorMessage);
      setTags([]);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando etiquetas...</p>
        </div>
      </div>
    );
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
              tags.map(t => (
                <TableRow key={t._id || t.slug}>
                  <TableCell className="font-mono text-sm">{t.slug}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-center">{t.icon||'—'}</TableCell>
                  <TableCell className="text-xs font-mono">{t.bgClass}</TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <EditIconButton onClick={() => setEditing(t)} />
                      <DeleteIconButton onClick={() => setConfirmDel(t)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
          message={`¿Estás seguro de que deseas eliminar la etiqueta "${confirmDel.name}"?`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={deleteTag}
        />
      )}
    </div>
  );
};

export default PlanTagsPage;

const TagModal: React.FC<{ tag: PlanTag; onClose: () => void; onSave: (t: PlanTag) => void }> = ({ tag: init, onClose, onSave }) => {
  const [tag, setTag] = useState<PlanTag>(init);
  const handle = (k: keyof PlanTag, v: any) => setTag(prev => ({ ...prev, [k]: v }));
  
  return (
    <Modal
      show={true}
      title={tag._id ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={()=>onSave(tag)}>Guardar</Button>
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
          value={tag.icon||''}
          onChange={(e) => handle('icon', e.target.value)}
          placeholder="Ej: ⚡"
        />
      </div>
    </Modal>
  );
}; 