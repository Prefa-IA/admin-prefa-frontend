import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditReglaModal from '../components/modals/EditReglaModal';
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Regla {
  id_regla: string;
  titulo_regla: string;
  descripcion_completa: string;
  categoria?: string;
  estado?: string;
  referencia_original?: string;
  parametros_clave?: string[];
  version_documento?: string;
}

interface ReglasPageProps {
  mode: 'admin' | 'view';
  categoria?: string;
}

const ReglasPage: React.FC<ReglasPageProps> = ({ mode, categoria }) => {
  const [reglas, setReglas] = useState<Regla[]>([]);
  const initialEstado = mode === 'admin' ? 'propuesta' : 'aprobada';
  const [filterEstado, setFilterEstado] = useState<string>(initialEstado);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Regla | null>(null);
  const [search, setSearch] = useState('');
  const [modified, setModified] = useState<Record<string, Regla>>({});

  const fetchReglas = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterEstado) params.estado = filterEstado;
      if (categoria) params.categoria = categoria;
      const { data } = await axios.get('/api/reglas', { params });
      setReglas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReglas();
  }, [filterEstado, categoria]);

  const updateRule = async (id: string, payload: any) => {
    try {
      const { data } = await axios.put(`/api/reglas/${id}`, payload);
      setReglas(prev => prev.map(r => r.id_regla === id ? data : r));
    } catch (err) {
      console.error(err);
    }
  };

  const localUpdate = (id: string, changes: Partial<Regla>) => {
    setReglas(prev => {
      const updated = prev.map(r => r.id_regla === id ? { ...r, ...changes } : r);
      const original = prev.find(r => r.id_regla === id);
      if (original) {
        setModified(m => ({ ...m, [id]: { ...original, ...changes } }));
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
      const approved = entries.filter(e=>e.estado==='aprobada');
      const rejected = entries.filter(e=>e.estado==='rechazada');
      const modifiedOnly = entries.filter(e=>e.estado==='modificada');
      type Task = { type: 'approve' | 'reject' | 'modify'; item: Regla };
      const tasks: Task[] = [
        ...approved.map((r): Task => ({ type: 'approve', item: r })),
        ...rejected.map((r): Task => ({ type: 'reject', item: r })),
        ...modifiedOnly.map((r): Task => ({ type: 'modify', item: r }))
      ];

      const chunk = <T,>(array: T[], size: number): T[][] => {
        const res: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          res.push(array.slice(i, i + size));
        }
        return res;
      };
       
      for (const group of chunk(tasks, 10)) {
        await Promise.all(group.map(t=>{
          if (t.type==='approve') return axios.put(`/api/reglas/${t.item.id_regla}`, { estado:'aprobada'}).catch(()=>null);
          if (t.type==='reject') return axios.delete(`/api/reglas/${t.item.id_regla}`).catch(()=>null);
          return axios.put(`/api/reglas/${t.item.id_regla}`, t.item).catch(()=>null);
        }));
        await new Promise(r=>setTimeout(r,500));
      }
      // remover los aprobados/rechazados de vista
      setReglas(prev => prev.filter(r => !modified[r.id_regla]));
      window.dispatchEvent(new Event('reglas-actualizadas'));
      setModified({});
    } catch (err) {
      console.error(err);
      alert('Error guardando cambios');
    }
  };

  const approveAll = () => {
    reglas.forEach(r => {
      if (r.estado !== 'aprobada') localUpdate(r.id_regla, { estado: 'aprobada' });
    });
  };

  const rejectAll = () => {
    reglas.forEach(r => {
      if (r.estado !== 'rechazada') localUpdate(r.id_regla, { estado: 'rechazada' });
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Reglas Urbanísticas</h1>
      <div className="flex items-center space-x-4 flex-wrap">
        <input
          placeholder="Buscar por ID o título..."
          className="input-field max-w-xs"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        {mode==='admin' && reglas.length>0 && (
          <div className="ml-auto flex items-center space-x-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
              onClick={approveAll}
            >
              ✔ Aceptar todas
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
              onClick={rejectAll}
            >
              ✖ Rechazar todas
            </button>
          </div>
        )}
        </div>
      {loading ? (
        <p>Cargando…</p>
      ) : reglas.length === 0 ? (
        <p>No hay reglas para mostrar.</p>
      ) : (
        <div className="overflow-auto border rounded-md">
          {Object.entries(reglas.reduce((acc: Record<string, Regla[]>, r) => {
            const cat = r.categoria || 'Sin categoría';
            acc[cat] = acc[cat] ? [...acc[cat], r] : [r];
            return acc;
          }, {})).map(([cat, list]) => (
            <div key={cat} className="mb-8">
              <h3 className="font-semibold text-lg mb-2">{cat}</h3>
              <table className="min-w-full text-xs divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50 sticky top-0 shadow z-10">
                  <tr>
                    <th className="px-2 py-1 text-left w-36">ID</th>
                    <th className="px-2 py-1 text-left w-auto">Título</th>
                    <th className="px-2 py-1 text-left w-28">Categoría</th>
                    <th className="px-2 py-1 text-left w-40">Parámetros clave</th>
                    <th className="px-2 py-1 text-left w-24">Versión</th>
                    <th className="px-2 py-1 text-left w-20">Estado</th>
                    <th className="px-2 py-1 w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list
                    .filter(r=>{
                      const q=search.toLowerCase();
                      return r.id_regla.toLowerCase().includes(q) || r.titulo_regla.toLowerCase().includes(q);
                    })
                    .map(r => (
                      <tr
                        key={r.id_regla}
                        className={`hover:bg-gray-50 ${
                          r.estado==='aprobada' ? 'bg-green-50' : r.estado==='rechazada' ? 'bg-red-50' : r.estado==='modificada' ? 'bg-blue-50' : ''
                        }`}
                      >
                      <td className="px-2 py-1 whitespace-nowrap text-xs font-mono truncate">{r.id_regla}</td>
                      <td className="px-2 py-1 whitespace-nowrap">{r.titulo_regla}</td>
                      <td className="px-2 py-1 whitespace-nowrap">{r.categoria}</td>
                      <td className="px-2 py-1 whitespace-nowrap truncate" title={(r.parametros_clave||[]).join(', ')}>
                        {(() => {
                          const full = (r.parametros_clave||[]).join(', ');
                          return full.length>25 ? `${full.slice(0,25)}…` : full;
                        })()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">{r.version_documento}</td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          r.estado==='aprobada'?'bg-green-100 text-green-800':
                          r.estado==='rechazada'?'bg-red-100 text-red-800':
                          r.estado==='modificada'?'bg-blue-100 text-blue-800':'bg-yellow-100 text-yellow-800'}`}>{r.estado}</span>
                      </td>
                        <td className="px-2 py-1 whitespace-nowrap flex space-x-2">
                          <button title="Editar" onClick={() => setSelected(r)} className="text-gray-600 hover:text-blue-600">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          {mode==='admin' && r.estado !== 'aprobada' && (
                            <button title="Aprobar" onClick={() => handleApprove(r)} className="text-green-600 hover:text-green-800">
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          {mode==='admin' && r.estado !== 'rechazada' && (
                            <button title="Rechazar" onClick={() => handleReject(r)} className="text-red-600 hover:text-red-800">
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button title="Eliminar" onClick={async ()=>{ await axios.delete(`/api/reglas/${r.id_regla}`); setReglas(prev=>prev.filter(x=>x.id_regla!==r.id_regla)); }} className="text-gray-400 hover:text-red-500">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                    </tr>
                  ))}
                  </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
      {selected && (
        <EditReglaModal
          regla={selected as any}
          onClose={() => setSelected(null)}
          onSave={async (payload) => {
            await updateRule(selected.id_regla, { ...payload, estado: 'modificada' });
            setSelected(null);
          }}
        />
      )}
      {mode==='admin' && Object.keys(modified).length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button className="btn-primary px-6 py-3" onClick={persistChanges}>Finalizar revisión ({Object.keys(modified).length})</button>
        </div>
      )}
    </div>
  );
};

export default ReglasPage; 