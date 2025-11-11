import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PageHeader, FilterBar, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Button, Modal, Input } from '../components/ui';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';

interface AdminUser {
  _id: string;
  email: string;
  nombre: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

const AdminUsersPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAdmins = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get<AdminUser[]>('/api/admin/admins');
      setAdmins(res.data);
      setHasFetched(true);
    } catch (err: any) {
      if (!hasFetched) {
        toast.error(err.response?.data?.error || 'Error al cargar administradores');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchAdmins();
    }
  }, []);

  const handleCreate = () => {
    setSelectedAdmin(null);
    setFormData({ nombre: '', email: '', password: '' });
    setShowModal(true);
  };

  const handleEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({ nombre: admin.nombre, email: admin.email, password: '' });
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
        // Actualizar admin existente
        const payload: any = { nombre: formData.nombre, email: formData.email };
        if (formData.password) {
          // Hash de la contraseña
          const enc = new TextEncoder().encode(formData.password);
          const buf = await crypto.subtle.digest('SHA-256', enc);
          payload.password = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        await axios.put(`/api/admin/admins/${selectedAdmin._id}`, payload);
        toast.success('Administrador actualizado correctamente');
      } else {
        // Crear nuevo admin
        const enc = new TextEncoder().encode(formData.password);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        const hashHex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        await axios.post('/api/admin/admins', {
          nombre: formData.nombre,
          email: formData.email,
          password: hashHex,
          role: 'admin',
          isActive: true,
        });
        toast.success('Administrador creado correctamente');
      }
      setShowModal(false);
      setFormData({ nombre: '', email: '', password: '' });
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar administrador');
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
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al eliminar administrador');
    }
  };

  const filtered = admins.filter(a =>
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
        actions={
          <NewItemButton label="Nuevo administrador" onClick={handleCreate} />
        }
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
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron administradores
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(admin => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.nombre}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {admin.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {admin.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-AR') : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <EditIconButton onClick={() => handleEdit(admin)} />
                      {admin.email === 'prefaia@admin.com' ? null : (
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
            setFormData({ nombre: '', email: '', password: '' });
          }}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setFormData({ nombre: '', email: '', password: '' });
                }}
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} isLoading={saving}>
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
              label={selectedAdmin ? 'Nueva contraseña (dejar vacío para mantener la actual)' : 'Contraseña'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedAdmin}
              placeholder="••••••••"
            />
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
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
      />
    </div>
  );
};

export default AdminUsersPage;

