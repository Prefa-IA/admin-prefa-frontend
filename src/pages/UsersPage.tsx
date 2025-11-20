import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import {
  Button,
  Card,
  FilterBar,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { Usuario } from '../types/usuarios';

interface Plan {
  _id?: string;
  id: string;
  name: string;
  creditosTotales?: number;
}

const SAVING_TEXT = 'Guardando...';

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [hasFetched, setHasFetched] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [creditsAmount, setCreditsAmount] = useState('');
  const [editFormData, setEditFormData] = useState({ nombre: '', email: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<Usuario[]>('/api/admin/usuarios');
      setUsuarios(res.data);
      setHasFetched(true);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      void fetchUsuarios();
    }
  }, [hasFetched, fetchUsuarios]);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await axios.get<Plan[]>('/api/admin/billing/planes');
        setPlanes(res.data);
      } catch (err) {
        console.error('Error al cargar planes:', err);
      }
    };
    if (isSuperAdmin) {
      void fetchPlanes();
    }
  }, [isSuperAdmin]);

  const toggleActivo = async (id: string, isActive: boolean) => {
    try {
      await axios.patch(`/api/admin/usuarios/${id}/estado`, { isActive: !isActive });
      void fetchUsuarios();
      toast.success('Estado del usuario actualizado');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setEditFormData({ nombre: usuario.nombre, email: usuario.email });
    setShowEditModal(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUsuario || !editFormData.nombre || !editFormData.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`/api/admin/usuarios/${editingUsuario._id}`, editFormData);
      toast.success('Usuario actualizado correctamente');
      setShowEditModal(false);
      setEditingUsuario(null);
      setEditFormData({ nombre: '', email: '' });
      void fetchUsuarios();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingUsuario) return;
    setSaving(true);
    try {
      await axios.delete(`/api/admin/usuarios/${editingUsuario._id}`);
      toast.success('Usuario eliminado correctamente');
      setShowDeleteModal(false);
      setEditingUsuario(null);
      void fetchUsuarios();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPlan = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setSelectedPlan(usuario.suscripcion?.plan || usuario.suscripcion?.nombrePlan || '');
    setShowPlanModal(true);
  };

  const handleEditCredits = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setCreditsAmount('');
    setShowCreditsModal(true);
  };

  const handleSavePlan = async () => {
    if (!editingUsuario || !selectedPlan) {
      toast.error('Selecciona un plan');
      return;
    }

    setSaving(true);
    try {
      const plan = planes.find((p) => p.id === selectedPlan || p._id === selectedPlan);
      const updateData: {
        plan?: string;
        nombrePlan?: string;
        fechaInicio?: string;
        fechaFin?: string;
      } = {};

      if (plan) {
        updateData.plan = plan._id || plan.id;
        updateData.nombrePlan = plan.name;
        const now = new Date();
        const fin = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 días
        updateData.fechaInicio = now.toISOString();
        updateData.fechaFin = fin.toISOString();
      }

      await axios.patch(`/api/admin/usuarios/${editingUsuario._id}/plan`, updateData);
      toast.success('Plan asignado correctamente');
      setShowPlanModal(false);
      setEditingUsuario(null);
      void fetchUsuarios();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al asignar plan');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCredits = async () => {
    if (!editingUsuario || !creditsAmount) {
      toast.error('Ingresa un monto válido');
      return;
    }

    const monto = Number(creditsAmount);
    if (isNaN(monto) || monto <= 0) {
      toast.error('El monto debe ser un número positivo');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`/api/admin/usuarios/${editingUsuario._id}/creditos`, { monto });
      toast.success('Créditos asignados correctamente');
      setShowCreditsModal(false);
      setEditingUsuario(null);
      setCreditsAmount('');
      void fetchUsuarios();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al asignar créditos');
    } finally {
      setSaving(false);
    }
  };

  const filtered = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Usuarios" description="Gestiona los usuarios del sistema" />

      <FilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por nombre o email..."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Créditos</TableHead>
              {isSuperAdmin && <TableHead>Acciones Plan</TableHead>}
              {isSuperAdmin && <TableHead>Acciones Créditos</TableHead>}
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSuperAdmin ? 8 : 6}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.nombre}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {u.isActive ? 'Sí' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>{u.suscripcion?.nombrePlan || u.suscripcion?.tipo || '—'}</TableCell>
                  <TableCell>{u.creditBalance ?? u.consultasDisponibles ?? '—'}</TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      {u.isSuperAdmin ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleEditPlan(u)}>
                          Asignar Plan
                        </Button>
                      )}
                    </TableCell>
                  )}
                  {isSuperAdmin && (
                    <TableCell>
                      {u.isSuperAdmin ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleEditCredits(u)}>
                          Asignar Créditos
                        </Button>
                      )}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    {u.isSuperAdmin ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                    ) : isSuperAdmin ? (
                      <div className="flex items-center justify-end gap-1">
                        <EditIconButton onClick={() => handleEdit(u)} />
                        <DeleteIconButton onClick={() => handleDelete(u)} />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            void toggleActivo(u._id, u.isActive);
                          }}
                        >
                          {u.isActive ? 'Suspender' : 'Activar'}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Solo super admin
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filtered.length > 0 && (
          <div className="mt-6">
            <Pagination
              total={filtered.length}
              current={page}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Modal para asignar plan */}
      <Modal
        show={showPlanModal}
        title="Asignar Plan"
        onClose={() => {
          setShowPlanModal(false);
          setEditingUsuario(null);
          setSelectedPlan('');
        }}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Select
              label="Plan"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              options={[
                { value: '', label: 'Selecciona un plan' },
                ...planes.map((p) => ({
                  value: p._id || p.id,
                  label: p.name,
                })),
              ]}
            />
          </div>
          {editingUsuario && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Usuario:</strong> {editingUsuario.nombre} ({editingUsuario.email})
              </p>
              <p className="mt-1">
                <strong>Plan actual:</strong> {editingUsuario.suscripcion?.nombrePlan || 'Sin plan'}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => {
              setShowPlanModal(false);
              setEditingUsuario(null);
              setSelectedPlan('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              void handleSavePlan();
            }}
            disabled={saving || !selectedPlan}
          >
            {saving ? SAVING_TEXT : 'Asignar Plan'}
          </Button>
        </div>
      </Modal>

      {/* Modal para asignar créditos */}
      <Modal
        show={showCreditsModal}
        title="Asignar Créditos"
        onClose={() => {
          setShowCreditsModal(false);
          setEditingUsuario(null);
          setCreditsAmount('');
        }}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="credits-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cantidad de créditos
            </label>
            <Input
              id="credits-amount"
              type="number"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(e.target.value)}
              placeholder="Ingresa la cantidad de créditos"
              min="1"
            />
          </div>
          {editingUsuario && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Usuario:</strong> {editingUsuario.nombre} ({editingUsuario.email})
              </p>
              <p className="mt-1">
                <strong>Créditos actuales:</strong> {editingUsuario.creditBalance ?? 0}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreditsModal(false);
              setEditingUsuario(null);
              setCreditsAmount('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              void handleSaveCredits();
            }}
            disabled={saving || !creditsAmount}
          >
            {saving ? SAVING_TEXT : 'Asignar Créditos'}
          </Button>
        </div>
      </Modal>

      {/* Modal para editar usuario */}
      <Modal
        show={showEditModal}
        title="Editar Usuario"
        onClose={() => {
          setShowEditModal(false);
          setEditingUsuario(null);
          setEditFormData({ nombre: '', email: '' });
        }}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={editFormData.nombre}
            onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
            required
            placeholder="Nombre completo"
          />
          <Input
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            required
            placeholder="usuario@ejemplo.com"
          />
          {editingUsuario && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>ID:</strong> {editingUsuario._id}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditModal(false);
              setEditingUsuario(null);
              setEditFormData({ nombre: '', email: '' });
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              void handleSaveEdit();
            }}
            disabled={saving || !editFormData.nombre || !editFormData.email}
          >
            {saving ? SAVING_TEXT : 'Guardar Cambios'}
          </Button>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={showDeleteModal}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${editingUsuario?.nombre}" (${editingUsuario?.email})?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setEditingUsuario(null);
        }}
      />
    </div>
  );
};

export default UsersPage;
