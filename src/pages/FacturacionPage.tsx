import React, { useEffect, useState } from 'react';
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

const handleSavePlan = async (
  editing: Partial<Plan>,
  updated: Partial<Plan>,
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setEditing: (editing: Partial<Plan> | null) => void
) => {
  try {
    if (editing.id) {
      await axios.patch(`${PLANES_API_ENDPOINT}/${editing.id}`, updated);
      setSuccess('Plan actualizado correctamente');
    } else {
      await axios.post(PLANES_API_ENDPOINT, updated);
      setSuccess('Plan creado correctamente');
    }
    setError(null);
    setEditing(null);
    window.location.reload();
  } catch (err: unknown) {
    console.error(err);
    setError('Error guardando el plan');
    setSuccess(null);
  }
};

const handleDeletePlan = async (
  planId: string,
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setConfirmDelete: (confirmDelete: { id: string; name: string } | null) => void
) => {
  try {
    await axios.delete(`${PLANES_API_ENDPOINT}/${planId}`);
    setConfirmDelete(null);
    setSuccess('Plan eliminado correctamente');
    setError(null);
    window.location.reload();
  } catch (err: unknown) {
    console.error(err);
    setError('Error eliminando el plan');
    setSuccess(null);
  }
};

const useTabData = (
  tab: 'pagos' | 'planes' | 'overages',
  parentPlanFilter: string,
  basePlansLength: number
) => {
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [overages, setOverages] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        setPlanes(arr);
        setError(null);
      } catch {
        setError(`${ERROR_LOADING} planes`);
      }
    };

    const loadOverages = async () => {
      try {
        const res = await axios.get<Plan[] | Record<string, Plan>>(
          `${PLANES_API_ENDPOINT}?isOverage=1`
        );
        const data = res.data;
        const arr = Array.isArray(data) ? data : Object.values(data || {});
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
      const url = `${PLANES_API_ENDPOINT}?isOverage=1${parentPlanFilter ? `&parentPlan=${parentPlanFilter}` : ''}`;
      try {
        const res = await axios.get<Plan[]>(url);
        setPlanes(res.data);
      } catch {
        setError(`${ERROR_LOADING} overages`);
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
  }, [tab, parentPlanFilter, basePlansLength]);

  return { pagos, planes, overages, error, setError };
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
    <TableCell>{(plan.creditosTotales || 0) + (plan.freeCredits || 0)}</TableCell>
    <TableCell>
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
    <TableCell>{(plan as Plan & { prioridad?: number }).prioridad ?? '—'}</TableCell>
    <TableCell>{plan.discountPct ? `${plan.discountPct}%` : '—'}</TableCell>
    <TableCell>
      {plan.discountUntil ? new Date(plan.discountUntil).toLocaleDateString('es-AR') : '—'}
    </TableCell>
    <TableCell>
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
  error: string | null;
  success: string | null;
  onNewPlan: () => void;
  onEditPlan: (p: Plan) => void;
  onDeletePlan: (p: Plan) => void;
}> = ({ planes, overages, isSuperAdmin, error, success, onNewPlan, onEditPlan, onDeletePlan }) => (
  <Card
    title="Planes"
    headerActions={isSuperAdmin ? <NewItemButton label="Nuevo plan" onClick={onNewPlan} /> : null}
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
  isSuperAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ plan, isSuperAdmin, onEdit, onDelete }) => (
  <TableRow key={plan.id}>
    <TableCell className="font-medium">{plan.name}</TableCell>
    <TableCell>${plan.price?.toLocaleString('es-AR') || '—'}</TableCell>
    <TableCell>{plan.creditosTotales || '—'}</TableCell>
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

const OveragesTable: React.FC<{
  planes: Plan[];
  isSuperAdmin: boolean;
  onEditOverage: (p: Plan) => void;
  onDeleteOverage: (p: Plan) => void;
}> = ({ planes, isSuperAdmin, onEditOverage, onDeleteOverage }) => (
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
        planes.map((p) => (
          <OverageRow
            key={p.id}
            plan={p}
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
  basePlans: Plan[];
  parentPlanFilter: string;
  isSuperAdmin: boolean;
  onParentPlanChange: (value: string) => void;
  onNewOverage: () => void;
}> = ({ basePlans, parentPlanFilter, isSuperAdmin, onParentPlanChange, onNewOverage }) => (
  <div className="flex items-center gap-4">
    {basePlans.length > 0 && (
      <div className="min-w-[200px]">
        <label
          htmlFor="parent-plan-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Plan base
        </label>
        <select
          id="parent-plan-select"
          className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={parentPlanFilter}
          onChange={(e) => onParentPlanChange(e.target.value)}
        >
          {basePlans.map((bp) => (
            <option key={bp.id} value={bp.id}>
              {bp.name}
            </option>
          ))}
        </select>
      </div>
    )}
    {isSuperAdmin && <NewItemButton label="Nuevo paquete" onClick={onNewOverage} />}
  </div>
);

const OveragesTab: React.FC<{
  planes: Plan[];
  basePlans: Plan[];
  parentPlanFilter: string;
  isSuperAdmin: boolean;
  error: string | null;
  success: string | null;
  onParentPlanChange: (value: string) => void;
  onNewOverage: () => void;
  onEditOverage: (p: Plan) => void;
  onDeleteOverage: (p: Plan) => void;
}> = ({
  planes,
  basePlans,
  parentPlanFilter,
  isSuperAdmin,
  error,
  success,
  onParentPlanChange,
  onNewOverage,
  onEditOverage,
  onDeleteOverage,
}) => (
  <Card
    title="Paquetes Overages"
    headerActions={
      <OveragesHeader
        basePlans={basePlans}
        parentPlanFilter={parentPlanFilter}
        isSuperAdmin={isSuperAdmin}
        onParentPlanChange={onParentPlanChange}
        onNewOverage={onNewOverage}
      />
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
    <OveragesTable
      planes={planes}
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

const RevenueHistoryChart: React.FC<{ revenueHistory: RevenueData[] }> = ({ revenueHistory }) => (
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
);

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
    <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
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
  const [parentPlanFilter, setParentPlanFilter] = useState<string>('');

  useEffect(() => {
    const loadBasePlans = async () => {
      try {
        const res = await axios.get<Plan[]>(PLANES_API_ENDPOINT);
        setBasePlans(res.data);
        if (!parentPlanFilter && res.data.length) setParentPlanFilter(res.data[0]?.id ?? '');
      } catch {
        // Silently handle error
      }
    };
    if (tab === 'overages' && basePlans.length === 0) {
      void loadBasePlans();
    }
  }, [tab, basePlans.length, parentPlanFilter]);

  return { basePlans, parentPlanFilter, setParentPlanFilter };
};

const FacturacionPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const [tab, setTab] = useState<'pagos' | 'planes' | 'overages'>('pagos');
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const analytics = useAnalytics();
  const { basePlans, parentPlanFilter, setParentPlanFilter } = useBasePlans(tab);
  const { planes, overages, error, setError } = useTabData(tab, parentPlanFilter, basePlans.length);

  return (
    <div>
      <PageHeader title="Facturación" description="Gestiona planes, pagos y overages" />
      <FacturacionTabs tab={tab} onTabChange={setTab} />

      {tab === 'pagos' && (
        <PagosTab
          monthlyRevenue={analytics.monthlyRevenue}
          revenueHistory={analytics.revenueHistory}
          revenuePlan={analytics.revenuePlan}
          purchasesByPlan={analytics.purchasesByPlan}
          purchasesByOverage={analytics.purchasesByOverage}
        />
      )}

      {tab === 'planes' && (
        <PlanesTab
          planes={planes}
          overages={overages}
          isSuperAdmin={isSuperAdmin}
          error={error}
          success={success}
          onNewPlan={() => setEditing({} as Partial<Plan>)}
          onEditPlan={(p) => setEditing(p)}
          onDeletePlan={(p) => setConfirmDelete({ id: p.id, name: p.name })}
        />
      )}

      {tab === 'overages' && (
        <OveragesTab
          planes={planes}
          basePlans={basePlans}
          parentPlanFilter={parentPlanFilter}
          isSuperAdmin={isSuperAdmin}
          error={error}
          success={success}
          onParentPlanChange={setParentPlanFilter}
          onNewOverage={() =>
            setEditing({ isOverage: true, parentPlan: parentPlanFilter } as Partial<Plan>)
          }
          onEditOverage={(p) => setEditing(p)}
          onDeleteOverage={(p) => setConfirmDelete({ id: p.id, name: p.name })}
        />
      )}

      {editing && (
        <EditPlanModal
          plan={editing}
          basePlans={basePlans}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            void handleSavePlan(editing, updated, setError, setSuccess, setEditing);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar plan"
          message={`¿Seguro que deseas eliminar el plan "${confirmDelete.name}"?`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            void handleDeletePlan(confirmDelete.id, setError, setSuccess, setConfirmDelete);
          }}
        />
      )}
    </div>
  );
};

export default FacturacionPage;
