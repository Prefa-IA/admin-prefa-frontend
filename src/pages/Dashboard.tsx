import React from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import Card from '../components/Card';
import MetricTile from '../components/dashboard/MetricTile';
import HeatMapCard from '../components/dashboard/HeatMapCard';
import RevenueBarChart from '../components/dashboard/RevenueBarChart';
import FunnelChart from '../components/dashboard/FunnelChart';

interface AnalyticsResponse {
  activeUsers: number;
  suspendedUsers: number;
  recurringCustomers: number;
  monthlyRevenue: number;
  topMonth: { usuarioId: string; nombre: string; email: string; count: number }[];
  topAllTime: { usuarioId: string; nombre: string; email: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [range, setRange] = React.useState<'day' | 'week' | 'month'>('month');
  const [series, setSeries] = React.useState<{ label: string; count: number }[]>([]);
  const [topDirecciones, setTopDirecciones] = React.useState<{ direccion: string; count: number }[]>([]);
  const [zonificaciones, setZonificaciones] = React.useState<{ zonificacion: string; count: number }[]>([]);
  const [heatPoints, setHeatPoints] = React.useState<any[]>([]);
  const [revenuePlan, setRevenuePlan] = React.useState<any[]>([]);
  const [funnel, setFunnel] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Gateway ya elimina "/api"; usamos base /admin para futuras rutas del MS
        const res = await axios.get<AnalyticsResponse>('/admin/analytics');
        setData(res.data);
      } catch (e) {
        console.error('Error al cargar analíticas', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    fetchSeries();

    const fetchTop = async () => {
      try {
        const topRes = await axios.get('/admin/analytics/top-direcciones');
        setTopDirecciones(topRes.data);
      } catch (e) {
        setTopDirecciones([]);
      }
      try {
        const zonRes = await axios.get('/admin/analytics/zonificaciones');
        setZonificaciones(zonRes.data);
      } catch (e) {
        setZonificaciones([]);
      }
    };
    fetchTop();
  }, [range]);

  React.useEffect(() => {
    const loadExtra = async () => {
      try {
        const [heatRes, revRes, funnelRes] = await Promise.all([
          axios.get('/admin/analytics/heatmap').catch(() => ({ data: [] })),
          axios.get('/admin/analytics/revenue-plan').catch(() => ({ data: [] })),
          axios.get('/admin/analytics/funnel').catch(() => ({ data: [] })),
        ]);
        setHeatPoints(heatRes.data);
        setRevenuePlan(revRes.data);
        setFunnel(funnelRes.data);
      } catch (e) {
        console.error('Error analíticas extra', e);
      }
    };
    loadExtra();
  }, []);

  if (loading || !data) return <p className="p-6">Cargando...</p>;

  const pieData = [
    { name: 'Activos', value: data.activeUsers },
    { name: 'Suspendidos', value: data.suspendedUsers },
  ];

  const COLORS = ['#34d399', '#f87171'];

  const RANGE_LABELS: Record<'day' | 'week' | 'month', string> = {
    day: 'día',
    week: 'semana',
    month: 'mes',
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Panel de administración</h1>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricTile title="Usuarios activos" value={data.activeUsers} />
        <MetricTile title="Usuarios suspendidos" value={data.suspendedUsers} variant="danger" />
        <MetricTile title="Clientes recurrentes" value={data.recurringCustomers} />
        <MetricTile title="Ingresos mes (ARS)" value={`$${data.monthlyRevenue}`} variant="success" />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch mt-8">
        {/* Gráfico de torta usuarios */}
        <Card className="lg:col-span-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Consultas por rango */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Consultas por {RANGE_LABELS[range]}</h3>
            <select
              value={range}
              onChange={e => setRange(e.target.value as any)}
              className="input-field max-w-xs"
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <Line type="monotone" dataKey="count" stroke="#1976d2" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="label" hide={range === 'day'} />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top tablas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Direcciones más consultadas</h3>
          <ul className="space-y-1 text-sm">
            {topDirecciones.map((d, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{d.direccion}</span>
                <span className="font-semibold">{d.count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Zonificaciones populares</h3>
          <ul className="space-y-1 text-sm">
            {zonificaciones.map((z, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{z.zonificacion || '—'}</span>
                <span className="font-semibold">{z.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Top 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Top 10 usuarios del mes</h3>
          <ul className="space-y-1 text-sm">
            {data.topMonth.map((u, idx) => (
              <li key={u.usuarioId} className="flex justify-between">
                <span>{idx + 1}. {u.nombre} ({u.email})</span>
                <span className="font-semibold">{u.count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Top 10 usuarios histórico</h3>
          <ul className="space-y-1 text-sm">
            {data.topAllTime.map((u, idx) => (
              <li key={u.usuarioId} className="flex justify-between">
                <span>{idx + 1}. {u.nombre} ({u.email})</span>
                <span className="font-semibold">{u.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Heatmap y revenue/funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <HeatMapCard points={heatPoints} />
        </div>
        <div className="space-y-6">
          <RevenueBarChart data={revenuePlan} />
          <FunnelChart data={funnel} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 