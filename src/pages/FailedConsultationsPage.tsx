import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
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

interface ConsultaFallida {
  _id: string;
  direccion: string;
  datosFaltantes: string[];
  tipo: string;
  createdAt: string;
  finalizadoEn: string;
  usuario: {
    nombre: string;
    email: string;
  } | null;
}

interface ConsultasFallidasResponse {
  consultas: ConsultaFallida[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PAGE_SIZE = 50;

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando consultas fallidas...</p>
    </div>
  </div>
);

const formatDateTime = (dateString: string): { fecha: string; hora: string } => {
  const date = new Date(dateString);
  const fecha = date.toLocaleDateString('es-AR');
  const hora = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { fecha, hora };
};

const getTipoLabel = (tipo: string): string => {
  if (tipo === 'compuesta') return 'Compuesta';
  return 'Simple';
};

const ConsultaRow: React.FC<{ consulta: ConsultaFallida }> = ({ consulta }) => {
  const fechaHora = formatDateTime(consulta.createdAt);

  return (
    <TableRow key={consulta._id}>
      <TableCell className="font-medium">{consulta.direccion || '—'}</TableCell>
      <TableCell>
        {consulta.usuario ? (
          <div>
            <div className="font-medium">{consulta.usuario.nombre || '—'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{consulta.usuario.email}</div>
          </div>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          {getTipoLabel(consulta.tipo)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {consulta.datosFaltantes.length > 0 ? (
            consulta.datosFaltantes.map((dato, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              >
                {dato}
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">—</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div>{fechaHora.fecha}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{fechaHora.hora}</div>
        </div>
      </TableCell>
    </TableRow>
  );
};

const filterConsultas = (consultas: ConsultaFallida[], query: string): ConsultaFallida[] =>
  consultas.filter(
    (c) =>
      (c.direccion || '').toLowerCase().includes(query.toLowerCase()) ||
      (c.usuario?.email || '').toLowerCase().includes(query.toLowerCase()) ||
      (c.usuario?.nombre || '').toLowerCase().includes(query.toLowerCase()) ||
      c.datosFaltantes.some((d) => d.toLowerCase().includes(query.toLowerCase()))
  );

const useConsultasFallidas = () => {
  const [consultas, setConsultas] = useState<ConsultaFallida[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const fetchConsultas = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get<ConsultasFallidasResponse>('/api/admin/consultas-fallidas', {
        params: { page, limit: PAGE_SIZE },
      });
      setConsultas(res.data.consultas);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al cargar consultas fallidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConsultas(1);
  }, []);

  return { consultas, loading, error, pagination, refetch: fetchConsultas };
};

const FailedConsultationsPageContent: React.FC<{
  consultas: ConsultaFallida[];
  query: string;
  page: number;
  pagination: { page: number; totalPages: number; total: number };
  onQueryChange: (q: string) => void;
  onPageChange: (p: number) => void;
}> = ({ consultas, query, page, pagination, onQueryChange, onPageChange }) => {
  const filtered = filterConsultas(consultas, query);

  return (
    <>
      <FilterBar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Buscar por dirección, usuario o dato faltante..."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dirección</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Datos Faltantes</TableHead>
              <TableHead>Fecha y Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No se encontraron consultas fallidas
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((consulta) => <ConsultaRow key={consulta._id} consulta={consulta} />)
            )}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              total={pagination.total}
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

const FailedConsultationsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { consultas, loading, error, pagination, refetch } = useConsultasFallidas();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void refetch(newPage);
  };

  if (loading && consultas.length === 0) {
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
      <PageHeader
        title="Consultas Fallidas"
        description="Consultas que fallaron por falta de datos (frente, fondo, capacidad constructiva, etc.)"
      />
      <FailedConsultationsPageContent
        consultas={consultas}
        query={query}
        page={page}
        pagination={pagination}
        onQueryChange={setQuery}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default FailedConsultationsPage;
