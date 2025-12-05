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

const useDashboardSeries = (range: 'day' | 'week' | 'month' | 'year' | 'historic') => {
  const [series, setSeries] = React.useState<
    {
      label: string;
      busquedasDirecciones: number;
      prefaSimple: number;
      prefaCompleta: number;
      prefaCompuesta: number;
    }[]
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

const calculateYAxisTicks = (
  yAxisDomain: [number, number],
  yAxisInterval: 10 | 100 | 1000 | 10000
): number[] => {
  const maxTickValue = yAxisDomain[1];
  const maxTick =
    typeof maxTickValue === 'number' && !Number.isNaN(maxTickValue)
      ? maxTickValue
      : yAxisInterval * 4;
  const numTicks = Math.max(4, Math.ceil(maxTick / yAxisInterval));
  const ticks = Array.from({ length: numTicks }, (_, i) => {
    const tick = (i + 1) * yAxisInterval;
    return tick <= maxTick ? tick : null;
  }).filter((tick): tick is number => tick !== null);
  return ticks.length === 0 ? [yAxisInterval] : ticks;
};

const ChartControls: React.FC<{
  yAxisInterval: 10 | 100 | 1000 | 10000;
  onYAxisIntervalChange: (value: 10 | 100 | 1000 | 10000) => void;
  range: 'day' | 'week' | 'month' | 'year' | 'historic';
  onRangeChange: (r: 'day' | 'week' | 'month' | 'year' | 'historic') => void;
}> = ({ yAxisInterval, onYAxisIntervalChange, range, onRangeChange }) => (
  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <select
      value={yAxisInterval}
      onChange={(e) => onYAxisIntervalChange(Number(e.target.value) as 10 | 100 | 1000 | 10000)}
      className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full sm:w-auto"
      title="Intervalo del eje Y"
    >
      <option value="10">De a 10</option>
      <option value="100">De a 100</option>
      <option value="1000">De a 1000</option>
      <option value="10000">De a 10000</option>
    </select>
    <select
      value={range}
      onChange={(e) =>
        onRangeChange(e.target.value as 'day' | 'week' | 'month' | 'year' | 'historic')
      }
      className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full sm:w-auto"
    >
      <option value="day">Día</option>
      <option value="week">Semana</option>
      <option value="month">Mes</option>
      <option value="year">Año</option>
      <option value="historic">Histórico</option>
    </select>
  </div>
);

const ConsultasLineChart: React.FC<{
  series: {
    label: string;
    busquedasDirecciones: number;
    prefaSimple: number;
    prefaCompleta: number;
    prefaCompuesta: number;
  }[];
  range: 'day' | 'week' | 'month' | 'year' | 'historic';
  yAxisDomain: [number, number];
  yAxisTicks: number[];
}> = ({ series, range, yAxisDomain, yAxisTicks }) => (
  <ResponsiveContainer width="100%" height={250} minHeight={250}>
    <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
      <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
      <XAxis
        dataKey="label"
        hide={range === 'day' || range === 'historic'}
        stroke="#6b7280"
        angle={-45}
        textAnchor="end"
        height={60}
        tick={{ fontSize: 12 }}
      />
      <YAxis
        stroke="#6b7280"
        domain={yAxisDomain}
        ticks={yAxisTicks}
        interval={0}
        allowDecimals={false}
        tickFormatter={(value) => value.toLocaleString('es-AR')}
        width={50}
        tick={{ fontSize: 11 }}
      />
      <Tooltip />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
      <Line
        type="monotone"
        dataKey="busquedasDirecciones"
        stroke="#f59e0b"
        strokeWidth={2}
        name="Búsqueda de direcciones"
      />
      <Line
        type="monotone"
        dataKey="prefaSimple"
        stroke="#10b981"
        strokeWidth={2}
        name="Prefactibilidades simples"
      />
      <Line
        type="monotone"
        dataKey="prefaCompleta"
        stroke="#0284c7"
        strokeWidth={2}
        name="Prefactibilidades completas"
      />
      <Line
        type="monotone"
        dataKey="prefaCompuesta"
        stroke="#8b5cf6"
        strokeWidth={2}
        name="Prefactibilidades compuestas"
      />
    </LineChart>
  </ResponsiveContainer>
);

const ConsultasChart: React.FC<{
  series: {
    label: string;
    busquedasDirecciones: number;
    prefaSimple: number;
    prefaCompleta: number;
    prefaCompuesta: number;
  }[];
  range: 'day' | 'week' | 'month' | 'year' | 'historic';
  onRangeChange: (r: 'day' | 'week' | 'month' | 'year' | 'historic') => void;
}> = ({ series, range, onRangeChange }) => {
  const [yAxisInterval, setYAxisInterval] = React.useState<10 | 100 | 1000 | 10000>(10);

  const RANGE_LABELS: Record<'day' | 'week' | 'month' | 'year' | 'historic', string> = {
    day: 'día',
    week: 'semana',
    month: 'mes',
    year: 'año',
    historic: 'histórico',
  };
  const rangeLabel = Reflect.get(RANGE_LABELS, range) || RANGE_LABELS.month;

  const maxValue = React.useMemo(() => {
    if (series.length === 0) return 0;
    return Math.max(
      ...series.flatMap((s) => [
        s.busquedasDirecciones,
        s.prefaSimple,
        s.prefaCompleta,
        s.prefaCompuesta,
      ])
    );
  }, [series]);

  const yAxisDomain = React.useMemo((): [number, number] => {
    if (maxValue === 0) {
      return [0, yAxisInterval * 4];
    }
    const maxDomain = Math.ceil(maxValue / yAxisInterval) * yAxisInterval;
    const minDomain = yAxisInterval * 4;
    return [0, Math.max(maxDomain, minDomain)];
  }, [maxValue, yAxisInterval]);

  const yAxisTicks = React.useMemo(
    () => calculateYAxisTicks(yAxisDomain, yAxisInterval),
    [yAxisDomain, yAxisInterval]
  );

  return (
    <Card
      title={`Consultas por ${rangeLabel}`}
      headerActions={
        <ChartControls
          yAxisInterval={yAxisInterval}
          onYAxisIntervalChange={setYAxisInterval}
          range={range}
          onRangeChange={onRangeChange}
        />
      }
    >
      <div className="mt-4">
        <ConsultasLineChart
          series={series}
          range={range}
          yAxisDomain={yAxisDomain}
          yAxisTicks={yAxisTicks}
        />
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
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 sm:py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300 break-words">{d.direccion}</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400 text-xs sm:text-sm">
              {d.count}
            </span>
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
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 sm:py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300 capitalize break-words">
              {b.barrio || '—'}
            </span>
            <span className="font-semibold text-primary-600 dark:text-primary-400 text-xs sm:text-sm">
              {b.count}
            </span>
          </li>
        ))
      )}
    </ul>
  </Card>
);

const TopUsersCard: React.FC<{
  users: Array<{ usuarioId: string; nombre: string; email: string; count: number }>;
}> = ({ users }) => (
  <Card title="Top 15 usuarios del mes (por créditos consumidos)">
    <ul className="space-y-2 text-sm">
      {users.length === 0 ? (
        <li className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay datos disponibles
        </li>
      ) : (
        users.map((u, idx) => (
          <li
            key={u.usuarioId}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 sm:py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300 break-words">
              <span className="font-medium text-primary-600 dark:text-primary-400">{idx + 1}.</span>{' '}
              {u.nombre}{' '}
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                ({u.email})
              </span>
            </span>
            <span className="font-semibold text-primary-600 dark:text-primary-400 text-xs sm:text-sm">
              {u.count.toLocaleString('es-AR')} créditos
            </span>
          </li>
        ))
      )}
    </ul>
  </Card>
);

const Dashboard: React.FC = () => {
  const [range, setRange] = React.useState<'day' | 'week' | 'month' | 'year' | 'historic'>('month');
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <PageHeader
        title="Panel de administración"
        description="Vista general del sistema y métricas"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <MetricTile title="Usuarios activos" value={data.activeUsers} />
        <MetricTile title="Usuarios suspendidos" value={data.suspendedUsers} variant="danger" />
      </div>

      <div className="mt-4 sm:mt-6 lg:mt-8">
        <ConsultasChart series={series} range={range} onRangeChange={setRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <TopDireccionesCard direcciones={topDirecciones} />
        <BarriosCard barrios={barrios} />
      </div>

      <TopUsersCard users={data.topMonth} />

      <div className="mt-4 sm:mt-6 lg:mt-8">
        <HeatMapCard points={heatPoints} />
      </div>
    </div>
  );
};

export default Dashboard;
