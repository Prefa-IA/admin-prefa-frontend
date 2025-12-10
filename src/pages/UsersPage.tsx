import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import {
  Button,
  Card,
  Checkbox,
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

const UserStatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }`}
  >
    {isActive ? 'Sí' : 'No'}
  </span>
);

const PlanActionCell: React.FC<{
  isSuperAdmin: boolean;
  userIsSuperAdmin: boolean;
  onEditPlan: () => void;
}> = ({ isSuperAdmin, userIsSuperAdmin, onEditPlan }) => {
  if (!isSuperAdmin) return null;
  if (userIsSuperAdmin) {
    return (
      <TableCell>
        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
      </TableCell>
    );
  }
  return (
    <TableCell>
      <Button variant="secondary" size="sm" onClick={onEditPlan}>
        Asignar Plan
      </Button>
    </TableCell>
  );
};

const CreditsActionCell: React.FC<{
  isSuperAdmin: boolean;
  userIsSuperAdmin: boolean;
  onEditCredits: () => void;
}> = ({ isSuperAdmin, userIsSuperAdmin, onEditCredits }) => {
  if (!isSuperAdmin) return null;
  if (userIsSuperAdmin) {
    return (
      <TableCell>
        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
      </TableCell>
    );
  }
  return (
    <TableCell>
      <Button variant="secondary" size="sm" onClick={onEditCredits}>
        Asignar Créditos
      </Button>
    </TableCell>
  );
};

const UserActionsCell: React.FC<{
  isSuperAdmin: boolean;
  userIsSuperAdmin: boolean;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActivo: () => void;
}> = ({ isSuperAdmin, userIsSuperAdmin, isActive, onEdit, onDelete, onToggleActivo }) => {
  if (userIsSuperAdmin) {
    return (
      <TableCell align="right">
        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
      </TableCell>
    );
  }
  if (!isSuperAdmin) {
    return (
      <TableCell align="right">
        <span className="text-xs text-gray-400 dark:text-gray-500">Solo super admin</span>
      </TableCell>
    );
  }
  return (
    <TableCell align="right">
      <div className="flex items-center justify-end gap-1">
        <EditIconButton onClick={onEdit} />
        <DeleteIconButton onClick={onDelete} />
        <Button variant="secondary" size="sm" onClick={onToggleActivo}>
          {isActive ? 'Suspender' : 'Activar'}
        </Button>
      </div>
    </TableCell>
  );
};

const UserRow: React.FC<{
  usuario: Usuario;
  isSuperAdmin: boolean;
  onEditPlan: (u: Usuario) => void;
  onEditCredits: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onDelete: (u: Usuario) => void;
  onToggleActivo: (id: string, isActive: boolean) => void;
}> = ({ usuario, isSuperAdmin, onEditPlan, onEditCredits, onEdit, onDelete, onToggleActivo }) => (
  <TableRow key={usuario._id}>
    <TableCell className="font-medium">{usuario.nombre}</TableCell>
    <TableCell>{usuario.email}</TableCell>
    <TableCell>
      <UserStatusBadge isActive={usuario.isActive} />
    </TableCell>
    <TableCell className="hidden md:table-cell">
      {usuario.suscripcion?.nombrePlan || usuario.suscripcion?.tipo || '—'}
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      {usuario.creditBalance ?? usuario.consultasDisponibles ?? '—'}
    </TableCell>
    {isSuperAdmin && (
      <PlanActionCell
        isSuperAdmin={isSuperAdmin}
        userIsSuperAdmin={usuario.isSuperAdmin || false}
        onEditPlan={() => onEditPlan(usuario)}
      />
    )}
    {isSuperAdmin && (
      <CreditsActionCell
        isSuperAdmin={isSuperAdmin}
        userIsSuperAdmin={usuario.isSuperAdmin || false}
        onEditCredits={() => onEditCredits(usuario)}
      />
    )}
    <UserActionsCell
      isSuperAdmin={isSuperAdmin}
      userIsSuperAdmin={usuario.isSuperAdmin || false}
      isActive={usuario.isActive}
      onEdit={() => onEdit(usuario)}
      onDelete={() => onDelete(usuario)}
      onToggleActivo={() => {
        void onToggleActivo(usuario._id, usuario.isActive);
      }}
    />
  </TableRow>
);

const UsersTable: React.FC<{
  usuarios: Usuario[];
  isSuperAdmin: boolean;
  onEditPlan: (u: Usuario) => void;
  onEditCredits: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onDelete: (u: Usuario) => void;
  onToggleActivo: (id: string, isActive: boolean) => void;
}> = ({ usuarios, isSuperAdmin, onEditPlan, onEditCredits, onEdit, onDelete, onToggleActivo }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead className="hidden md:table-cell">Plan</TableHead>
          <TableHead className="hidden lg:table-cell">Créditos</TableHead>
          {isSuperAdmin && <TableHead className="hidden lg:table-cell">Acciones Plan</TableHead>}
          {isSuperAdmin && (
            <TableHead className="hidden lg:table-cell">Acciones Créditos</TableHead>
          )}
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={isSuperAdmin ? 8 : 6}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
              style={{ width: '100%' }}
            >
              No se encontraron usuarios
            </TableCell>
          </TableRow>
        ) : (
          usuarios.map((u) => (
            <UserRow
              key={u._id}
              usuario={u}
              isSuperAdmin={isSuperAdmin}
              onEditPlan={onEditPlan}
              onEditCredits={onEditCredits}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActivo={onToggleActivo}
            />
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const PlanModal: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  selectedPlan: string;
  suscripcionInterna: boolean;
  planes: Plan[];
  saving: boolean;
  onClose: () => void;
  onPlanChange: (plan: string) => void;
  onSuscripcionInternaChange: (checked: boolean) => void;
  onSave: () => void;
}> = ({
  show,
  editingUsuario,
  selectedPlan,
  suscripcionInterna,
  planes,
  saving,
  onClose,
  onPlanChange,
  onSuscripcionInternaChange,
  onSave,
}) => {
  if (!show) return null;
  return (
    <Modal show={true} title="Asignar Plan" onClose={onClose} size="md">
      <div className="space-y-4">
        <Select
          label="Plan"
          value={selectedPlan}
          onChange={(e) => onPlanChange(e.target.value)}
          options={[
            { value: '', label: 'Selecciona un plan' },
            ...planes.map((p) => ({
              value: p._id || p.id,
              label: p.name,
            })),
          ]}
        />
        <Checkbox
          label="Suscripción interna"
          checked={suscripcionInterna}
          onChange={(e) => onSuscripcionInternaChange(e.target.checked)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Si está marcado, el usuario podrá usar el servicio sin validar la suscripción de Mercado
          Pago
        </p>
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
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={saving || !selectedPlan}>
          {saving ? SAVING_TEXT : 'Asignar Plan'}
        </Button>
      </div>
    </Modal>
  );
};

const CreditsModal: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  creditsAmount: string;
  saving: boolean;
  onClose: () => void;
  onCreditsChange: (amount: string) => void;
  onSave: () => void;
}> = ({ show, editingUsuario, creditsAmount, saving, onClose, onCreditsChange, onSave }) => {
  if (!show) return null;
  return (
    <Modal show={true} title="Asignar Créditos" onClose={onClose} size="md">
      <div className="space-y-4">
        <Input
          label="Cantidad de créditos"
          type="number"
          value={creditsAmount}
          onChange={(e) => onCreditsChange(e.target.value)}
          placeholder="Ingresa la cantidad de créditos"
          min="1"
        />
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
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={saving || !creditsAmount}>
          {saving ? SAVING_TEXT : 'Asignar Créditos'}
        </Button>
      </div>
    </Modal>
  );
};

const EditUserModal: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  editFormData: { nombre: string; email: string };
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: { nombre: string; email: string }) => void;
  onSave: () => void;
}> = ({ show, editingUsuario, editFormData, saving, onClose, onFormDataChange, onSave }) => {
  if (!show) return null;
  return (
    <Modal show={true} title="Editar Usuario" onClose={onClose} size="md">
      <div className="space-y-4">
        <Input
          label="Nombre"
          value={editFormData.nombre}
          onChange={(e) => onFormDataChange({ ...editFormData, nombre: e.target.value })}
          required
          placeholder="Nombre completo"
        />
        <Input
          label="Email"
          type="email"
          value={editFormData.email}
          onChange={(e) => onFormDataChange({ ...editFormData, email: e.target.value })}
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
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={saving || !editFormData.nombre || !editFormData.email}>
          {saving ? SAVING_TEXT : 'Guardar Cambios'}
        </Button>
      </div>
    </Modal>
  );
};

interface UsuariosResponse {
  usuarios: Usuario[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const useUsers = (page: number, limit: number) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<UsuariosResponse>('/api/admin/usuarios', {
        params: { page, limit },
      });
      setUsuarios(res.data.usuarios);
      setPagination(res.data.pagination);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, pagination, loading, error, refetch: fetchUsuarios };
};

const usePlans = (isSuperAdmin: boolean) => {
  const [planes, setPlanes] = useState<Plan[]>([]);

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

  return planes;
};

const useUserState = () => {
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);
  return { editingUsuario, setEditingUsuario, saving, setSaving };
};

const useUserSaveHandlers = (
  editingUsuario: Usuario | null,
  refetch: () => Promise<void>,
  setEditingUsuario: (usuario: Usuario | null) => void,
  setSaving: (saving: boolean) => void
) => {
  const handleSaveEdit = useCallback(
    async (editFormData: { nombre: string; email: string }) => {
      if (!editingUsuario || !editFormData.nombre || !editFormData.email) {
        toast.error('Nombre y email son requeridos');
        return false;
      }

      setSaving(true);
      try {
        await axios.put(`/api/admin/usuarios/${editingUsuario._id}`, editFormData);
        toast.success('Usuario actualizado correctamente');
        setEditingUsuario(null);
        void refetch();
        return true;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || 'Error al actualizar usuario');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [editingUsuario, refetch, setEditingUsuario, setSaving]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!editingUsuario) return false;
    setSaving(true);
    try {
      await axios.delete(`/api/admin/usuarios/${editingUsuario._id}`);
      toast.success('Usuario eliminado correctamente');
      setEditingUsuario(null);
      void refetch();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
      return false;
    } finally {
      setSaving(false);
    }
  }, [editingUsuario, refetch, setEditingUsuario, setSaving]);

  return { handleSaveEdit, handleConfirmDelete };
};

const useUserPlanHandlers = (
  editingUsuario: Usuario | null,
  refetch: () => Promise<void>,
  setEditingUsuario: (usuario: Usuario | null) => void,
  setSaving: (saving: boolean) => void
) => {
  const handleSavePlan = useCallback(
    async (selectedPlan: string, suscripcionInterna: boolean, planes: Plan[]) => {
      if (!editingUsuario || !selectedPlan) {
        toast.error('Selecciona un plan');
        return false;
      }

      setSaving(true);
      try {
        const plan = planes.find((p) => p.id === selectedPlan || p._id === selectedPlan);
        const updateData: {
          plan?: string;
          nombrePlan?: string;
          fechaInicio?: string;
          fechaFin?: string;
          suscripcionInterna?: boolean;
        } = {};

        if (plan) {
          updateData.plan = plan._id || plan.id;
          updateData.nombrePlan = plan.name;
          const now = new Date();
          const fin = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          updateData.fechaInicio = now.toISOString();
          updateData.fechaFin = fin.toISOString();
        }

        updateData.suscripcionInterna = suscripcionInterna;

        await axios.patch(`/api/admin/usuarios/${editingUsuario._id}/plan`, updateData);
        toast.success('Plan asignado correctamente');
        setEditingUsuario(null);
        void refetch();
        return true;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || 'Error al asignar plan');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [editingUsuario, refetch, setEditingUsuario, setSaving]
  );

  const handleSaveCredits = useCallback(
    async (creditsAmount: string) => {
      if (!editingUsuario || !creditsAmount) {
        toast.error('Ingresa un monto válido');
        return false;
      }

      const monto = Number(creditsAmount);
      if (isNaN(monto) || monto <= 0) {
        toast.error('El monto debe ser un número positivo');
        return false;
      }

      setSaving(true);
      try {
        await axios.post(`/api/admin/usuarios/${editingUsuario._id}/creditos`, { monto });
        toast.success('Créditos asignados correctamente');
        setEditingUsuario(null);
        void refetch();
        return true;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || 'Error al asignar créditos');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [editingUsuario, refetch, setEditingUsuario, setSaving]
  );

  return { handleSavePlan, handleSaveCredits };
};

const useUserModalState = () => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [suscripcionInterna, setSuscripcionInterna] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState('');
  const [editFormData, setEditFormData] = useState({ nombre: '', email: '' });

  return {
    showPlanModal,
    setShowPlanModal,
    showCreditsModal,
    setShowCreditsModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedPlan,
    setSelectedPlan,
    suscripcionInterna,
    setSuscripcionInterna,
    creditsAmount,
    setCreditsAmount,
    editFormData,
    setEditFormData,
  };
};

const useUserHandlers = (
  setEditingUsuario: (usuario: Usuario | null) => void,
  setShowPlanModal: (show: boolean) => void,
  setShowCreditsModal: (show: boolean) => void,
  setShowEditModal: (show: boolean) => void,
  setShowDeleteModal: (show: boolean) => void,
  setSelectedPlan: (plan: string) => void,
  setSuscripcionInterna: (checked: boolean) => void,
  setCreditsAmount: (amount: string) => void,
  setEditFormData: (data: { nombre: string; email: string }) => void
) => {
  const handleEdit = useCallback(
    (usuario: Usuario) => {
      setEditingUsuario(usuario);
      setEditFormData({ nombre: usuario.nombre, email: usuario.email });
      setShowEditModal(true);
    },
    [setEditingUsuario, setEditFormData, setShowEditModal]
  );

  const handleDelete = useCallback(
    (usuario: Usuario) => {
      setEditingUsuario(usuario);
      setShowDeleteModal(true);
    },
    [setEditingUsuario, setShowDeleteModal]
  );

  const handleEditPlan = useCallback(
    (usuario: Usuario) => {
      setEditingUsuario(usuario);
      setSelectedPlan(usuario.suscripcion?.plan || usuario.suscripcion?.nombrePlan || '');
      setSuscripcionInterna(usuario.suscripcion?.suscripcionInterna || false);
      setShowPlanModal(true);
    },
    [setEditingUsuario, setSelectedPlan, setSuscripcionInterna, setShowPlanModal]
  );

  const handleEditCredits = useCallback(
    (usuario: Usuario) => {
      setEditingUsuario(usuario);
      setCreditsAmount('');
      setShowCreditsModal(true);
    },
    [setEditingUsuario, setCreditsAmount, setShowCreditsModal]
  );

  return { handleEdit, handleDelete, handleEditPlan, handleEditCredits };
};

const useUserActions = (refetch: () => Promise<void>) => {
  const { editingUsuario, setEditingUsuario, saving, setSaving } = useUserState();
  const [toToggleActivo, setToToggleActivo] = useState<{ id: string; isActive: boolean } | null>(
    null
  );
  const { handleSaveEdit, handleConfirmDelete } = useUserSaveHandlers(
    editingUsuario,
    refetch,
    setEditingUsuario,
    setSaving
  );
  const { handleSavePlan, handleSaveCredits } = useUserPlanHandlers(
    editingUsuario,
    refetch,
    setEditingUsuario,
    setSaving
  );

  const toggleActivo = useCallback((id: string, isActive: boolean) => {
    setToToggleActivo({ id, isActive });
  }, []);

  const handleConfirmToggleActivo = useCallback(async () => {
    if (!toToggleActivo) return;
    const { id, isActive } = toToggleActivo;
    const nuevoEstado = !isActive;
    try {
      await axios.patch(`/api/admin/usuarios/${id}/estado`, { isActive: nuevoEstado });
      setToToggleActivo(null);
      void refetch();
      toast.success(`Usuario ${nuevoEstado ? 'activado' : 'suspendido'} correctamente`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al actualizar usuario');
    }
  }, [toToggleActivo, refetch]);

  return {
    editingUsuario,
    setEditingUsuario,
    saving,
    toggleActivo,
    toToggleActivo,
    setToToggleActivo,
    handleConfirmToggleActivo,
    handleSaveEdit,
    handleConfirmDelete,
    handleSavePlan,
    handleSaveCredits,
  };
};

const createModalSaveHandler = (
  onSave: () => Promise<boolean>,
  onClose: () => void
): (() => void) => {
  return () => {
    const executeSave = async () => {
      const success = await onSave();
      if (success) {
        onClose();
      }
    };
    void executeSave();
  };
};

const PlanModalWrapper: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  selectedPlan: string;
  suscripcionInterna: boolean;
  planes: Plan[];
  saving: boolean;
  onClose: () => void;
  onPlanChange: (plan: string) => void;
  onSuscripcionInternaChange: (checked: boolean) => void;
  onSave: () => Promise<boolean>;
}> = ({
  show,
  editingUsuario,
  selectedPlan,
  suscripcionInterna,
  planes,
  saving,
  onClose,
  onPlanChange,
  onSuscripcionInternaChange,
  onSave,
}) => (
  <PlanModal
    show={show}
    editingUsuario={editingUsuario}
    selectedPlan={selectedPlan}
    suscripcionInterna={suscripcionInterna}
    planes={planes}
    saving={saving}
    onClose={onClose}
    onPlanChange={onPlanChange}
    onSuscripcionInternaChange={onSuscripcionInternaChange}
    onSave={createModalSaveHandler(onSave, onClose)}
  />
);

const CreditsModalWrapper: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  creditsAmount: string;
  saving: boolean;
  onClose: () => void;
  onCreditsChange: (amount: string) => void;
  onSave: () => Promise<boolean>;
}> = ({ show, editingUsuario, creditsAmount, saving, onClose, onCreditsChange, onSave }) => (
  <CreditsModal
    show={show}
    editingUsuario={editingUsuario}
    creditsAmount={creditsAmount}
    saving={saving}
    onClose={onClose}
    onCreditsChange={onCreditsChange}
    onSave={createModalSaveHandler(onSave, onClose)}
  />
);

const EditUserModalWrapper: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  editFormData: { nombre: string; email: string };
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: { nombre: string; email: string }) => void;
  onSave: () => Promise<boolean>;
}> = ({ show, editingUsuario, editFormData, saving, onClose, onFormDataChange, onSave }) => (
  <EditUserModal
    show={show}
    editingUsuario={editingUsuario}
    editFormData={editFormData}
    saving={saving}
    onClose={onClose}
    onFormDataChange={onFormDataChange}
    onSave={createModalSaveHandler(onSave, onClose)}
  />
);

const DeleteConfirmModalWrapper: React.FC<{
  show: boolean;
  editingUsuario: Usuario | null;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}> = ({ show, editingUsuario, onClose, onConfirm }) => (
  <ConfirmModal
    open={show}
    title="Eliminar Usuario"
    message={`¿Estás seguro de que deseas eliminar al usuario "${editingUsuario?.nombre}" (${editingUsuario?.email})?`}
    confirmText="Eliminar"
    cancelText="Cancelar"
    onConfirm={createModalSaveHandler(onConfirm, onClose)}
    onCancel={onClose}
  />
);

const UsersModals: React.FC<{
  showPlanModal: boolean;
  showCreditsModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  editingUsuario: Usuario | null;
  selectedPlan: string;
  suscripcionInterna: boolean;
  creditsAmount: string;
  editFormData: { nombre: string; email: string };
  saving: boolean;
  planes: Plan[];
  onClosePlanModal: () => void;
  onCloseCreditsModal: () => void;
  onCloseEditModal: () => void;
  onCloseDeleteModal: () => void;
  onPlanChange: (plan: string) => void;
  onSuscripcionInternaChange: (checked: boolean) => void;
  onCreditsChange: (amount: string) => void;
  onFormDataChange: (data: { nombre: string; email: string }) => void;
  onSavePlan: () => Promise<boolean>;
  onSaveCredits: () => Promise<boolean>;
  onSaveEdit: () => Promise<boolean>;
  onConfirmDelete: () => Promise<boolean>;
}> = (props) => (
  <>
    <PlanModalWrapper
      show={props.showPlanModal}
      editingUsuario={props.editingUsuario}
      selectedPlan={props.selectedPlan}
      suscripcionInterna={props.suscripcionInterna}
      planes={props.planes}
      saving={props.saving}
      onClose={props.onClosePlanModal}
      onPlanChange={props.onPlanChange}
      onSuscripcionInternaChange={props.onSuscripcionInternaChange}
      onSave={props.onSavePlan}
    />
    <CreditsModalWrapper
      show={props.showCreditsModal}
      editingUsuario={props.editingUsuario}
      creditsAmount={props.creditsAmount}
      saving={props.saving}
      onClose={props.onCloseCreditsModal}
      onCreditsChange={props.onCreditsChange}
      onSave={props.onSaveCredits}
    />
    <EditUserModalWrapper
      show={props.showEditModal}
      editingUsuario={props.editingUsuario}
      editFormData={props.editFormData}
      saving={props.saving}
      onClose={props.onCloseEditModal}
      onFormDataChange={props.onFormDataChange}
      onSave={props.onSaveEdit}
    />
    <DeleteConfirmModalWrapper
      show={props.showDeleteModal}
      editingUsuario={props.editingUsuario}
      onClose={props.onCloseDeleteModal}
      onConfirm={props.onConfirmDelete}
    />
  </>
);

const UsersPageContent: React.FC<{
  usuarios: Usuario[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  planes: Plan[];
  isSuperAdmin: boolean;
  query: string;
  page: number;
  PAGE_SIZE: number;
  editingUsuario: Usuario | null;
  saving: boolean;
  selectedPlan: string;
  suscripcionInterna: boolean;
  creditsAmount: string;
  editFormData: { nombre: string; email: string };
  showPlanModal: boolean;
  showCreditsModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onEditPlan: (usuario: Usuario) => void;
  onEditCredits: (usuario: Usuario) => void;
  onToggleActivo: (id: string, isActive: boolean) => void;
  onClosePlanModal: () => void;
  onCloseCreditsModal: () => void;
  onCloseEditModal: () => void;
  onCloseDeleteModal: () => void;
  onPlanChange: (plan: string) => void;
  onSuscripcionInternaChange: (checked: boolean) => void;
  onCreditsChange: (amount: string) => void;
  onFormDataChange: (data: { nombre: string; email: string }) => void;
  onSavePlan: () => Promise<boolean>;
  onSaveCredits: () => Promise<boolean>;
  onSaveEdit: () => Promise<boolean>;
  onConfirmDelete: () => Promise<boolean>;
  toToggleActivo: { id: string; isActive: boolean } | null;
  onCancelToggleActivo: () => void;
  onConfirmToggleActivo: () => void;
}> = (props) => {
  // Filtrar en cliente por ahora (idealmente debería hacerse en backend)
  const filtered = props.usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(props.query.toLowerCase()) ||
      u.email.toLowerCase().includes(props.query.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Usuarios" description="Gestiona los usuarios del sistema" />
      <FilterBar
        searchValue={props.query}
        onSearchChange={props.onQueryChange}
        searchPlaceholder="Buscar por nombre o email..."
      />
      <UsersTable
        usuarios={filtered}
        isSuperAdmin={props.isSuperAdmin}
        onEditPlan={props.onEditPlan}
        onEditCredits={props.onEditCredits}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        onToggleActivo={props.onToggleActivo}
      />
      {props.pagination.total > 0 && (
        <div className="mt-6">
          <Pagination
            total={props.pagination.total}
            current={props.pagination.page}
            pageSize={props.pagination.limit}
            onPageChange={props.onPageChange}
          />
        </div>
      )}
      <UsersModals
        showPlanModal={props.showPlanModal}
        showCreditsModal={props.showCreditsModal}
        showEditModal={props.showEditModal}
        showDeleteModal={props.showDeleteModal}
        editingUsuario={props.editingUsuario}
        selectedPlan={props.selectedPlan}
        suscripcionInterna={props.suscripcionInterna}
        creditsAmount={props.creditsAmount}
        editFormData={props.editFormData}
        saving={props.saving}
        planes={props.planes}
        onClosePlanModal={props.onClosePlanModal}
        onCloseCreditsModal={props.onCloseCreditsModal}
        onCloseEditModal={props.onCloseEditModal}
        onCloseDeleteModal={props.onCloseDeleteModal}
        onPlanChange={props.onPlanChange}
        onSuscripcionInternaChange={props.onSuscripcionInternaChange}
        onCreditsChange={props.onCreditsChange}
        onFormDataChange={props.onFormDataChange}
        onSavePlan={props.onSavePlan}
        onSaveCredits={props.onSaveCredits}
        onSaveEdit={props.onSaveEdit}
        onConfirmDelete={props.onConfirmDelete}
      />
      {props.toToggleActivo && (
        <ConfirmModal
          open={true}
          title={props.toToggleActivo.isActive ? 'Suspender Usuario' : 'Activar Usuario'}
          message={`¿Estás seguro de que deseas ${props.toToggleActivo.isActive ? 'suspender' : 'activar'} este usuario?`}
          confirmText={props.toToggleActivo.isActive ? 'Suspender' : 'Activar'}
          cancelText="Cancelar"
          onConfirm={props.onConfirmToggleActivo}
          onCancel={props.onCancelToggleActivo}
        />
      )}
    </div>
  );
};

const useUsersPageHandlers = (
  modalState: ReturnType<typeof useUserModalState>,
  setEditingUsuario: (usuario: Usuario | null) => void
) => {
  const createClosePlanModal = useCallback(() => {
    modalState.setShowPlanModal(false);
    setEditingUsuario(null);
    modalState.setSelectedPlan('');
    modalState.setSuscripcionInterna(false);
  }, [modalState, setEditingUsuario]);

  const createCloseCreditsModal = useCallback(() => {
    modalState.setShowCreditsModal(false);
    setEditingUsuario(null);
    modalState.setCreditsAmount('');
  }, [modalState, setEditingUsuario]);

  const createCloseEditModal = useCallback(() => {
    modalState.setShowEditModal(false);
    setEditingUsuario(null);
    modalState.setEditFormData({ nombre: '', email: '' });
  }, [modalState, setEditingUsuario]);

  const createCloseDeleteModal = useCallback(() => {
    modalState.setShowDeleteModal(false);
    setEditingUsuario(null);
  }, [modalState, setEditingUsuario]);

  return {
    createClosePlanModal,
    createCloseCreditsModal,
    createCloseEditModal,
    createCloseDeleteModal,
  };
};

const useUsersPageData = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const { usuarios, pagination, loading, error, refetch } = useUsers(page, PAGE_SIZE);
  const planes = usePlans(isSuperAdmin);

  return {
    isSuperAdmin,
    usuarios,
    pagination,
    loading,
    error,
    refetch,
    planes,
    query,
    setQuery,
    page,
    setPage,
    PAGE_SIZE,
  };
};

const UsersPageLoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
    </div>
  </div>
);

const UsersPageErrorState: React.FC<{ error: string }> = ({ error }) => (
  <Card>
    <div className="text-center py-8">
      <p className="text-red-600 dark:text-red-400">{error}</p>
    </div>
  </Card>
);

const useUsersPageModalHandlers = (
  modalState: ReturnType<typeof useUserModalState>,
  setEditingUsuario: (usuario: Usuario | null) => void
) => {
  const {
    createClosePlanModal,
    createCloseCreditsModal,
    createCloseEditModal,
    createCloseDeleteModal,
  } = useUsersPageHandlers(modalState, setEditingUsuario);
  return {
    createClosePlanModal,
    createCloseCreditsModal,
    createCloseEditModal,
    createCloseDeleteModal,
  };
};

const useUsersPageHandlersAndState = (refetch: () => Promise<void>) => {
  const modalState = useUserModalState();
  const {
    editingUsuario,
    setEditingUsuario,
    saving,
    toggleActivo,
    toToggleActivo,
    setToToggleActivo,
    handleConfirmToggleActivo,
    handleSaveEdit,
    handleConfirmDelete,
    handleSavePlan,
    handleSaveCredits,
  } = useUserActions(refetch);

  const { handleEdit, handleDelete, handleEditPlan, handleEditCredits } = useUserHandlers(
    setEditingUsuario,
    modalState.setShowPlanModal,
    modalState.setShowCreditsModal,
    modalState.setShowEditModal,
    modalState.setShowDeleteModal,
    modalState.setSelectedPlan,
    modalState.setSuscripcionInterna,
    modalState.setCreditsAmount,
    modalState.setEditFormData
  );

  const modalHandlers = useUsersPageModalHandlers(modalState, setEditingUsuario);
  const handleConfirmDeleteWrapper = useCallback((): Promise<boolean> => {
    return handleConfirmDelete();
  }, [handleConfirmDelete]);

  return {
    modalState,
    editingUsuario,
    saving,
    toggleActivo,
    toToggleActivo,
    setToToggleActivo,
    handleConfirmToggleActivo,
    handleEdit,
    handleDelete,
    handleEditPlan,
    handleEditCredits,
    ...modalHandlers,
    handleSavePlan,
    handleSaveCredits,
    handleSaveEdit,
    handleConfirmDelete: handleConfirmDeleteWrapper,
  };
};

const buildUsersPageContentProps = (
  data: ReturnType<typeof useUsersPageData>,
  handlers: ReturnType<typeof useUsersPageHandlersAndState>
) => {
  const baseProps = {
    usuarios: data.usuarios,
    pagination: data.pagination,
    planes: data.planes,
    isSuperAdmin: data.isSuperAdmin,
    query: data.query,
    page: data.page,
    PAGE_SIZE: data.PAGE_SIZE,
    editingUsuario: handlers.editingUsuario,
    saving: handlers.saving,
    selectedPlan: handlers.modalState.selectedPlan,
    suscripcionInterna: handlers.modalState.suscripcionInterna,
    creditsAmount: handlers.modalState.creditsAmount,
    editFormData: handlers.modalState.editFormData,
    showPlanModal: handlers.modalState.showPlanModal,
    showCreditsModal: handlers.modalState.showCreditsModal,
    showEditModal: handlers.modalState.showEditModal,
    showDeleteModal: handlers.modalState.showDeleteModal,
    onQueryChange: data.setQuery,
    onPageChange: data.setPage,
    onEdit: handlers.handleEdit,
    onDelete: handlers.handleDelete,
    onEditPlan: handlers.handleEditPlan,
    onEditCredits: handlers.handleEditCredits,
    onToggleActivo: handlers.toggleActivo,
    onClosePlanModal: handlers.createClosePlanModal,
    onCloseCreditsModal: handlers.createCloseCreditsModal,
    onCloseEditModal: handlers.createCloseEditModal,
    onCloseDeleteModal: handlers.createCloseDeleteModal,
    onPlanChange: handlers.modalState.setSelectedPlan,
    onSuscripcionInternaChange: handlers.modalState.setSuscripcionInterna,
    onCreditsChange: handlers.modalState.setCreditsAmount,
    onFormDataChange: handlers.modalState.setEditFormData,
  };
  const saveHandlers = {
    onSavePlan: async () =>
      handlers.handleSavePlan(
        handlers.modalState.selectedPlan,
        handlers.modalState.suscripcionInterna,
        data.planes
      ),
    onSaveCredits: async () => handlers.handleSaveCredits(handlers.modalState.creditsAmount),
    onSaveEdit: async () => handlers.handleSaveEdit(handlers.modalState.editFormData),
    onConfirmDelete: handlers.handleConfirmDelete,
  };
  const toggleActivoProps = {
    toToggleActivo: handlers.toToggleActivo,
    onCancelToggleActivo: () => handlers.setToToggleActivo(null),
    onConfirmToggleActivo: () => {
      void handlers.handleConfirmToggleActivo();
    },
  };
  return { ...baseProps, ...saveHandlers, ...toggleActivoProps };
};

const UsersPage: React.FC = () => {
  const data = useUsersPageData();
  const handlers = useUsersPageHandlersAndState(data.refetch);

  if (data.loading) {
    return <UsersPageLoadingState />;
  }

  if (data.error) {
    return <UsersPageErrorState error={data.error} />;
  }

  return <UsersPageContent {...buildUsersPageContentProps(data, handlers)} />;
};

export default UsersPage;
