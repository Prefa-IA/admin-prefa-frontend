import React, { useEffect, useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

import {
  Button,
  Card,
  FilterBar,
  PageHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Informe } from '../types/reports';

const PAGE_SIZE = 20;

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando informes...</p>
    </div>
  </div>
);

const getTipoPrefaLabel = (tipoPrefa?: string): string => {
  if (tipoPrefa === 'prefa1') return 'Simple';
  if (tipoPrefa === 'prefa2') return 'Completa';
  return tipoPrefa || '—';
};

const getEstadoBadgeClass = (estado?: string): string => {
  if (estado === 'completado') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  if (estado === 'procesando') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const formatDateTime = (date: Date): { fecha: string; hora: string } => {
  const fecha = date.toLocaleDateString('es-AR');
  const hora = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { fecha, hora };
};

const InformeRow: React.FC<{ informe: Informe }> = ({ informe }) => {
  const fechaHora = new Date(informe.createdAt);
  const { fecha, hora } = formatDateTime(fechaHora);
  const tipoPrefaLabel = getTipoPrefaLabel(informe.tipoPrefa);

  return (
    <TableRow key={informe._id}>
      <TableCell className="font-medium">{informe.direccionCompleta || '—'}</TableCell>
      <TableCell className="hidden md:table-cell">
        {informe.usuario ? (
          <div>
            <div className="font-medium">{informe.usuario.nombre}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{informe.usuario.email}</div>
          </div>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {tipoPrefaLabel}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeClass(informe.estado)}`}
        >
          {informe.estado}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div>
          <div>{fecha}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{hora}</div>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            informe.fueDescargado
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {informe.fueDescargado ? 'Sí' : 'No'}
        </span>
      </TableCell>
      <TableCell align="right">
        {informe.pdfUrl && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(informe.pdfUrl, '_blank')}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            Ver PDF
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

const filterInformes = (informes: Informe[], query: string): Informe[] =>
  informes.filter(
    (i) =>
      (i.direccionCompleta || '').toLowerCase().includes(query.toLowerCase()) ||
      (i.usuario?.email || '').toLowerCase().includes(query.toLowerCase())
  );

const paginateInformes = (informes: Informe[], page: number): Informe[] =>
  informes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

const useInformes = () => {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInformes = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Informe[]>('/api/admin/informes');
      setInformes(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al cargar informes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInformes();
  }, []);

  return { informes, loading, error };
};

const ReportsPageContent: React.FC<{
  informes: Informe[];
  query: string;
  page: number;
  onQueryChange: (q: string) => void;
  onPageChange: (p: number) => void;
}> = ({ informes, query, page, onQueryChange, onPageChange }) => {
  const filtered = filterInformes(informes, query);
  const paginated = paginateInformes(filtered, page);

  return (
    <>
      <FilterBar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Buscar por dirección o email de usuario..."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dirección</TableHead>
              <TableHead className="hidden md:table-cell">Usuario</TableHead>
              <TableHead className="hidden lg:table-cell">Tipo Prefa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Fecha y Hora</TableHead>
              <TableHead className="hidden lg:table-cell">Descargado</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No se encontraron informes
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((inf) => <InformeRow key={inf._id} informe={inf} />)
            )}
          </TableBody>
        </Table>

        {filtered.length > 0 && (
          <div className="mt-6">
            <Pagination
              total={filtered.length}
              current={page}
              pageSize={PAGE_SIZE}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </Card>
    </>
  );
};

const ReportsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { informes, loading, error } = useInformes();

  if (loading) {
    return <LoadingSpinner />;
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
      <PageHeader title="Informes" description="Visualiza y gestiona los informes generados" />
      <ReportsPageContent
        informes={informes}
        query={query}
        page={page}
        onQueryChange={setQuery}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ReportsPage;
