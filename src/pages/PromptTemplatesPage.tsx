import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import PromptTemplateModal from '../components/modals/PromptTemplateModal';
import NewItemButton from '../components/NewItemButton';
import {
  Button,
  Card,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { PromptTemplate } from '../types/prompts';

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
    void fetchData();
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
      void fetchData();
    } catch (err) {
      console.error(err);
      alert('Error guardando plantilla');
    }
  };

  const handleActivate = async (tpl: PromptTemplate) => {
    if (!tpl._id) return;
    try {
      await axios.put(`/api/prompts/${tpl._id}/activate`);
      void fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    try {
      await axios.delete(`/api/prompts/${toDelete._id}`);
      setToDelete(null);
      void fetchData();
    } catch (err) {
      console.error(err);
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
        title="Plantillas de Prompt"
        description="Gestiona las plantillas de prompts del sistema"
        actions={<NewItemButton label="Nueva plantilla" onClick={() => setShowModal(true)} />}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Versión</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No hay plantillas registradas
                </TableCell>
              </TableRow>
            ) : (
              templates.map((tpl) => {
                const activo = tpl.activo ?? tpl.isActive;
                const nombre = tpl.nombre || tpl.name;
                return (
                  <TableRow key={tpl._id}>
                    <TableCell className="font-medium">{nombre}</TableCell>
                    <TableCell>{tpl.version}</TableCell>
                    <TableCell>
                      {activo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Activo
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            void handleActivate(tpl);
                          }}
                        >
                          Activar
                        </Button>
                        <EditIconButton
                          onClick={() => {
                            setEditing(tpl);
                            setShowModal(true);
                          }}
                        />
                        <DeleteIconButton onClick={() => setToDelete(tpl)} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {showModal && (
        <PromptTemplateModal
          initialData={editing || undefined}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={(tpl) => {
            void handleSave(tpl);
          }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar plantilla"
          message={`¿Seguro que deseas eliminar "${toDelete.nombre || toDelete.name}"?`}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            void handleDelete();
          }}
        />
      )}
    </div>
  );
};

export default PromptTemplatesPage;
