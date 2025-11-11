import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination, PageHeader, FilterBar, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Button } from '../components/ui';
import { Informe } from '../types/reports';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando informes...</p>
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
        title="Informes"
        description="Visualiza y gestiona los informes generados"
      />

      <FilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por dirección o email de usuario..."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dirección</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron informes
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(inf => (
                <TableRow key={inf._id}>
                  <TableCell>{inf.direccionCompleta || '—'}</TableCell>
                  <TableCell>
                    {inf.usuario ? (
                      <div>
                        <div className="font-medium">{inf.usuario.nombre}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{inf.usuario.email}</div>
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inf.estado === 'completado' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : inf.estado === 'procesando'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {inf.estado}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(inf.createdAt).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell align="right">
                    {inf.pdfUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(inf.pdfUrl, '_blank')}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                        Ver PDF
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

export default ReportsPage; 