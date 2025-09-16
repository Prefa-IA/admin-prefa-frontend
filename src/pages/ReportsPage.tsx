import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';

interface Informe {
  _id: string;
  direccionCompleta?: string;
  pdfUrl?: string;
  estado: string;
  createdAt: string;
  usuario?: { nombre: string; email: string };
}

const ReportsPage: React.FC = () => {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchInformes = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Informe[]>('/api/admin/informes');
      setInformes(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar informes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInformes();
  }, []);

  const filtered = informes.filter(i =>
    (i.direccionCompleta || '').toLowerCase().includes(query.toLowerCase()) ||
    (i.usuario?.email || '').toLowerCase().includes(query.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Informes</h2>
      <input
        type="text"
        placeholder="Buscar por dirección o email de usuario..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="input-field mb-4 max-w-sm"
      />
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginated.map(inf => (
            <tr key={inf._id}>
              <td className="px-4 py-2 whitespace-nowrap">{inf.direccionCompleta || '—'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{inf.usuario ? `${inf.usuario.nombre} (${inf.usuario.email})` : '—'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{inf.estado}</td>
              <td className="px-4 py-2 whitespace-nowrap">{new Date(inf.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {inf.pdfUrl && (
                  <a
                    href={inf.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver PDF
                  </a>
                )}
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

export default ReportsPage; 