import React from 'react';
import axios from 'axios';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import HeatMapCard from '../components/dashboard/HeatMapCard';
import MetricTile from '../components/dashboard/MetricTile';
import { Card, PageHeader } from '../components/ui';
import { AnalyticsResponse } from '../types/dashboard';

const useDashboardData = () => {
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get<AnalyticsResponse>('/admin/analytics');
        setData(res.data);
      } catch (e) {
        console.error('Error al cargar analíticas', e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return { data, loading };
};

const useDashboardSeries = (range: 'day' | 'week' | 'month') => {
  const [series, setSeries] = React.useState<
    { label: string; busquedas: number; reportes: number; prefa1: number; prefa2: number }[]
  >([]);
  const [topDirecciones, setTopDirecciones] = React.useState<
    { direccion: string; count: number }[]
  >([]);
  const [barrios, setBarrios] = React.useState<{ barrio: string; count: number }[]>([]);

  React.useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await axios.get(`/admin/analytics/consultas?range=${range}`);
        setSeries(res.data);
      } catch (e) {
        console.warn('Analytics consultas no disponible', e);
        setSeries([]);
      }
    };
    void fetchSeries();

    const fetchTop = async () => {
      try {
        const topRes = await axios.get('/admin/analytics/top-direcciones');
        setTopDirecciones(topRes.data);
      } catch (e) {
        setTopDirecciones([]);
      }
      try {
        const barriosRes = await axios.get<Array<{ barrio: string; count: number }>>(
          '/admin/analytics/barrios'
        );
        setBarrios(Array.isArray(barriosRes.data) ? barriosRes.data : []);
      } catch (e) {
        console.warn('Error cargando barrios:', e);
        setBarrios([]);
      }
    };
    void fetchTop();
  }, [range]);

  return { series, topDirecciones, barrios };
};

const useHeatMapData = () => {
  const [heatPoints, setHeatPoints] = React.useState<
    Array<{ lat: number; lon: number; count: number }>
  >([]);

  React.useEffect(() => {
    const loadExtra = async () => {
      try {
        const heatRes = await axios
          .get<Array<{ lat: number; lon: number; count: number }>>('/admin/analytics/heatmap')
          .catch(() => ({ data: [] }));
        setHeatPoints(heatRes.data);
      } catch (e) {
        console.error('Error analíticas extra', e);
      }
    };
    void loadExtra();
  }, []);

  return heatPoints;
};

const ConsultasChart: React.FC<{
  series: { label: string; busquedas: number; reportes: number; prefa1: number; prefa2: number }[];
  range: 'day' | 'week' | 'month';
  onRangeChange: (r: 'day' | 'week' | 'month') => void;
}> = ({ series, range, onRangeChange }) => {
  const RANGE_LABELS: Record<'day' | 'week' | 'month', string> = {
    day: 'día',
    week: 'semana',
    month: 'mes',
  };
  const rangeLabel = Reflect.get(RANGE_LABELS, range) || RANGE_LABELS.month;

  return (
    <Card
      title={`Consultas por ${rangeLabel}`}
      headerActions={
        <div className="min-w-[150px]">
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value as 'day' | 'week' | 'month')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
      }
    >
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
            <XAxis dataKey="label" hide={range === 'day'} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="busquedas"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Búsquedas básicas"
            />
            <Line
              type="monotone"
              dataKey="reportes"
              stroke="#0284c7"
              strokeWidth={2}
              name="Reportes generados"
            />
            <Line type="monotone" dataKey="prefa1" stroke="#10b981" strokeWidth={2} name="PreFa1" />
            <Line type="monotone" dataKey="prefa2" stroke="#8b5cf6" strokeWidth={2} name="PreFa2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const TopDireccionesCard: React.FC<{ direcciones: { direccion: string; count: number }[] }> = ({
  direcciones,
}) => (
  <Card title="Direcciones más consultadas">
    <ul className="space-y-2 text-sm">
      {direcciones.length === 0 ? (
        <li className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay datos disponibles
        </li>
      ) : (
        direcciones.map((d, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300">{d.direccion}</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{d.count}</span>
          </li>
        ))
      )}
    </ul>
  </Card>
);

const BarriosCard: React.FC<{ barrios: { barrio: string; count: number }[] }> = ({ barrios }) => (
  <Card title="Barrios populares">
    <ul className="space-y-2 text-sm">
      {barrios.length === 0 ? (
        <li className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay datos disponibles
        </li>
      ) : (
        barrios.map((b, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300 capitalize">{b.barrio || '—'}</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{b.count}</span>
          </li>
        ))
      )}
    </ul>
  </Card>
);

const TopUsersCard: React.FC<{
  users: Array<{ usuarioId: string; nombre: string; email: string; count: number }>;
}> = ({ users }) => (
  <Card title="Top 10 usuarios del mes (por créditos consumidos)">
    <ul className="space-y-2 text-sm">
      {users.length === 0 ? (
        <li className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay datos disponibles
        </li>
      ) : (
        users.map((u, idx) => (
          <li
            key={u.usuarioId}
            className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-medium text-primary-600 dark:text-primary-400">{idx + 1}.</span>{' '}
              {u.nombre} <span className="text-gray-500 dark:text-gray-400">({u.email})</span>
            </span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {u.count.toLocaleString('es-AR')} créditos
            </span>
          </li>
        ))
      )}
    </ul>
  </Card>
);

const Dashboard: React.FC = () => {
  const [range, setRange] = React.useState<'day' | 'week' | 'month'>('month');
  const { data, loading } = useDashboardData();
  const { series, topDirecciones, barrios } = useDashboardSeries(range);
  const heatPoints = useHeatMapData();

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de administración"
        description="Vista general del sistema y métricas"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricTile title="Usuarios activos" value={data.activeUsers} />
        <MetricTile title="Usuarios suspendidos" value={data.suspendedUsers} variant="danger" />
      </div>

      <div className="mt-8">
        <ConsultasChart series={series} range={range} onRangeChange={setRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopDireccionesCard direcciones={topDirecciones} />
        <BarriosCard barrios={barrios} />
      </div>

      <TopUsersCard users={data.topMonth} />

      <div className="mt-8">
        <HeatMapCard points={heatPoints} />
      </div>
    </div>
  );
};

export default Dashboard;
