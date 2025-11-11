import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination, PageHeader, FilterBar, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Button } from '../components/ui';
import { Usuario } from '../types/usuarios';

const UsersPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [hasFetched, setHasFetched] = useState(false);

  const fetchUsuarios = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get<Usuario[]>('/api/admin/usuarios');
      setUsuarios(res.data);
      setHasFetched(true);
      setError(null);
    } catch (err: any) {
      if (!hasFetched) {
        setError(err.response?.data?.error || 'Error al cargar usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchUsuarios();
    }
  }, []);

  const toggleActivo = async (id: string, isActive: boolean) => {
    try {
      await axios.patch(`/api/admin/usuarios/${id}/estado`, { isActive: !isActive });
      fetchUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  const filtered = usuarios.filter(u =>
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
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
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
              <TableHead>Activo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Consultas restantes</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(u => (
                <TableRow key={u._id}>
                  <TableCell>{u.nombre}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {u.isActive ? 'Sí' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>{u.suscripcion?.tipo || '—'}</TableCell>
                  <TableCell>{u.consultasDisponibles ?? '—'}</TableCell>
                  <TableCell align="right">
                    {u.email === 'prefaia@admin.com' ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActivo(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
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
    </div>
  );
};

export default UsersPage; 