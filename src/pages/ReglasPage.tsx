import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import EditReglaModal from '../components/modals/EditReglaModal';
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
import { Regla, ReglasPageProps } from '../types/reglas';
import { chunk } from '../utils/chunk';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando reglas...</p>
    </div>
  </div>
);

type Task = { type: 'approve' | 'reject' | 'modify'; item: Regla };

const createTasks = (entries: Regla[]): Task[] => {
  const approved = entries.filter((e) => e.estado === 'aprobada');
  const rejected = entries.filter((e) => e.estado === 'rechazada');
  const modifiedOnly = entries.filter((e) => e.estado === 'modificada');
  return [
    ...approved.map((r): Task => ({ type: 'approve', item: r })),
    ...rejected.map((r): Task => ({ type: 'reject', item: r })),
    ...modifiedOnly.map((r): Task => ({ type: 'modify', item: r })),
  ];
};

const executeTask = (task: Task): Promise<unknown> => {
  if (task.type === 'approve') {
    return axios.put(`/api/reglas/${task.item.id_regla}`, { estado: 'aprobada' }).catch(() => null);
  }
  if (task.type === 'reject') {
    return axios.delete(`/api/reglas/${task.item.id_regla}`).catch(() => null);
  }
  return axios.put(`/api/reglas/${task.item.id_regla}`, task.item).catch(() => null);
};

const persistChanges = async (
  modified: Record<string, Regla>,
  setReglas: React.Dispatch<React.SetStateAction<Regla[]>>,
  setModified: React.Dispatch<React.SetStateAction<Record<string, Regla>>>
) => {
  const entries = Object.values(modified);
  if (!entries.length) return;
  try {
    const tasks = createTasks(entries);
    for (const group of chunk(tasks, 10)) {
      await Promise.all(group.map((task) => executeTask(task)));
      await new Promise((r) => setTimeout(r, 500));
    }
    setReglas((prev) => prev.filter((r) => !modified[r.id_regla]));
    window.dispatchEvent(new Event('reglas-actualizadas'));
    setModified({});
    toast.success('Cambios guardados correctamente');
  } catch (err) {
    console.error(err);
    const errorMessage =
      (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
        ?.error ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Error guardando cambios';
    toast.error(errorMessage);
  }
};

const getEstadoBadgeClass = (estado: string | undefined): string => {
  if (estado === 'aprobada') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  if (estado === 'rechazada') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  if (estado === 'modificada') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
};

const getEstadoRowClass = (estado: string | undefined): string => {
  if (estado === 'aprobada') return 'bg-green-50/50 dark:bg-green-900/10';
  if (estado === 'rechazada') return 'bg-red-50/50 dark:bg-red-900/10';
  if (estado === 'modificada') return 'bg-blue-50/50 dark:bg-blue-900/10';
  return '';
};

interface ReglaRowProps {
  regla: Regla;
  mode: 'admin' | 'view';
  onEdit: (r: Regla) => void;
  onApprove: (r: Regla) => void;
  onReject: (r: Regla) => void;
  onDelete: (id: string) => void;
}

const ReglaRow: React.FC<ReglaRowProps> = ({
  regla,
  mode,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}) => (
  <TableRow key={regla.id_regla} className={getEstadoRowClass(regla.estado)}>
    <TableCell className="font-mono text-xs break-words">{regla.id_regla}</TableCell>
    <TableCell className="font-medium break-words">{regla.titulo_regla}</TableCell>
    <TableCell className="hidden md:table-cell break-words">{regla.categoria}</TableCell>
    <TableCell
      className="hidden lg:table-cell break-words max-w-[200px]"
      title={(regla.parametros_clave || []).join(', ')}
    >
      <span className="line-clamp-2">{(regla.parametros_clave || []).join(', ')}</span>
    </TableCell>
    <TableCell className="hidden xl:table-cell">{regla.version_documento}</TableCell>
    <TableCell>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getEstadoBadgeClass(regla.estado)}`}
      >
        {regla.estado}
      </span>
    </TableCell>
    <TableCell align="right">
      <div className="flex items-center justify-end gap-1 flex-wrap">
        <EditIconButton onClick={() => onEdit(regla)} />
        {mode === 'admin' && regla.estado !== 'aprobada' && (
          <button
            title="Aprobar"
            onClick={() => onApprove(regla)}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
        )}
        {mode === 'admin' && regla.estado !== 'rechazada' && (
          <button
            title="Rechazar"
            onClick={() => onReject(regla)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
        <DeleteIconButton onClick={() => onDelete(regla.id_regla)} />
      </div>
    </TableCell>
  </TableRow>
);

const PAGE_SIZE = 50;

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const useReglasData = (filterEstado: string, categoria?: string, page: number = 1, limit: number = PAGE_SIZE) => {
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReglas = async () => {
      setLoading(true);
      try {
        interface Params {
          estado?: string;
          categoria?: string;
          page?: number;
          limit?: number;
        }
        const params: Params = { page, limit };
        if (filterEstado) params.estado = filterEstado;
        if (categoria) params.categoria = categoria;
        const { data } = await axios.get<{ reglas: Regla[]; pagination: PaginationData }>('/api/reglas', { params });
        setReglas(data.reglas || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchReglas();
  }, [filterEstado, categoria, page, limit]);

  return { reglas, setReglas, pagination, loading };
};

interface UpdatePayload {
  estado?: string;
  [key: string]: unknown;
}

const useReglasHandlers = (
  reglas: Regla[],
  setReglas: React.Dispatch<React.SetStateAction<Regla[]>>,
  setModified: React.Dispatch<React.SetStateAction<Record<string, Regla>>>,
  modified: Record<string, Regla>
) => {
  const localUpdate = useCallback(
    (id: string, changes: Partial<Regla>) => {
      setReglas((prev) => {
        const updated = prev.map((r) => (r.id_regla === id ? { ...r, ...changes } : r));
        const original = prev.find((r) => r.id_regla === id);
        if (original) {
          setModified((m) => ({ ...m, [id]: { ...original, ...changes } }));
        }
        return updated;
      });
    },
    [setReglas, setModified]
  );

  const updateRule = useCallback(
    async (id: string, payload: UpdatePayload) => {
      try {
        const { data } = await axios.put(`/api/reglas/${id}`, payload);
        setReglas((prev) => prev.map((r) => (r.id_regla === id ? data : r)));
      } catch (err) {
        console.error(err);
      }
    },
    [setReglas]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await axios.delete(`/api/reglas/${id}`);
      setReglas((prev) => prev.filter((x) => x.id_regla !== id));
    },
    [setReglas]
  );

  const handleApprove = useCallback(
    (r: Regla) => localUpdate(r.id_regla, { estado: 'aprobada' }),
    [localUpdate]
  );

  const handleReject = useCallback(
    (r: Regla) => localUpdate(r.id_regla, { estado: 'rechazada' }),
    [localUpdate]
  );

  const handlePersistChanges = useCallback(() => {
    void persistChanges(modified, setReglas, setModified);
  }, [modified, setReglas, setModified]);

  const approveAll = useCallback(() => {
    reglas.forEach((r) => {
      if (r.estado !== 'aprobada') localUpdate(r.id_regla, { estado: 'aprobada' });
    });
  }, [reglas, localUpdate]);

  const rejectAll = useCallback(() => {
    reglas.forEach((r) => {
      if (r.estado !== 'rechazada') localUpdate(r.id_regla, { estado: 'rechazada' });
    });
  }, [reglas, localUpdate]);

  return {
    updateRule,
    handleDelete,
    handleApprove,
    handleReject,
    handlePersistChanges,
    approveAll,
    rejectAll,
  };
};

const filterReglas = (reglas: Regla[], search: string): Regla[] => {
  const q = search.toLowerCase();
  return reglas.filter(
    (r) => r.id_regla.toLowerCase().includes(q) || r.titulo_regla.toLowerCase().includes(q)
  );
};

const groupReglasByCategory = (reglas: Regla[]): Record<string, Regla[]> => {
  const categoryMap = new Map<string, Regla[]>();
  reglas.forEach((r) => {
    const cat = r.categoria || 'Sin categoría';
    const existing = categoryMap.get(cat);
    if (existing) {
      categoryMap.set(cat, [...existing, r]);
    } else {
      categoryMap.set(cat, [r]);
    }
  });
  const result: Record<string, Regla[]> = {};
  categoryMap.forEach((value, key) => {
    Object.defineProperty(result, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });
  return result;
};

const ReglasPageHeader: React.FC<{
  mode: 'admin' | 'view';
  categoria?: string | undefined;
  reglasCount: number;
  approveAll: () => void;
  rejectAll: () => void;
}> = ({ mode, categoria, reglasCount, approveAll, rejectAll }) => (
  <PageHeader
    title="Reglas Urbanísticas"
    description={
      categoria
        ? `Reglas de la categoría: ${categoria}`
        : 'Gestiona las reglas urbanísticas del sistema'
    }
    actions={
      mode === 'admin' &&
      reglasCount > 0 && (
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={approveAll}>
            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
            Aceptar todas
          </Button>
          <Button variant="danger" size="sm" onClick={rejectAll}>
            <XCircleIcon className="h-4 w-4 mr-1.5" />
            Rechazar todas
          </Button>
        </div>
      )
    }
  />
);

const ReglasTableSection: React.FC<{
  reglasByCategory: Record<string, Regla[]>;
  mode: 'admin' | 'view';
  onEdit: (r: Regla) => void;
  onApprove: (r: Regla) => void;
  onReject: (r: Regla) => void;
  onDelete: (id: string) => void;
}> = ({ reglasByCategory, mode, onEdit, onApprove, onReject, onDelete }) => {
  if (Object.keys(reglasByCategory).length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay reglas para mostrar.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(reglasByCategory).map(([cat, list]) => (
        <Card key={cat} title={cat}>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px] max-w-[180px]">ID</TableHead>
                  <TableHead className="min-w-[200px]">Título</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px] max-w-[150px]">
                    Categoría
                  </TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[150px] max-w-[200px]">
                    Parámetros clave
                  </TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[80px] max-w-[100px]">
                    Versión
                  </TableHead>
                  <TableHead className="min-w-[90px] max-w-[110px]">Estado</TableHead>
                  <TableHead align="right" className="min-w-[120px] max-w-[140px]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <ReglaRow
                    key={r.id_regla}
                    regla={r}
                    mode={mode}
                    onEdit={onEdit}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}
    </div>
  );
};

const useReglasPageState = (mode: 'admin' | 'view') => {
  const initialEstado = mode === 'admin' ? 'propuesta' : 'aprobada';
  const [filterEstado] = useState<string>(initialEstado);
  const [selected, setSelected] = useState<Regla | null>(null);
  const [toDelete, setToDelete] = useState<Regla | null>(null);
  const [search, setSearch] = useState('');
  const [modified, setModified] = useState<Record<string, Regla>>({});

  return {
    filterEstado,
    selected,
    setSelected,
    toDelete,
    setToDelete,
    search,
    setSearch,
    modified,
    setModified,
  };
};

const ReglasModals: React.FC<{
  selected: Regla | null;
  toDelete: Regla | null;
  updateRule: (id: string, payload: UpdatePayload) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setSelected: (regla: Regla | null) => void;
  setToDelete: (regla: Regla | null) => void;
}> = ({ selected, toDelete, updateRule, handleDelete, setSelected, setToDelete }) => {
  const confirmDelete = useCallback(async () => {
    if (toDelete) {
      await handleDelete(toDelete.id_regla);
      setToDelete(null);
    }
  }, [toDelete, handleDelete, setToDelete]);

  return (
    <>
      {selected && (
        <EditReglaModal
          regla={selected}
          onClose={() => setSelected(null)}
          onSave={(payload) => {
            const executeSave = async () => {
              await updateRule(selected.id_regla, { ...payload, estado: 'modificada' });
              setSelected(null);
            };
            void executeSave();
          }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar Regla"
          message={`¿Estás seguro de que deseas eliminar la regla "${toDelete.titulo_regla}" (${toDelete.id_regla})? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
};

const ReglasPageContent: React.FC<{
  mode: 'admin' | 'view';
  categoria?: string | undefined;
  reglasByCategory: Record<string, Regla[]>;
  search: string;
  modified: Record<string, Regla>;
  pagination: PaginationData;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (regla: Regla) => void;
  onApprove: (regla: Regla) => void;
  onReject: (regla: Regla) => void;
  onDelete: (id: string) => void;
  approveAll: () => void;
  rejectAll: () => void;
  handlePersistChanges: () => void;
}> = ({
  mode,
  categoria,
  reglasByCategory,
  search,
  modified,
  pagination,
  onSearchChange,
  onPageChange,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  approveAll,
  rejectAll,
  handlePersistChanges,
}) => (
  <div>
    <ReglasPageHeader
      mode={mode}
      categoria={categoria}
      reglasCount={pagination.total}
      approveAll={approveAll}
      rejectAll={rejectAll}
    />

    <FilterBar
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por ID o título..."
    />

    <ReglasTableSection
      reglasByCategory={reglasByCategory}
      mode={mode}
      onEdit={onEdit}
      onApprove={onApprove}
      onReject={onReject}
      onDelete={onDelete}
    />

    {pagination.total > 0 && (
      <div className="mt-6">
        <Pagination
          total={pagination.total}
          current={pagination.page}
          pageSize={pagination.limit}
          onPageChange={onPageChange}
        />
      </div>
    )}

    {mode === 'admin' && Object.keys(modified).length > 0 && (
      <div className="fixed bottom-6 right-6 z-50">
        <Button variant="primary" size="lg" onClick={handlePersistChanges} className="shadow-lg">
          Finalizar revisión ({Object.keys(modified).length})
        </Button>
      </div>
    )}
  </div>
);

const ReglasPage: React.FC<ReglasPageProps> = ({ mode, categoria }) => {
  const [page, setPage] = useState(1);
  const {
    filterEstado,
    selected,
    setSelected,
    toDelete,
    setToDelete,
    search,
    setSearch,
    modified,
    setModified,
  } = useReglasPageState(mode);

  const { reglas, setReglas, pagination, loading } = useReglasData(filterEstado, categoria, page, PAGE_SIZE);

  const {
    updateRule,
    handleDelete,
    handleApprove,
    handleReject,
    handlePersistChanges,
    approveAll,
    rejectAll,
  } = useReglasHandlers(reglas, setReglas, setModified, modified);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterEstado, categoria]);

  const filteredReglas = filterReglas(reglas, search);
  const reglasByCategory = groupReglasByCategory(filteredReglas);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ReglasPageContent
        mode={mode}
        categoria={categoria}
        reglasByCategory={reglasByCategory}
        search={search}
        modified={modified}
        pagination={pagination}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onEdit={setSelected}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={(id) => {
          const regla = reglas.find((r) => r.id_regla === id);
          if (regla) setToDelete(regla);
        }}
        approveAll={approveAll}
        rejectAll={rejectAll}
        handlePersistChanges={handlePersistChanges}
      />

      <ReglasModals
        selected={selected}
        toDelete={toDelete}
        updateRule={updateRule}
        handleDelete={handleDelete}
        setSelected={setSelected}
        setToDelete={setToDelete}
      />
    </>
  );
};

export default ReglasPage;
