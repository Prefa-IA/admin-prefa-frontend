import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ConfirmModal from '../components/ConfirmModal';
import RevenueBarChart from '../components/dashboard/RevenueBarChart';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import EditPlanModal from '../components/modals/EditPlanModal';
import NewItemButton from '../components/NewItemButton';
import {
  Card,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { Plan } from '../types/planes';

interface Payment {
  id: string;
  amount: number;
  date: string;
  [key: string]: unknown;
}

interface RevenueData {
  planId: string;
  planName: string;
  revenue: number;
  plan: string;
  [key: string]: unknown;
}

const ERROR_LOADING = 'Error al cargar';
const PLANES_API_ENDPOINT = '/api/admin/billing/planes';
const OVERAGES_API_ENDPOINT = '/api/admin/billing/overages';

const useAnalytics = () => {
  const [purchasesByPlan, setPurchasesByPlan] = useState<
    { planId: string; planName: string; count: number }[]
  >([]);
  const [purchasesByOverage, setPurchasesByOverage] = useState<
    { overageId: string; overageName: string; parentPlan: string; count: number }[]
  >([]);
  const [revenuePlan, setRevenuePlan] = useState<RevenueData[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<RevenueData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);

  useEffect(() => {
    const loadPurchasesByPlan = async () => {
      try {
        const res = await axios.get('/admin/analytics/purchases-by-plan');
        setPurchasesByPlan(res.data);
      } catch {
        setPurchasesByPlan([]);
      }
    };

    const loadPurchasesByOverage = async () => {
      try {
        const res = await axios.get('/admin/analytics/purchases-by-overage');
        setPurchasesByOverage(res.data);
      } catch {
        setPurchasesByOverage([]);
      }
    };

    const loadRevenuePlan = async () => {
      try {
        const res = await axios.get<RevenueData[]>('/admin/analytics/revenue-plan');
        const mapped = res.data.map((item) => ({
          ...item,
          plan: item.planName || item.planId || '',
        }));
        setRevenuePlan(mapped);
      } catch {
        setRevenuePlan([]);
      }
    };

    const loadRevenueHistory = async () => {
      try {
        const res = await axios.get<RevenueData[]>('/admin/analytics/revenue-history');
        setRevenueHistory(res.data);
      } catch {
        setRevenueHistory([]);
      }
    };

    const loadMonthlyRevenue = async () => {
      try {
        const res = await axios.get<{ monthlyRevenue?: number }>('/admin/analytics');
        setMonthlyRevenue(res.data.monthlyRevenue || 0);
      } catch {
        setMonthlyRevenue(0);
      }
    };

    void loadPurchasesByPlan();
    void loadPurchasesByOverage();
    void loadRevenuePlan();
    void loadRevenueHistory();
    void loadMonthlyRevenue();
  }, []);

  return {
    purchasesByPlan,
    purchasesByOverage,
    revenuePlan,
    revenueHistory,
    monthlyRevenue,
  };
};

const validateOverageUniqueness = async (
  parentPlan: string,
  editingId?: string
): Promise<boolean> => {
  try {
    const existingOveragesRes = await axios.get<Plan[]>(OVERAGES_API_ENDPOINT);
    const existingOverages: Plan[] = Array.isArray(existingOveragesRes.data)
      ? existingOveragesRes.data
      : Object.values(existingOveragesRes.data || {});

    const existingOverage = existingOverages.find(
      (o: Plan) => o.parentPlan === parentPlan && o.id !== editingId
    );

    return !existingOverage;
  } catch {
    return true;
  }
};

const saveOverage = async (editing: Partial<Plan>, updated: Partial<Plan>): Promise<string> => {
  if (editing.id) {
    await axios.patch(`${OVERAGES_API_ENDPOINT}/${editing.id}`, updated);
    return 'Overage actualizado correctamente';
  }
  await axios.post(OVERAGES_API_ENDPOINT, updated);
  return 'Overage creado correctamente';
};

const savePlan = async (editing: Partial<Plan>, updated: Partial<Plan>): Promise<string> => {
  console.log('[FacturacionPage] savePlan llamado:', {
    editingId: editing.id,
    updatedTag: updated.tag,
    updatedTagType: typeof updated.tag,
    fullPayload: updated,
  });

  if (editing.id) {
    const response = await axios.patch(`${PLANES_API_ENDPOINT}/${editing.id}`, updated);
    console.log('[FacturacionPage] Respuesta del PATCH:', {
      planId: response.data?.id,
      tagEnRespuesta: response.data?.tag,
      tagEnRespuestaType: typeof response.data?.tag,
    });
    return 'Plan actualizado correctamente';
  }
  const response = await axios.post(PLANES_API_ENDPOINT, updated);
  console.log('[FacturacionPage] Respuesta del POST:', {
    planId: response.data?.id,
    tagEnRespuesta: response.data?.tag,
    tagEnRespuestaType: typeof response.data?.tag,
  });
  return 'Plan creado correctamente';
};

const validatePlanBasicFields = (updated: Partial<Plan>): boolean => {
  if (!updated.name || updated.name.trim() === '') {
    toast.error('El nombre del plan es requerido');
    return false;
  }
  return true;
};

const validateOveragePlan = async (
  updated: Partial<Plan>,
  editing: Partial<Plan>
): Promise<boolean> => {
  if (!updated.parentPlan) {
    toast.error('Debes seleccionar un plan base para el overage');
    return false;
  }
  const isValid = await validateOverageUniqueness(updated.parentPlan, editing.id);
  if (!isValid) {
    toast.error('El plan base ya cuenta con un overage. Un plan no puede tener más de un overage.');
    return false;
  }
  return true;
};

const validateBasePlan = (updated: Partial<Plan>): boolean => {
  if (!updated.price || updated.price <= 0) {
    toast.error('El precio debe ser mayor a 0');
    return false;
  }
  if (!updated.creditosTotales || updated.creditosTotales <= 0) {
    toast.error('Los créditos totales deben ser mayor a 0');
    return false;
  }
  return true;
};

const handleSavePlan = async (
  editing: Partial<Plan>,
  updated: Partial<Plan>,
  setEditing: (editing: Partial<Plan> | null) => void,
  refreshData: () => void
) => {
  try {
    console.log('[FacturacionPage] handleSavePlan llamado:', {
      editingId: editing.id,
      updatedTag: updated.tag,
      updatedTagType: typeof updated.tag,
      fullUpdated: updated,
    });

    if (!validatePlanBasicFields(updated)) {
      return;
    }

    if (updated.isOverage) {
      const isValid = await validateOveragePlan(updated, editing);
      if (!isValid) {
        return;
      }
    } else {
      if (!validateBasePlan(updated)) {
        return;
      }
    }

    console.log('[FacturacionPage] Enviando a savePlan/saveOverage:', {
      editingId: editing.id,
      tagValue: updated.tag,
      tagType: typeof updated.tag,
    });

    const successMessage = updated.isOverage
      ? await saveOverage(editing, updated)
      : await savePlan(editing, updated);

    toast.success(successMessage);
    setEditing(null);
    refreshData();
  } catch (err: unknown) {
    console.error('[FacturacionPage] Error guardando plan:', err);
    const errorMessage =
      (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
        ?.error ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Error guardando el plan';
    toast.error(errorMessage);
  }
};

const handleDeletePlan = async (
  planId: string,
  isOverage: boolean,
  setConfirmDelete: (confirmDelete: { id: string; name: string } | null) => void,
  refreshData: () => void
) => {
  try {
    if (isOverage) {
      await axios.delete(`${OVERAGES_API_ENDPOINT}/${planId}`);
      toast.success('Overage eliminado correctamente');
    } else {
      await axios.delete(`${PLANES_API_ENDPOINT}/${planId}`);
      toast.success('Plan eliminado correctamente');
    }
    setConfirmDelete(null);
    refreshData();
  } catch (err: unknown) {
    console.error(err);
    const errorMessage =
      (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
        ?.error ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Error eliminando el plan';
    toast.error(errorMessage);
  }
};

const useTabData = (tab: 'pagos' | 'planes' | 'overages', basePlansLength: number) => {
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [overages, setOverages] = useState<Plan[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const loadPagos = async () => {
      try {
        const res = await axios.get<Payment[]>('/api/admin/billing/pagos');
        setPagos(res.data);
      } catch {
        setPagos([]);
      }
    };

    const loadPlanes = async () => {
      try {
        const res = await axios.get<Plan[] | Record<string, Plan>>(PLANES_API_ENDPOINT);
        const data = res.data;
        const arr = Array.isArray(data) ? data : Object.values(data || {});
        // Filtrar out overages - solo mostrar planes reales (sin isOverage y sin parentPlan)
        const planesOnly = arr.filter((p) => !p.isOverage && !p.parentPlan);
        setPlanes(planesOnly);
      } catch {
        toast.error(`${ERROR_LOADING} planes`);
      }
    };

    const loadOverages = async () => {
      try {
        const res = await axios.get<Plan[]>(OVERAGES_API_ENDPOINT);
        const data = res.data;
        const arr: Plan[] = Array.isArray(data) ? data : Object.values(data || {});
        setOverages(arr);
      } catch {
        setOverages([]);
      }
    };

    const loadBasePlans = async () => {
      try {
        const res = await axios.get<Plan[]>(PLANES_API_ENDPOINT);
        return res.data;
      } catch {
        return [];
      }
    };

    const loadOveragesFiltered = async () => {
      try {
        const res = await axios.get<Plan[]>(OVERAGES_API_ENDPOINT);
        const arr: Plan[] = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
        setPlanes(arr);
      } catch {
        toast.error(`${ERROR_LOADING} overages`);
      }
    };

    if (tab === 'pagos') {
      void loadPagos();
    } else if (tab === 'planes') {
      void loadPlanes();
      void loadOverages();
    } else if (tab === 'overages') {
      if (basePlansLength === 0) {
        void loadBasePlans();
      }
      void loadOveragesFiltered();
    }
  }, [tab, basePlansLength, refreshTrigger]);

  return { pagos, planes, overages, refreshData };
};

const PlanRow: React.FC<{
  plan: Plan;
  hasOverage: boolean;
  isSuperAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ plan, hasOverage, isSuperAdmin, onEdit, onDelete }) => (
  <TableRow key={plan.id}>
    <TableCell className="font-medium">{plan.name}</TableCell>
    <TableCell>{plan.price != null ? `$${plan.price.toLocaleString('es-AR')}` : '—'}</TableCell>
    <TableCell className="hidden md:table-cell">
      {(plan.creditosTotales || 0) + (plan.freeCredits || 0)}
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          plan.permiteCompuestas
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {plan.permiteCompuestas ? 'Sí' : 'No'}
      </span>
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      {(plan as Plan & { prioridad?: number }).prioridad ?? '—'}
    </TableCell>
    <TableCell className="hidden md:table-cell">
      {plan.discountPct ? `${plan.discountPct}%` : '—'}
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      {plan.discountUntil ? new Date(plan.discountUntil).toLocaleDateString('es-AR') : '—'}
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          hasOverage
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {hasOverage ? 'Sí' : 'No'}
      </span>
    </TableCell>
    <TableCell align="right">
      {isSuperAdmin ? (
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={onEdit} />
          <DeleteIconButton onClick={onDelete} />
        </div>
      ) : (
        <span className="text-gray-400 text-sm">Solo super admin</span>
      )}
    </TableCell>
  </TableRow>
);

const PlanesTable: React.FC<{
  planes: Plan[];
  overages: Plan[];
  isSuperAdmin: boolean;
  onEditPlan: (p: Plan) => void;
  onDeletePlan: (p: Plan) => void;
}> = ({ planes, overages, isSuperAdmin, onEditPlan, onDeletePlan }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Plan</TableHead>
        <TableHead>Precio (ARS)</TableHead>
        <TableHead className="hidden md:table-cell">Créditos totales</TableHead>
        <TableHead className="hidden lg:table-cell">Compuestas</TableHead>
        <TableHead className="hidden lg:table-cell">Prioridad</TableHead>
        <TableHead className="hidden md:table-cell">Descuento</TableHead>
        <TableHead className="hidden lg:table-cell">Válido hasta</TableHead>
        <TableHead className="hidden lg:table-cell">Overage</TableHead>
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
        planes.map((p) => {
          const hasOverage = overages.some((o) => o.parentPlan === p.id);
          return (
            <PlanRow
              key={p.id}
              plan={p}
              hasOverage={hasOverage}
              isSuperAdmin={isSuperAdmin}
              onEdit={() => onEditPlan(p)}
              onDelete={() => onDeletePlan(p)}
            />
          );
        })
      )}
    </TableBody>
  </Table>
);

const PlanesTab: React.FC<{
  planes: Plan[];
  overages: Plan[];
  isSuperAdmin: boolean;
  onNewPlan: () => void;
  onEditPlan: (p: Plan) => void;
  onDeletePlan: (p: Plan) => void;
}> = ({ planes, overages, isSuperAdmin, onNewPlan, onEditPlan, onDeletePlan }) => (
  <Card
    title="Planes"
    headerActions={isSuperAdmin ? <NewItemButton label="Nuevo plan" onClick={onNewPlan} /> : null}
  >
    <PlanesTable
      planes={planes}
      overages={overages}
      isSuperAdmin={isSuperAdmin}
      onEditPlan={onEditPlan}
      onDeletePlan={onDeletePlan}
    />
  </Card>
);

const OverageRow: React.FC<{
  plan: Plan;
  basePlans: Plan[];
  isSuperAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ plan, basePlans, isSuperAdmin, onEdit, onDelete }) => {
  const parentPlanName = plan.parentPlan
    ? basePlans.find((bp) => bp.id === plan.parentPlan)?.name || plan.parentPlan
    : '—';

  return (
    <TableRow key={plan.id}>
      <TableCell className="font-medium">{plan.name}</TableCell>
      <TableCell>${plan.price?.toLocaleString('es-AR') || '—'}</TableCell>
      <TableCell className="hidden md:table-cell">{plan.creditosTotales || '—'}</TableCell>
      <TableCell className="hidden md:table-cell">{parentPlanName}</TableCell>
      <TableCell align="right">
        {isSuperAdmin ? (
          <div className="flex items-center justify-end gap-1">
            <EditIconButton onClick={onEdit} />
            <DeleteIconButton onClick={onDelete} />
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Solo super admin</span>
        )}
      </TableCell>
    </TableRow>
  );
};

const OveragesTable: React.FC<{
  planes: Plan[];
  basePlans: Plan[];
  isSuperAdmin: boolean;
  onEditOverage: (p: Plan) => void;
  onDeleteOverage: (p: Plan) => void;
}> = ({ planes, basePlans, isSuperAdmin, onEditOverage, onDeleteOverage }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Paquete</TableHead>
        <TableHead>Precio</TableHead>
        <TableHead className="hidden md:table-cell">Créditos</TableHead>
        <TableHead className="hidden md:table-cell">Plan base</TableHead>
        <TableHead align="right">Acciones</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {planes.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay paquetes overages registrados
          </TableCell>
        </TableRow>
      ) : (
        planes.map((p) => (
          <OverageRow
            key={p.id}
            plan={p}
            basePlans={basePlans}
            isSuperAdmin={isSuperAdmin}
            onEdit={() => onEditOverage(p)}
            onDelete={() => onDeleteOverage(p)}
          />
        ))
      )}
    </TableBody>
  </Table>
);

const OveragesHeader: React.FC<{
  isSuperAdmin: boolean;
  onNewOverage: () => void;
}> = ({ isSuperAdmin, onNewOverage }) => (
  <div className="flex items-center gap-4">
    {isSuperAdmin && <NewItemButton label="Nuevo paquete" onClick={onNewOverage} />}
  </div>
);

const OveragesTab: React.FC<{
  planes: Plan[];
  basePlans: Plan[];
  isSuperAdmin: boolean;
  onNewOverage: () => void;
  onEditOverage: (p: Plan) => void;
  onDeleteOverage: (p: Plan) => void;
}> = ({ planes, basePlans, isSuperAdmin, onNewOverage, onEditOverage, onDeleteOverage }) => (
  <Card
    title="Paquetes Overages"
    headerActions={<OveragesHeader isSuperAdmin={isSuperAdmin} onNewOverage={onNewOverage} />}
  >
    <OveragesTable
      planes={planes}
      basePlans={basePlans}
      isSuperAdmin={isSuperAdmin}
      onEditOverage={onEditOverage}
      onDeleteOverage={onDeleteOverage}
    />
  </Card>
);

const MonthlyRevenueCard: React.FC<{ monthlyRevenue: number }> = ({ monthlyRevenue }) => (
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
);

const RevenueHistoryChart: React.FC<{ revenueHistory: RevenueData[] }> = ({ revenueHistory }) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card title="Ingresos históricos (últimos 12 meses)">
      <div className="mt-4">
        {revenueHistory.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Sin información disponible.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
              <XAxis dataKey="label" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={formatCurrency} width={80} />
              <Tooltip
                formatter={(value: number) => `$${Number(value).toLocaleString('es-AR')}`}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

const PurchasesChart: React.FC<{
  data: {
    planId?: string;
    overageId?: string;
    planName?: string;
    overageName?: string;
    count: number;
  }[];
  title: string;
  dataKey: string;
  nameKey: string;
  idKey: string;
}> = ({ data, title, dataKey, nameKey, idKey }) => {
  const CHART_COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#ec4899',
    '#14b8a6',
  ];

  if (data.length === 0) {
    return (
      <Card title={title}>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay datos disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 120, right: 20, top: 20, bottom: 20 }}
          >
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey={nameKey} type="category" width={110} stroke="#6b7280" />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString('es-AR'), 'Compras']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
              }}
            />
            <Bar dataKey={dataKey} radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => {
                const entryId = Reflect.get(entry, idKey) as string;
                return (
                  <Cell key={`cell-${entryId}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.map((item) => {
            const itemName = Reflect.get(item, nameKey) as string;
            const itemId = Reflect.get(item, idKey) as string;
            return (
              <div key={itemId} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {item.count.toLocaleString('es-AR')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{itemName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const PagosTab: React.FC<{
  monthlyRevenue: number;
  revenueHistory: RevenueData[];
  revenuePlan: RevenueData[];
  purchasesByPlan: { planId: string; planName: string; count: number }[];
  purchasesByOverage: {
    overageId: string;
    overageName: string;
    parentPlan: string;
    count: number;
  }[];
}> = ({ monthlyRevenue, revenueHistory, revenuePlan, purchasesByPlan, purchasesByOverage }) => (
  <div className="space-y-6">
    <MonthlyRevenueCard monthlyRevenue={monthlyRevenue} />
    <RevenueHistoryChart revenueHistory={revenueHistory} />
    <RevenueBarChart data={revenuePlan} />
    <PurchasesChart
      data={purchasesByPlan}
      title="Compras por plan"
      dataKey="count"
      nameKey="planName"
      idKey="planId"
    />
    <PurchasesChart
      data={purchasesByOverage}
      title="Compras por overage"
      dataKey="count"
      nameKey="overageName"
      idKey="overageId"
    />
    <Card title="Registro de pagos">
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Todavía no hay pagos registrados.
      </div>
    </Card>
  </div>
);

const FacturacionTabs: React.FC<{
  tab: 'pagos' | 'planes' | 'overages';
  onTabChange: (tab: 'pagos' | 'planes' | 'overages') => void;
}> = ({ tab, onTabChange }) => {
  const tabs = [
    { id: 'pagos' as const, label: 'Pagos' },
    { id: 'planes' as const, label: 'Planes' },
    { id: 'overages' as const, label: 'Overages' },
  ];

  return (
    <div className="mb-4 sm:mb-6 flex space-x-1 sm:space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
            tab === t.id
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => onTabChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

const useBasePlans = (tab: 'pagos' | 'planes' | 'overages') => {
  const [basePlans, setBasePlans] = useState<Plan[]>([]);

  useEffect(() => {
    const loadBasePlans = async () => {
      try {
        const res = await axios.get<Plan[]>(PLANES_API_ENDPOINT);
        // Filtrar out overages - solo mostrar planes reales (sin isOverage y sin parentPlan)
        const planesOnly = res.data.filter((p) => !p.isOverage && !p.parentPlan);
        setBasePlans(planesOnly);
      } catch {
        // Silently handle error
      }
    };
    if (tab === 'overages' && basePlans.length === 0) {
      void loadBasePlans();
    }
  }, [tab, basePlans.length]);

  return { basePlans };
};

const useTabSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') as 'pagos' | 'planes' | 'overages') || 'pagos';
  const [tab, setTab] = useState<'pagos' | 'planes' | 'overages'>(tabFromUrl);

  useEffect(() => {
    const urlTab = (searchParams.get('tab') as 'pagos' | 'planes' | 'overages') || 'pagos';
    if (urlTab !== tab) {
      setTab(urlTab);
    }
  }, [searchParams, tab]);

  const handleTabChange = (newTab: 'pagos' | 'planes' | 'overages') => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return { tab, handleTabChange };
};

interface TabContentProps {
  tab: 'pagos' | 'planes' | 'overages';
  analytics: ReturnType<typeof useAnalytics>;
  planes: Plan[];
  overages: Plan[];
  basePlans: Plan[];
  isSuperAdmin: boolean;
  onNewPlan: () => void;
  onEditPlan: (p: Plan) => void;
  onDeletePlan: (p: Plan) => void;
  onNewOverage: () => void;
  onEditOverage: (p: Plan) => void;
  onDeleteOverage: (p: Plan) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  tab,
  analytics,
  planes,
  overages,
  basePlans,
  isSuperAdmin,
  onNewPlan,
  onEditPlan,
  onDeletePlan,
  onNewOverage,
  onEditOverage,
  onDeleteOverage,
}) => {
  if (tab === 'pagos') {
    return (
      <PagosTab
        monthlyRevenue={analytics.monthlyRevenue}
        revenueHistory={analytics.revenueHistory}
        revenuePlan={analytics.revenuePlan}
        purchasesByPlan={analytics.purchasesByPlan}
        purchasesByOverage={analytics.purchasesByOverage}
      />
    );
  }

  if (tab === 'planes') {
    return (
      <PlanesTab
        planes={planes}
        overages={overages}
        isSuperAdmin={isSuperAdmin}
        onNewPlan={onNewPlan}
        onEditPlan={onEditPlan}
        onDeletePlan={onDeletePlan}
      />
    );
  }

  return (
    <OveragesTab
      planes={planes}
      basePlans={basePlans}
      isSuperAdmin={isSuperAdmin}
      onNewOverage={onNewOverage}
      onEditOverage={onEditOverage}
      onDeleteOverage={onDeleteOverage}
    />
  );
};

interface ModalsProps {
  editing: Partial<Plan> | null;
  confirmDelete: { id: string; name: string } | null;
  tab: 'pagos' | 'planes' | 'overages';
  basePlans: Plan[];
  setEditing: (plan: Partial<Plan> | null) => void;
  setConfirmDelete: (deleteInfo: { id: string; name: string } | null) => void;
  refreshData: () => void;
}

const Modals: React.FC<ModalsProps> = ({
  editing,
  confirmDelete,
  tab,
  basePlans,
  setEditing,
  setConfirmDelete,
  refreshData,
}) => {
  const handleSave = (updated: Partial<Plan>) => {
    if (editing) {
      void handleSavePlan(editing, updated, setEditing, refreshData);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      const isOverage = tab === 'overages';
      void handleDeletePlan(confirmDelete.id, isOverage, setConfirmDelete, refreshData);
    }
  };

  return (
    <>
      {editing && (
        <EditPlanModal
          plan={editing}
          basePlans={basePlans}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar plan"
          message={`¿Seguro que deseas eliminar el plan "${confirmDelete.name}"?`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

const FacturacionPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const { tab, handleTabChange } = useTabSync();
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const analytics = useAnalytics();
  const { basePlans } = useBasePlans(tab);
  const { planes, overages, refreshData } = useTabData(tab, basePlans.length);

  return (
    <div>
      <PageHeader title="Facturación" description="Gestiona planes, pagos y overages" />
      <FacturacionTabs tab={tab} onTabChange={handleTabChange} />

      <TabContent
        tab={tab}
        analytics={analytics}
        planes={planes}
        overages={overages}
        basePlans={basePlans}
        isSuperAdmin={isSuperAdmin}
        onNewPlan={() => setEditing({} as Partial<Plan>)}
        onEditPlan={(p) => setEditing(p)}
        onDeletePlan={(p) => setConfirmDelete({ id: p.id, name: p.name })}
        onNewOverage={() => setEditing({ isOverage: true } as Partial<Plan>)}
        onEditOverage={(p) => setEditing({ ...p, isOverage: true })}
        onDeleteOverage={(p) => setConfirmDelete({ id: p.id, name: p.name })}
      />

      <Modals
        editing={editing}
        confirmDelete={confirmDelete}
        tab={tab}
        basePlans={basePlans}
        setEditing={setEditing}
        setConfirmDelete={setConfirmDelete}
        refreshData={refreshData}
      />
    </div>
  );
};

export default FacturacionPage;
