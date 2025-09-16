import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  isActive: boolean;
  role: string;
  suscripcion?: { tipo: string };
  consultasDisponibles?: number;
}

const UsersPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Usuario[]>('/api/admin/usuarios');
      setUsuarios(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Usuarios</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="input-field mb-4 max-w-sm"
      />
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Activo</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Plan</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Consultas restantes</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginated.map(u => (
            <tr key={u._id}>
              <td className="px-4 py-2 whitespace-nowrap">{u.nombre}</td>
              <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
              <td className="px-4 py-2 whitespace-nowrap">{u.isActive ? 'Sí' : 'No'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{u.suscripcion?.tipo || '—'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{u.consultasDisponibles ?? '—'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => toggleActivo(u._id, u.isActive)}
                >
                  {u.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        total={filtered.length}
        current={page}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => setPage(p)}
        className="mt-4"
      />
    </div>
  );
};

export default UsersPage; 