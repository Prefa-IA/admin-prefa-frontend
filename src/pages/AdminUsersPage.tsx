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

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    isSuperAdmin: false,
    adminRole: null as string | null,
    permissions: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);

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

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isSuperAdmin) return;
      try {
        const res = await axios.get<RoleInfo>('/api/admin/admins/roles');
        setRoleInfo(res.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        console.error('Error al cargar roles:', error.response?.data?.error);
      }
    };
    void fetchRoles();
  }, [isSuperAdmin]);

  const handleCreate = () => {
    setSelectedAdmin(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      isSuperAdmin: false,
      adminRole: null,
      permissions: [],
    });
    setShowModal(true);
  };

  const handleEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      email: admin.email,
      password: '',
      isSuperAdmin: admin.isSuperAdmin || false,
      adminRole: admin.adminRole || null,
      permissions: admin.permissions || [],
    });
    setShowModal(true);
  };

  const handleDelete = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    if (!selectedAdmin && !formData.password) {
      toast.error('La contraseña es requerida para nuevos administradores');
      return;
    }

    setSaving(true);
    try {
      if (selectedAdmin) {
        interface UpdatePayload {
          nombre: string;
          email: string;
          password?: string;
          isSuperAdmin?: boolean;
          adminRole?: string | null;
          permissions?: string[];
        }
        const payload: UpdatePayload = { nombre: formData.nombre, email: formData.email };
        if (formData.password) {
          const enc = new TextEncoder().encode(formData.password);
          const buf = await crypto.subtle.digest('SHA-256', enc);
          payload.password = Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        }
        if (isSuperAdmin) {
          payload.isSuperAdmin = formData.isSuperAdmin;
          payload.adminRole = formData.adminRole;
          payload.permissions = formData.permissions;
        }
        await axios.put(`/api/admin/admins/${selectedAdmin._id}`, payload);
        toast.success('Administrador actualizado correctamente');
      } else {
        // Crear nuevo admin
        const enc = new TextEncoder().encode(formData.password);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        const hashHex = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        await axios.post('/api/admin/admins', {
          nombre: formData.nombre,
          email: formData.email,
          password: hashHex,
          role: 'admin',
          isActive: true,
          isSuperAdmin: isSuperAdmin ? formData.isSuperAdmin : false,
          adminRole: formData.adminRole,
          permissions: formData.permissions,
        });
        toast.success('Administrador creado correctamente');
      }
      setShowModal(false);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        isSuperAdmin: false,
        adminRole: null,
        permissions: [],
      });
      void fetchAdmins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al guardar administrador');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await axios.delete(`/api/admin/admins/${selectedAdmin._id}`);
      toast.success('Administrador eliminado correctamente');
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      void fetchAdmins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Error al eliminar administrador');
    }
  };

  const filtered = admins.filter(
    (a) =>
      a.nombre.toLowerCase().includes(query.toLowerCase()) ||
      a.email.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando administradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Administradores"
        description="Gestiona los administradores del sistema"
        actions={<NewItemButton label="Nuevo administrador" onClick={handleCreate} />}
      />

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
              <TableHead>Rol / Admin Role</TableHead>
              <TableHead>Super Admin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No se encontraron administradores
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.nombre}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-row gap-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                        {admin.isSuperAdmin ? 'super admin' : admin.role}
                      </span>
                      {admin.adminRole && !admin.isSuperAdmin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 w-fit">
                          {admin.adminRole}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-AR') : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <EditIconButton onClick={() => handleEdit(admin)} />
                      {admin.isSuperAdmin ? null : (
                        <DeleteIconButton onClick={() => handleDelete(admin)} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de creación/edición */}
      {showModal && (
        <Modal
          show={true}
          title={selectedAdmin ? 'Editar administrador' : 'Nuevo administrador'}
          onClose={() => {
            setShowModal(false);
            setFormData({
              nombre: '',
              email: '',
              password: '',
              isSuperAdmin: false,
              adminRole: null,
              permissions: [],
            });
          }}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    nombre: '',
                    email: '',
                    password: '',
                    isSuperAdmin: false,
                    adminRole: null,
                    permissions: [],
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  void handleSave();
                }}
                disabled={saving}
                isLoading={saving}
              >
                {selectedAdmin ? 'Actualizar' : 'Crear'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Nombre completo"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="admin@ejemplo.com"
            />
            <Input
              label={
                selectedAdmin
                  ? 'Nueva contraseña (dejar vacío para mantener la actual)'
                  : 'Contraseña'
              }
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedAdmin}
              placeholder="••••••••"
            />
            {isSuperAdmin && (
              <>
                <Checkbox
                  label="Super Administrador"
                  checked={formData.isSuperAdmin}
                  onChange={(e) => {
                    const isSuper = e.target.checked;
                    setFormData({
                      ...formData,
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
                      onChange={(e) => {
                        const selectedRole = e.target.value || null;
                        let newPermissions = formData.permissions;
                        if (
                          selectedRole &&
                          roleInfo.rolePermissions &&
                          Object.prototype.hasOwnProperty.call(
                            roleInfo.rolePermissions,
                            selectedRole
                          )
                        ) {
                          const rolePerms = roleInfo.rolePermissions[selectedRole];
                          if (rolePerms && Array.isArray(rolePerms)) {
                            newPermissions = rolePerms;
                          }
                        }
                        setFormData({
                          ...formData,
                          adminRole: selectedRole,
                          permissions: newPermissions,
                        });
                      }}
                      options={[
                        { value: '', label: 'Sin rol predefinido (permisos personalizados)' },
                        ...roleInfo.roles.map((role) => ({
                          value: role,
                          label: role.charAt(0).toUpperCase() + role.slice(1),
                        })),
                      ]}
                    />
                    <div className="space-y-2">
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Permisos
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg border-gray-300 dark:border-gray-600">
                        {roleInfo.permissions.map((permission) => {
                          const permissionLabels: Record<string, string> = {
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
                          const label: string = Object.prototype.hasOwnProperty.call(
                            permissionLabels,
                            permission
                          )
                            ? (permissionLabels[permission] ?? permission)
                            : permission;
                          return (
                            <Checkbox
                              key={permission}
                              label={label}
                              checked={formData.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    permissions: [...formData.permissions, permission],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    permissions: formData.permissions.filter(
                                      (p) => p !== permission
                                    ),
                                  });
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={showDeleteModal}
        title="Eliminar administrador"
        message={`¿Estás seguro de que deseas eliminar al administrador "${selectedAdmin?.nombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
