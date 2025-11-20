import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import EditReglaModal from '../components/modals/EditReglaModal';
import {
  Button,
  Card,
  FilterBar,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Regla, ReglasPageProps } from '../types/reglas';
import { chunk } from '../utils/chunk';

const ReglasPage: React.FC<ReglasPageProps> = ({ mode, categoria }) => {
  const [reglas, setReglas] = useState<Regla[]>([]);
  const initialEstado = mode === 'admin' ? 'propuesta' : 'aprobada';
  const [filterEstado] = useState<string>(initialEstado);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Regla | null>(null);
  const [search, setSearch] = useState('');
  const [modified, setModified] = useState<Record<string, Regla>>({});

  useEffect(() => {
    const fetchReglas = async () => {
      setLoading(true);
      try {
        interface Params {
          estado?: string;
          categoria?: string;
        }
        const params: Params = {};
        if (filterEstado) params.estado = filterEstado;
        if (categoria) params.categoria = categoria;
        const { data } = await axios.get<Regla[]>('/api/reglas', { params });
        setReglas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchReglas();
  }, [filterEstado, categoria]);

  interface UpdatePayload {
    estado?: string;
    [key: string]: unknown;
  }
  const updateRule = async (id: string, payload: UpdatePayload) => {
    try {
      const { data } = await axios.put(`/api/reglas/${id}`, payload);
      setReglas((prev) => prev.map((r) => (r.id_regla === id ? data : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const localUpdate = (id: string, changes: Partial<Regla>) => {
    setReglas((prev) => {
      const updated = prev.map((r) => (r.id_regla === id ? { ...r, ...changes } : r));
      const original = prev.find((r) => r.id_regla === id);
      if (original) {
        setModified((m) => ({ ...m, [id]: { ...original, ...changes } }));
      }
      return updated;
    });
  };

  const handleApprove = (r: Regla) => localUpdate(r.id_regla, { estado: 'aprobada' });
  const handleReject = (r: Regla) => localUpdate(r.id_regla, { estado: 'rechazada' });

  const persistChanges = async () => {
    const entries = Object.values(modified);
    if (!entries.length) return;
    try {
      const approved = entries.filter((e) => e.estado === 'aprobada');
      const rejected = entries.filter((e) => e.estado === 'rechazada');
      const modifiedOnly = entries.filter((e) => e.estado === 'modificada');
      type Task = { type: 'approve' | 'reject' | 'modify'; item: Regla };
      const tasks: Task[] = [
        ...approved.map((r): Task => ({ type: 'approve', item: r })),
        ...rejected.map((r): Task => ({ type: 'reject', item: r })),
        ...modifiedOnly.map((r): Task => ({ type: 'modify', item: r })),
      ];

      for (const group of chunk(tasks, 10)) {
        await Promise.all(
          group.map((t) => {
            if (t.type === 'approve')
              return axios
                .put(`/api/reglas/${t.item.id_regla}`, { estado: 'aprobada' })
                .catch(() => null);
            if (t.type === 'reject')
              return axios.delete(`/api/reglas/${t.item.id_regla}`).catch(() => null);
            return axios.put(`/api/reglas/${t.item.id_regla}`, t.item).catch(() => null);
          })
        );
        await new Promise((r) => setTimeout(r, 500));
      }
      setReglas((prev) => prev.filter((r) => !modified[r.id_regla]));
      window.dispatchEvent(new Event('reglas-actualizadas'));
      setModified({});
    } catch (err) {
      console.error(err);
      alert('Error guardando cambios');
    }
  };

  const approveAll = () => {
    reglas.forEach((r) => {
      if (r.estado !== 'aprobada') localUpdate(r.id_regla, { estado: 'aprobada' });
    });
  };

  const rejectAll = () => {
    reglas.forEach((r) => {
      if (r.estado !== 'rechazada') localUpdate(r.id_regla, { estado: 'rechazada' });
    });
  };

  const filteredReglas = reglas.filter((r) => {
    const q = search.toLowerCase();
    return r.id_regla.toLowerCase().includes(q) || r.titulo_regla.toLowerCase().includes(q);
  });

  const reglasByCategory = filteredReglas.reduce((acc: Record<string, Regla[]>, r) => {
    const cat = r.categoria || 'Sin categoría';
    const existing = Reflect.get(acc, cat);
    Reflect.set(acc, cat, existing ? [...existing, r] : [r]);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando reglas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reglas Urbanísticas"
        description={
          categoria
            ? `Reglas de la categoría: ${categoria}`
            : 'Gestiona las reglas urbanísticas del sistema'
        }
        actions={
          mode === 'admin' &&
          reglas.length > 0 && (
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

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por ID o título..."
      />

      {filteredReglas.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay reglas para mostrar.
          </div>
        </Card>
      ) : (
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
                      <TableRow
                        key={r.id_regla}
                        className={
                          r.estado === 'aprobada'
                            ? 'bg-green-50/50 dark:bg-green-900/10'
                            : r.estado === 'rechazada'
                              ? 'bg-red-50/50 dark:bg-red-900/10'
                              : r.estado === 'modificada'
                                ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                : ''
                        }
                      >
                        <TableCell className="font-mono text-xs break-words">
                          {r.id_regla}
                        </TableCell>
                        <TableCell className="font-medium break-words">{r.titulo_regla}</TableCell>
                        <TableCell className="hidden md:table-cell break-words">
                          {r.categoria}
                        </TableCell>
                        <TableCell
                          className="hidden lg:table-cell break-words max-w-[200px]"
                          title={(r.parametros_clave || []).join(', ')}
                        >
                          <span className="line-clamp-2">
                            {(r.parametros_clave || []).join(', ')}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {r.version_documento}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                              r.estado === 'aprobada'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : r.estado === 'rechazada'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : r.estado === 'modificada'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {r.estado}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <EditIconButton onClick={() => setSelected(r)} />
                            {mode === 'admin' && r.estado !== 'aprobada' && (
                              <button
                                title="Aprobar"
                                onClick={() => handleApprove(r)}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            {mode === 'admin' && r.estado !== 'rechazada' && (
                              <button
                                title="Rechazar"
                                onClick={() => handleReject(r)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            <DeleteIconButton
                              onClick={() => {
                                const handleDelete = async () => {
                                  await axios.delete(`/api/reglas/${r.id_regla}`);
                                  setReglas((prev) =>
                                    prev.filter((x) => x.id_regla !== r.id_regla)
                                  );
                                };
                                void handleDelete();
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}
        </div>
      )}
      {selected && (
        <EditReglaModal
          regla={selected}
          onClose={() => setSelected(null)}
          onSave={(payload) => {
            const handleSave = async () => {
              await updateRule(selected.id_regla, { ...payload, estado: 'modificada' });
              setSelected(null);
            };
            void handleSave();
          }}
        />
      )}

      {mode === 'admin' && Object.keys(modified).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              void persistChanges();
            }}
            className="shadow-lg"
          >
            Finalizar revisión ({Object.keys(modified).length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReglasPage;
