import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import axios from 'axios';
import EditPlanModal from '../components/modals/EditPlanModal';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import NewItemButton from '../components/NewItemButton';
import ConfirmModal from '../components/ConfirmModal';

interface Plan {
  id: string;
  name: string;
  price: number;
  creditosTotales?: number;
  freeCredits?: number;
  permiteCompuestas?: boolean;
  watermarkOrg?: boolean;
  watermarkPrefas?: boolean;
  discountPct?: number;
  discountUntil?: string;
  prioridad?: number;
}

const FacturacionPage: React.FC = () => {
  const [tab, setTab] = useState<'pagos' | 'planes' | 'overages'>('pagos');
  const [pagos, setPagos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{id:string,name:string}|null>(null);
  const [basePlans,setBasePlans]=useState<Plan[]>([]); // planes normales para dropdown
  const [parentPlanFilter,setParentPlanFilter]=useState<string>('');

  useEffect(() => {
    if (tab === 'pagos') {
      axios.get('/api/admin/billing/pagos')
        .then(res => setPagos(res.data))
        .catch(() => setPagos([]));
    } else if (tab === 'planes') {
      axios.get('/api/admin/billing/planes')
        .then(res => {
          const data = res.data;
          const arr = Array.isArray(data) ? data : Object.values(data || {});
          setPlanes(arr as any);
          setError(null);
        })
        .catch(() => { setError('Error al cargar planes'); setSuccess(null); });
    } else if (tab==='overages') {
      if(basePlans.length===0){ axios.get('/api/admin/billing/planes') .then(res=>{setBasePlans(res.data); if(!parentPlanFilter && res.data.length) setParentPlanFilter(res.data[0].id);}); }
      const url=`/api/admin/billing/planes?isOverage=1${parentPlanFilter?`&parentPlan=${parentPlanFilter}`:''}`;
      axios.get(url)
        .then(res=>setPlanes(res.data))
        .catch(()=>{setError('Error al cargar overages'); setSuccess(null);});
    }
  }, [tab,parentPlanFilter]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <button className={`btn-primary ${tab === 'pagos' ? '' : 'opacity-50'}`} onClick={() => setTab('pagos')}>Pagos</button>
        <button className={`btn-primary ${tab === 'planes' ? '' : 'opacity-50'}`} onClick={() => setTab('planes')}>Planes</button>
        <button className={`btn-primary ${tab === 'overages' ? '' : 'opacity-50'}`} onClick={() => setTab('overages')}>Overages</button>
      </div>

      {tab === 'pagos' && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Registro de pagos</h3>
          <p>Todavía no hay pagos registrados.</p>
        </Card>
      )}

      {tab === 'planes' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Planes</h3>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Plan</th>
                <th className="px-4 py-2 text-left">Precio (ARS)</th>
                <th className="px-4 py-2 text-left">Créditos totales</th>
                <th className="px-4 py-2 text-left">Compuestas</th>
                <th className="px-4 py-2 text-left">Prioridad</th>
                <th className="px-4 py-2 text-left">Descuento</th>
                <th className="px-4 py-2 text-left">Válido hasta</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.price != null ? `$${p.price.toLocaleString('es-AR')}` : '—'}</td>
                  <td className="px-4 py-2">{(p.creditosTotales || 0) + (p.freeCredits || 0)}</td>
                  <td className="px-4 py-2">{p.permiteCompuestas ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-2">{(p as any).prioridad ?? '—'}</td>
                  <td className="px-4 py-2">{p.discountPct ? `${p.discountPct}%` : '—'}</td>
                  <td className="px-4 py-2">{p.discountUntil ? new Date(p.discountUntil).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <EditIconButton onClick={() => setEditing(p)} />
                    <DeleteIconButton onClick={() => setConfirmDelete({id: p.id, name: p.name})} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <NewItemButton label="+ Nuevo plan" onClick={() => setEditing({} as Partial<Plan>)} />
          </div>
        </Card>
      )}

      {tab === 'overages' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Paquetes Overages</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Plan base:</label>
              <select
                className="input-field"
                value={parentPlanFilter}
                onChange={e=>setParentPlanFilter(e.target.value)}
              >
                {basePlans.map(bp=> (
                  <option key={bp.id} value={bp.id}>{bp.name}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Paquete</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Créditos</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map(p=> (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">${p.price}</td>
                  <td className="px-4 py-2">{p.creditosTotales}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <EditIconButton onClick={()=>setEditing(p)} />
                    <DeleteIconButton onClick={()=>setConfirmDelete({id:p.id,name:p.name})} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <NewItemButton label="+ Nuevo paquete" onClick={()=>setEditing({isOverage:true,parentPlan:parentPlanFilter} as Partial<Plan>)} />
          </div>
        </Card>
      )}

      {editing && (
        <EditPlanModal
          plan={editing}
          basePlans={basePlans}
          onClose={() => setEditing(null)}
          onSave={async (updated) => {
            try {
              if (editing.id) {
                await axios.patch(`/api/admin/billing/planes/${editing.id}`, updated);
                setSuccess('Plan actualizado correctamente');
              } else {
                await axios.post('/api/admin/billing/planes', updated);
                setSuccess('Plan creado correctamente');
              }
              setError(null);
              setEditing(null);
              const res = await axios.get('/api/admin/billing/planes');
              setPlanes(Array.isArray(res.data) ? res.data : Object.values(res.data));
            } catch (err:any) {
              console.error(err);
              setError('Error guardando el plan');
              setSuccess(null);
            }
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar plan"
          message={`¿Seguro que deseas eliminar el plan "${confirmDelete.name}"?`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={async () => {
            try {
              await axios.delete(`/api/admin/billing/planes/${confirmDelete.id}`);
              setPlanes(prev=>prev.filter(pl=>pl.id!==confirmDelete.id));
              setConfirmDelete(null);
              setSuccess('Plan eliminado correctamente');
              setError(null);
            } catch (err:any) {
              console.error(err);
              setError('Error eliminando el plan');
              setSuccess(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default FacturacionPage; 