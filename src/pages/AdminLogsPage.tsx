import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import {
  Button,
  Card,
  Input,
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
import { usePermissions } from '../hooks/usePermissions';

interface AdminLog {
  _id: string;
  adminId: {
    _id: string;
    nombre: string;
    email: string;
  };
  adminEmail: string;
  adminNombre: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  isReverted?: boolean;
  revertedAt?: string;
  revertedBy?: string;
}

interface LogsResponse {
  logs: AdminLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTION_LABELS: Record<string, string> = {
  'user.created': 'Usuario creado',
  'user.updated': 'Usuario actualizado',
  'user.deleted': 'Usuario eliminado',
  'user.activated': 'Usuario activado',
  'user.suspended': 'Usuario suspendido',
  'user.plan.changed': 'Plan cambiado',
  'user.credits.assigned': 'Créditos asignados',
  'plan.created': 'Plan creado',
  'plan.updated': 'Plan actualizado',
  'plan.deleted': 'Plan eliminado',
  'admin.created': 'Admin creado',
  'admin.updated': 'Admin actualizado',
  'admin.deleted': 'Admin eliminado',
  'config.updated': 'Configuración actualizada',
  'normativa.updated': 'Normativa actualizada',
  'regla.created': 'Regla creada',
  'regla.updated': 'Regla actualizada',
  'regla.deleted': 'Regla eliminada',
  other: 'Otra acción',
};

const REVERSIBLE_ACTIONS = [
  'user.activated',
  'user.suspended',
  'user.plan.changed',
  'user.credits.assigned',
  'user.updated',
];

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  user: 'Usuario',
  plan: 'Plan',
  admin: 'Admin',
  config: 'Configuración',
  normativa: 'Normativa',
  regla: 'Regla',
  other: 'Otro',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDetails = (details: Record<string, unknown>) => {
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
};

interface LogsFiltersProps {
  filters: {
    action: string;
    resourceType: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: {
    action: string;
    resourceType: string;
    startDate: string;
    endDate: string;
  }) => void;
  onReset: () => void;
}

const LogsFilters: React.FC<LogsFiltersProps> = ({ filters, onFiltersChange, onReset }) => (
  <Card>
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Acción"
          value={filters.action}
          onChange={(e) => onFiltersChange({ ...filters, action: e.target.value })}
          options={[
            { value: '', label: 'Todas las acciones' },
            ...Object.entries(ACTION_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Select
          label="Tipo de Recurso"
          value={filters.resourceType}
          onChange={(e) => onFiltersChange({ ...filters, resourceType: e.target.value })}
          options={[
            { value: '', label: 'Todos los tipos' },
            ...Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Input
          label="Fecha Inicio"
          type="date"
          value={filters.startDate}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
        />
        <Input
          label="Fecha Fin"
          type="date"
          value={filters.endDate}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onReset}>
          Limpiar Filtros
        </Button>
      </div>
    </div>
  </Card>
);

interface LogRowProps {
  log: AdminLog;
  onUndo: (logId: string) => Promise<void>;
  isUndoing: boolean;
}

const LogRow: React.FC<LogRowProps> = ({ log, onUndo, isUndoing }) => {
  const canRevert = REVERSIBLE_ACTIONS.includes(log.action) && !log.isReverted && log.resourceId;

  const handleUndoClick = () => {
    void onUndo(log._id);
  };

  return (
    <TableRow>
      <TableCell>{formatDate(log.createdAt)}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{log.adminNombre}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{log.adminEmail}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
            {ACTION_LABELS[log.action] || log.action}
          </span>
          {log.isReverted && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
              Revertido
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded text-xs">
          {RESOURCE_TYPE_LABELS[log.resourceType] || log.resourceType}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs">{log.resourceId || '—'}</span>
      </TableCell>
      <TableCell>
        <details className="cursor-pointer">
          <summary className="text-sm text-primary-600 dark:text-primary-400">Ver detalles</summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-w-md">
            {formatDetails(log.details)}
          </pre>
        </details>
      </TableCell>
      <TableCell>
        {canRevert ? (
          <Button variant="secondary" size="sm" onClick={handleUndoClick} disabled={isUndoing}>
            {isUndoing ? 'Deshaciendo...' : 'Deshacer'}
          </Button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </TableCell>
    </TableRow>
  );
};

const LoadingState: React.FC = () => (
  <Card>
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  </Card>
);

const EmptyState: React.FC = () => (
  <Card>
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron logs</div>
  </Card>
);

const AccessDenied: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card>
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Solo los super administradores pueden acceder a los logs
        </p>
      </div>
    </Card>
  </div>
);

interface LogsTableProps {
  logs: AdminLog[];
  loading: boolean;
  totalPages: number;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onUndo: (logId: string) => Promise<void>;
  isUndoing: boolean;
}

const LogsTable: React.FC<LogsTableProps> = ({
  logs,
  loading,
  totalPages,
  total,
  page,
  onPageChange,
  onUndo,
  isUndoing,
}) => {
  if (loading) return <LoadingState />;
  if (logs.length === 0) return <EmptyState />;

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>ID Recurso</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogRow key={log._id} log={log} onUndo={onUndo} isUndoing={isUndoing} />
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 px-4 pb-4">
          <Pagination
            total={total}
            current={page}
            pageSize={50}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
};

const useLogsData = (isSuperAdmin: boolean, page: number, filters: typeof defaultFilters) => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axios.get<LogsResponse>(`/admin/logs?${params.toString()}`);
      setLogs(res.data.logs);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    void loadLogs();
  }, [isSuperAdmin, loadLogs]);

  return { logs, loading, totalPages, total, loadLogs };
};

const defaultFilters = {
  action: '',
  resourceType: '',
  startDate: '',
  endDate: '',
};

const AdminLogsPage: React.FC = () => {
  const { isSuperAdmin } = usePermissions();
  const [isUndoing, setIsUndoing] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);

  const { logs, loading, totalPages, total, loadLogs } = useLogsData(isSuperAdmin, page, filters);

  const handleUndo = useCallback(
    async (logId: string) => {
      if (!confirm('¿Estás seguro de que deseas deshacer esta acción?')) {
        return;
      }

      setIsUndoing(true);
      try {
        await axios.post(`/admin/logs/${logId}/undo`);
        await loadLogs();
      } catch (error) {
        console.error('Error deshaciendo acción:', error);
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.error || 'Error al deshacer la acción'
          : 'Error al deshacer la acción';
        toast.error(errorMessage);
      } finally {
        setIsUndoing(false);
      }
    },
    [loadLogs]
  );

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  if (!isSuperAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs de Administración"
        description="Registro de acciones realizadas por administradores"
      />

      <LogsFilters filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />

      <LogsTable
        logs={logs}
        loading={loading}
        totalPages={totalPages}
        total={total}
        page={page}
        onPageChange={setPage}
        onUndo={handleUndo}
        isUndoing={isUndoing}
      />
    </div>
  );
};

export default AdminLogsPage;
