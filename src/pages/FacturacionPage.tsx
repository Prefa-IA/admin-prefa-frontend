import React, { useEffect, useState } from 'react';
import { Card, PageHeader, Button, Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '../components/ui';
import axios from 'axios';
import EditPlanModal from '../components/modals/EditPlanModal';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import NewItemButton from '../components/NewItemButton';
import ConfirmModal from '../components/ConfirmModal';
import { Plan } from '../types/planes';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import RevenueBarChart from '../components/dashboard/RevenueBarChart';

const FacturacionPage: React.FC = () => {
  const [tab, setTab] = useState<'pagos' | 'planes' | 'overages'>('pagos');
  const [pagos, setPagos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{id:string,name:string}|null>(null);
  const [basePlans,setBasePlans]=useState<Plan[]>([]);
  const [parentPlanFilter,setParentPlanFilter]=useState<string>('');
  const [purchasesByPlan, setPurchasesByPlan] = useState<{ planId: string; planName: string; count: number }[]>([]);
  const [purchasesByOverage, setPurchasesByOverage] = useState<{ overageId: string; overageName: string; parentPlan: string; count: number }[]>([]);
  const [revenuePlan, setRevenuePlan] = useState<any[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [overages, setOverages] = useState<Plan[]>([]);

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
      
      axios.get('/api/admin/billing/planes?isOverage=1')
        .then(res => {
          const data = res.data;
          const arr = Array.isArray(data) ? data : Object.values(data || {});
          setOverages(arr as any);
        })
        .catch(() => setOverages([]));
    } else if (tab==='overages') {
      if(basePlans.length===0){ axios.get('/api/admin/billing/planes') .then(res=>{setBasePlans(res.data); if(!parentPlanFilter && res.data.length) setParentPlanFilter(res.data[0].id);}); }
      const url=`/api/admin/billing/planes?isOverage=1${parentPlanFilter?`&parentPlan=${parentPlanFilter}`:''}`;
      axios.get(url)
        .then(res=>setPlanes(res.data))
        .catch(()=>{setError('Error al cargar overages'); setSuccess(null);});
    }
  }, [tab,parentPlanFilter]);

  useEffect(() => {
    axios.get('/admin/analytics/purchases-by-plan')
      .then(res => setPurchasesByPlan(res.data))
      .catch(() => setPurchasesByPlan([]));
    
    axios.get('/admin/analytics/purchases-by-overage')
      .then(res => setPurchasesByOverage(res.data))
      .catch(() => setPurchasesByOverage([]));
    
    axios.get('/admin/analytics/revenue-plan')
      .then(res => setRevenuePlan(res.data))
      .catch(() => setRevenuePlan([]));
    
    axios.get('/admin/analytics/revenue-history')
      .then(res => setRevenueHistory(res.data))
      .catch(() => setRevenueHistory([]));
    
    axios.get('/admin/analytics')
      .then(res => setMonthlyRevenue(res.data.monthlyRevenue || 0))
      .catch(() => setMonthlyRevenue(0));
  }, []);

  const tabs = [
    { id: 'pagos' as const, label: 'Pagos' },
    { id: 'planes' as const, label: 'Planes' },
    { id: 'overages' as const, label: 'Overages' }
  ];

  return (
    <div>
      <PageHeader
        title="Facturación"
        description="Gestiona planes, pagos y overages"
      />

      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === t.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pagos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <Card title="Ingresos del mes actual">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${monthlyRevenue.toLocaleString('es-AR')}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Suma de planes vigentes</p>
              </Card>
            </div>
          </div>
          
          <Card title="Ingresos históricos (últimos 12 meses)">
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                  <XAxis dataKey="label" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR')}`} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <RevenueBarChart data={revenuePlan} />

          <Card title="Compras por plan">
            {purchasesByPlan.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay datos disponibles
              </div>
            ) : (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={purchasesByPlan} layout="vertical" margin={{ left: 120, right: 20, top: 20, bottom: 20 }}>
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="planName" type="category" width={110} stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString('es-AR'), 'Compras']}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {purchasesByPlan.map((entry, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
                        return <Cell key={`cell-${entry.planId}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {purchasesByPlan.map((item) => (
                    <div key={item.planId} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {item.count.toLocaleString('es-AR')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.planName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Compras por overage">
            {purchasesByOverage.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay datos disponibles
              </div>
            ) : (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={purchasesByOverage} layout="vertical" margin={{ left: 120, right: 20, top: 20, bottom: 20 }}>
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="overageName" type="category" width={110} stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString('es-AR'), 'Compras']}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {purchasesByOverage.map((entry, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
                        return <Cell key={`cell-${entry.overageId}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {purchasesByOverage.map((item) => (
                    <div key={item.overageId} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {item.count.toLocaleString('es-AR')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.overageName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <Card title="Registro de pagos">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Todavía no hay pagos registrados.
            </div>
          </Card>
        </div>
      )}

      {tab === 'planes' && (
        <Card
          title="Planes"
          headerActions={
            <NewItemButton label="Nuevo plan" onClick={() => setEditing({} as Partial<Plan>)} />
          }
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Precio (ARS)</TableHead>
                <TableHead>Créditos totales</TableHead>
                <TableHead>Compuestas</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Válido hasta</TableHead>
                <TableHead>Overage</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay planes registrados
                  </TableCell>
                </TableRow>
              ) : (
                planes.map(p => {
                  const hasOverage = overages.some(o => o.parentPlan === p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.price != null ? `$${p.price.toLocaleString('es-AR')}` : '—'}</TableCell>
                      <TableCell>{(p.creditosTotales || 0) + (p.freeCredits || 0)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          p.permiteCompuestas
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {p.permiteCompuestas ? 'Sí' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>{(p as any).prioridad ?? '—'}</TableCell>
                      <TableCell>{p.discountPct ? `${p.discountPct}%` : '—'}</TableCell>
                      <TableCell>{p.discountUntil ? new Date(p.discountUntil).toLocaleDateString('es-AR') : '—'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          hasOverage
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {hasOverage ? 'Sí' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1">
                          <EditIconButton onClick={() => setEditing(p)} />
                          <DeleteIconButton onClick={() => setConfirmDelete({id: p.id, name: p.name})} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 'overages' && (
        <Card
          title="Paquetes Overages"
          headerActions={
            <div className="flex items-center gap-4">
              {basePlans.length > 0 && (
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Plan base
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={parentPlanFilter}
                    onChange={(e) => setParentPlanFilter(e.target.value)}
                  >
                    {basePlans.map(bp => (
                      <option key={bp.id} value={bp.id}>{bp.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <NewItemButton label="Nuevo paquete" onClick={()=>setEditing({isOverage:true,parentPlan:parentPlanFilter} as Partial<Plan>)} />
            </div>
          }
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paquete</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay paquetes overages registrados
                  </TableCell>
                </TableRow>
              ) : (
                planes.map(p=> (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>${p.price?.toLocaleString('es-AR') || '—'}</TableCell>
                    <TableCell>{p.creditosTotales || '—'}</TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <EditIconButton onClick={()=>setEditing(p)} />
                        <DeleteIconButton onClick={()=>setConfirmDelete({id:p.id,name:p.name})} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
              const overagesRes = await axios.get('/api/admin/billing/planes?isOverage=1');
              setOverages(Array.isArray(overagesRes.data) ? overagesRes.data : Object.values(overagesRes.data || {}));
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