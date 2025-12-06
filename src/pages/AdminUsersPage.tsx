import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

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
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

interface AdminUser {
  _id: string;
  email: string;
  nombre: string;
  role: string;
  isActive: boolean;
  isSuperAdmin?: boolean;
  adminRole?: string | null;
  permissions?: string[];
  createdAt?: string;
}

interface RoleInfo {
  roles: string[];
  permissions: string[];
  rolePermissions: Record<string, string[]>;
}

const hashPassword = async (password: string): Promise<string> => {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const AdminUsersTable: React.FC<{
  admins: AdminUser[];
  onEdit: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
}> = ({ admins, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="hidden md:table-cell">Rol / Admin Role</TableHead>
          <TableHead className="hidden lg:table-cell">Super Admin</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden md:table-cell">Fecha creación</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No se encontraron administradores
            </TableCell>
          </TableRow>
        ) : (
          admins.map((admin) => (
            <TableRow key={admin._id}>
              <TableCell className="font-medium">{admin.nombre}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-row gap-1">
                  {admin.isSuperAdmin ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                      super admin
                    </span>
                  ) : admin.adminRole ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 w-fit">
                      {admin.adminRole}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                      {admin.role}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {admin.isSuperAdmin ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    Sí
                  </span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    admin.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {admin.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-AR') : '—'}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-1">
                  <EditIconButton onClick={() => onEdit(admin)} />
                  {admin.isSuperAdmin ? null : <DeleteIconButton onClick={() => onDelete(admin)} />}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const AdminFormModal: React.FC<{
  show: boolean;
  selectedAdmin: AdminUser | null;
  formData: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  };
  isSuperAdmin: boolean;
  roleInfo: RoleInfo | null;
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  }) => void;
  onSave: () => void;
}> = ({
  show,
  selectedAdmin,
  formData,
  isSuperAdmin,
  roleInfo,
  saving,
  onClose,
  onFormDataChange,
  onSave,
}) => {
  if (!show) return null;

  const resetForm = () => {
    onFormDataChange({
      nombre: '',
      email: '',
      password: '',
      isSuperAdmin: false,
      adminRole: null,
      permissions: [],
    });
  };

  return (
    <Modal
      show={true}
      title={selectedAdmin ? 'Editar administrador' : 'Nuevo administrador'}
      onClose={() => {
        onClose();
        resetForm();
      }}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
            {selectedAdmin ? 'Actualizar' : 'Crear'}
          </Button>
        </>
      }
    >
      <AdminFormContent
        formData={formData}
        selectedAdmin={selectedAdmin}
        isSuperAdmin={isSuperAdmin}
        roleInfo={roleInfo}
        onFormDataChange={onFormDataChange}
      />
    </Modal>
  );
};

const AdminFormContent: React.FC<{
  formData: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  };
  selectedAdmin: AdminUser | null;
  isSuperAdmin: boolean;
  roleInfo: RoleInfo | null;
  onFormDataChange: (data: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  }) => void;
}> = ({ formData, selectedAdmin, isSuperAdmin, roleInfo, onFormDataChange }) => {
  const updateFormData = useCallback(
    (updates: Partial<typeof formData>) => {
      onFormDataChange({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        isSuperAdmin: formData.isSuperAdmin,
        adminRole: formData.adminRole,
        permissions: formData.permissions,
        ...updates,
      });
    },
    [formData, onFormDataChange]
  );

  return (
    <div className="space-y-4">
      <Input
        name="nombre"
        label="Nombre"
        value={formData.nombre}
        onChange={(e) => updateFormData({ nombre: e.target.value })}
        required
        placeholder="Nombre completo"
      />
      <Input
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
        required
        placeholder="admin@ejemplo.com"
      />
      <Input
        name="password"
        label={
          selectedAdmin ? 'Nueva contraseña (dejar vacío para mantener la actual)' : 'Contraseña'
        }
        type="password"
        value={formData.password}
        onChange={(e) => updateFormData({ password: e.target.value })}
        required={!selectedAdmin}
        placeholder="••••••••"
      />
      {isSuperAdmin && (
        <SuperAdminFields
          formData={formData}
          roleInfo={roleInfo}
          onFormDataChange={onFormDataChange}
        />
      )}
    </div>
  );
};

const SuperAdminFields: React.FC<{
  formData: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  };
  roleInfo: RoleInfo | null;
  onFormDataChange: (data: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  }) => void;
}> = ({ formData, roleInfo, onFormDataChange }) => {
  const updateFormData = useCallback(
    (updates: Partial<Pick<typeof formData, 'isSuperAdmin' | 'adminRole' | 'permissions'>>) => {
      onFormDataChange({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        isSuperAdmin: formData.isSuperAdmin,
        adminRole: formData.adminRole,
        permissions: formData.permissions,
        ...updates,
      });
    },
    [formData, onFormDataChange]
  );

  const handleRoleChange = (selectedRole: string | null) => {
    const rolePermissions = roleInfo?.rolePermissions;
    if (!selectedRole || !rolePermissions || !Object.hasOwn(rolePermissions, selectedRole)) {
      updateFormData({ adminRole: selectedRole, permissions: formData.permissions });
      return;
    }
    const rolePerms = Object.hasOwn(rolePermissions, selectedRole)
      ? Object.getOwnPropertyDescriptor(rolePermissions, selectedRole)?.value
      : undefined;
    const newPermissions = Array.isArray(rolePerms) ? rolePerms : [];
    updateFormData({ adminRole: selectedRole, permissions: newPermissions });
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    updateFormData({
      permissions: checked
        ? [...formData.permissions, permission]
        : formData.permissions.filter((p) => p !== permission),
    });
  };

  return (
    <>
      <Checkbox
        label="Super Administrador"
        checked={formData.isSuperAdmin}
        onChange={(e) => {
          const isSuper = e.target.checked;
          updateFormData({
            isSuperAdmin: isSuper,
            adminRole: isSuper ? null : formData.adminRole,
            permissions: isSuper ? [] : formData.permissions,
          });
        }}
      />
      {!formData.isSuperAdmin && roleInfo && (
        <>
          <Select
            label="Rol del Administrador"
            value={formData.adminRole || ''}
            onChange={(e) => handleRoleChange(e.target.value || null)}
            options={[
              { value: '', label: 'Sin rol predefinido (permisos personalizados)' },
              ...roleInfo.roles.map((role) => ({
                value: role,
                label: role.charAt(0).toUpperCase() + role.slice(1),
              })),
            ]}
          />
          <PermissionsSelector
            permissions={roleInfo.permissions}
            selectedPermissions={formData.permissions}
            onPermissionToggle={handlePermissionToggle}
          />
        </>
      )}
    </>
  );
};

const PERMISSION_LABELS: Record<string, string> = {
  'dashboard.view': 'Ver Dashboard',
  'users.view': 'Ver Usuarios',
  'users.edit': 'Editar Usuarios',
  'users.delete': 'Eliminar Usuarios',
  'admins.view': 'Ver Administradores',
  'admins.create': 'Crear Administradores',
  'admins.edit': 'Editar Administradores',
  'admins.delete': 'Eliminar Administradores',
  'plans.view': 'Ver Planes',
  'plans.edit': 'Editar Planes',
  'billing.view': 'Ver Facturación',
  'billing.edit': 'Editar Facturación',
  'reports.view': 'Ver Informes',
  'normativa.view': 'Ver Normativa',
  'normativa.edit': 'Editar Normativa',
  'config.view': 'Ver Configuración',
  'config.edit': 'Editar Configuración',
};

const PermissionsSelector: React.FC<{
  permissions: string[];
  selectedPermissions: string[];
  onPermissionToggle: (permission: string, checked: boolean) => void;
}> = ({ permissions, selectedPermissions, onPermissionToggle }) => (
  <div className="space-y-2">
    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300">Permisos</div>
    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg border-gray-300 dark:border-gray-600">
      {permissions.map((permission) => {
        const permissionLabel = Object.hasOwn(PERMISSION_LABELS, permission)
          ? Object.getOwnPropertyDescriptor(PERMISSION_LABELS, permission)?.value
          : undefined;
        const label = permissionLabel || permission;
        return (
          <Checkbox
            key={permission}
            label={label}
            checked={selectedPermissions.includes(permission)}
            onChange={(e) => onPermissionToggle(permission, e.target.checked)}
          />
        );
      })}
    </div>
  </div>
);

const useAdmins = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<AdminUser[]>('/api/admin/admins');
      setAdmins(res.data);
      setHasFetched(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      void fetchAdmins();
    }
  }, [hasFetched, fetchAdmins]);

  const refetch = useCallback(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  return { admins, loading, refetch };
};

const useRoleInfo = (isSuperAdmin: boolean) => {
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isSuperAdmin) return;

      try {
        const res = await axios.get<RoleInfo>('/api/admin/admins/roles');
        setRoleInfo(res.data);
      } catch (err: unknown) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            'Error desconocido al cargar roles'
          : err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'Error desconocido al cargar roles';

        console.error('Error al cargar roles:', errorMessage);
      }
    };
    void fetchRoles();
  }, [isSuperAdmin]);

  return roleInfo;
};

const useAdminFormState = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    isSuperAdmin: false,
    adminRole: null as string | null,
    permissions: [] as string[],
  });

  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      isSuperAdmin: false,
      adminRole: null,
      permissions: [],
    });
  }, []);

  return { formData, setFormData, resetForm };
};

const useAdminPayloadBuilders = (
  formData: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  },
  isSuperAdmin: boolean
) => {
  const buildUpdatePayload = useCallback(async (): Promise<{
    nombre: string;
    email: string;
    password?: string;
    isSuperAdmin?: boolean;
    adminRole?: string | null;
    permissions?: string[];
  }> => {
    const payload: {
      nombre: string;
      email: string;
      password?: string;
      isSuperAdmin?: boolean;
      adminRole?: string | null;
      permissions?: string[];
    } = { nombre: formData.nombre, email: formData.email };
    if (formData.password) {
      payload.password = await hashPassword(formData.password);
    }
    if (isSuperAdmin) {
      payload.isSuperAdmin = formData.isSuperAdmin;
      payload.adminRole = formData.adminRole;
      payload.permissions = formData.permissions;
    }
    return payload;
  }, [formData, isSuperAdmin]);

  const buildCreatePayload = useCallback(async () => {
    const hashHex = await hashPassword(formData.password);
    return {
      nombre: formData.nombre,
      email: formData.email,
      password: hashHex,
      role: 'admin',
      isActive: true,
      isSuperAdmin: isSuperAdmin ? formData.isSuperAdmin : false,
      adminRole: formData.adminRole,
      permissions: formData.permissions,
    };
  }, [formData, isSuperAdmin]);

  return { buildUpdatePayload, buildCreatePayload };
};

const useAdminHandlers = (
  formData: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  },
  selectedAdmin: AdminUser | null,
  buildUpdatePayload: () => Promise<{
    nombre: string;
    email: string;
    password?: string;
    isSuperAdmin?: boolean;
    adminRole?: string | null;
    permissions?: string[];
  }>,
  buildCreatePayload: () => Promise<unknown>,
  resetForm: () => void,
  refetch: () => void,
  setSaving: (saving: boolean) => void
) => {
  const handleSave = useCallback(async () => {
    if (!formData.nombre || !formData.email) {
      toast.error('Nombre y email son requeridos');
      return false;
    }

    if (!selectedAdmin && !formData.password) {
      toast.error('La contraseña es requerida para nuevos administradores');
      return false;
    }

    setSaving(true);
    try {
      if (selectedAdmin) {
        const payload = await buildUpdatePayload();
        await axios.put(`/api/admin/admins/${selectedAdmin._id}`, payload);
        toast.success('Administrador actualizado correctamente');
      } else {
        const payload = await buildCreatePayload();
        await axios.post('/api/admin/admins', payload);
        toast.success('Administrador creado correctamente');
      }
      resetForm();
      void refetch();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al guardar administrador');
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    formData,
    selectedAdmin,
    buildUpdatePayload,
    buildCreatePayload,
    resetForm,
    refetch,
    setSaving,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedAdmin) return false;
    try {
      await axios.delete(`/api/admin/admins/${selectedAdmin._id}`);
      toast.success('Administrador eliminado correctamente');
      void refetch();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al eliminar administrador');
      return false;
    }
  }, [selectedAdmin, refetch]);

  return { handleSave, handleConfirmDelete };
};

const useAdminActions = (isSuperAdmin: boolean, refetch: () => void) => {
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const { formData, setFormData, resetForm } = useAdminFormState();
  const [saving, setSaving] = useState(false);
  const { buildUpdatePayload, buildCreatePayload } = useAdminPayloadBuilders(
    formData,
    isSuperAdmin
  );

  const { handleSave, handleConfirmDelete } = useAdminHandlers(
    formData,
    selectedAdmin,
    buildUpdatePayload,
    buildCreatePayload,
    resetForm,
    refetch,
    setSaving
  );

  const handleCreate = useCallback(() => {
    setSelectedAdmin(null);
    resetForm();
  }, [resetForm]);

  const handleEdit = useCallback(
    (admin: AdminUser) => {
      setSelectedAdmin(admin);
      setFormData({
        nombre: admin.nombre,
        email: admin.email,
        password: '',
        isSuperAdmin: admin.isSuperAdmin || false,
        adminRole: admin.adminRole || null,
        permissions: admin.permissions || [],
      });
    },
    [setFormData]
  );

  const handleDelete = useCallback((admin: AdminUser) => {
    setSelectedAdmin(admin);
  }, []);

  const handleConfirmDeleteWrapper = useCallback(async (): Promise<boolean> => {
    const result = await handleConfirmDelete();
    if (result) {
      setSelectedAdmin(null);
    }
    return result;
  }, [handleConfirmDelete]);

  return {
    selectedAdmin,
    setSelectedAdmin,
    formData,
    setFormData,
    saving,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    handleConfirmDelete: handleConfirmDeleteWrapper,
  };
};

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando administradores...</p>
    </div>
  </div>
);

const AdminUsersPageContent: React.FC<{
  admins: AdminUser[];
  query: string;
  onQueryChange: (query: string) => void;
  isSuperAdmin: boolean;
  roleInfo: RoleInfo | null;
  selectedAdmin: AdminUser | null;
  formData: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  };
  saving: boolean;
  showModal: boolean;
  showDeleteModal: boolean;
  onCreate: () => void;
  onEdit: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
  onCloseModal: () => void;
  onCloseDeleteModal: () => void;
  onFormDataChange: (data: {
    nombre: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    adminRole: string | null;
    permissions: string[];
  }) => void;
  onSave: () => Promise<boolean>;
  onConfirmDelete: () => Promise<boolean>;
}> = ({
  admins,
  query,
  onQueryChange,
  isSuperAdmin,
  roleInfo,
  selectedAdmin,
  formData,
  saving,
  showModal,
  showDeleteModal,
  onCreate,
  onEdit,
  onDelete,
  onCloseModal,
  onCloseDeleteModal,
  onFormDataChange,
  onSave,
  onConfirmDelete,
}) => {
  const filtered = admins.filter(
    (a) =>
      a.nombre.toLowerCase().includes(query.toLowerCase()) ||
      a.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Administradores"
        description="Gestiona los administradores del sistema"
        actions={<NewItemButton label="Nuevo administrador" onClick={onCreate} />}
      />

      <FilterBar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Buscar por nombre o email..."
      />

      <AdminUsersTable admins={filtered} onEdit={onEdit} onDelete={onDelete} />

      <AdminFormModal
        show={showModal}
        selectedAdmin={selectedAdmin}
        formData={formData}
        isSuperAdmin={isSuperAdmin}
        roleInfo={roleInfo}
        saving={saving}
        onClose={onCloseModal}
        onFormDataChange={onFormDataChange}
        onSave={() => {
          void (async () => {
            const success = await onSave();
            if (success) {
              onCloseModal();
            }
          })();
        }}
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Eliminar administrador"
        message={`¿Estás seguro de que deseas eliminar al administrador "${selectedAdmin?.nombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          const executeConfirm = async (): Promise<void> => {
            const success = await onConfirmDelete();
            if (success) {
              onCloseDeleteModal();
            }
          };
          void executeConfirm();
        }}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const { admins, loading, refetch } = useAdmins();
  const roleInfo = useRoleInfo(isSuperAdmin);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    selectedAdmin,
    setSelectedAdmin,
    formData,
    setFormData,
    saving,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    handleConfirmDelete,
  } = useAdminActions(isSuperAdmin, refetch);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AdminUsersPageContent
      admins={admins}
      query={query}
      onQueryChange={setQuery}
      isSuperAdmin={isSuperAdmin}
      roleInfo={roleInfo}
      selectedAdmin={selectedAdmin}
      formData={formData}
      saving={saving}
      showModal={showModal}
      showDeleteModal={showDeleteModal}
      onCreate={() => {
        handleCreate();
        setShowModal(true);
      }}
      onEdit={(admin) => {
        handleEdit(admin);
        setShowModal(true);
      }}
      onDelete={(admin) => {
        handleDelete(admin);
        setShowDeleteModal(true);
      }}
      onCloseModal={() => {
        setShowModal(false);
        setSelectedAdmin(null);
      }}
      onCloseDeleteModal={() => {
        setShowDeleteModal(false);
        setSelectedAdmin(null);
      }}
      onFormDataChange={setFormData}
      onSave={handleSave}
      onConfirmDelete={handleConfirmDelete}
    />
  );
};

export default AdminUsersPage;
