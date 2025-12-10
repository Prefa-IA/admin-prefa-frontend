import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Card,
  Input,
  PageHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';

interface StrategicData {
  usuarioId: string;
  nombre: string;
  email: string;
  planActual: string;
  creditosConsumidosTotal: number;
  creditosConsumidosMes: number;
  creditosConsumidosDia?: number;
  creditosDisponibles: number;
  renovacionesEstimadas: number;
  cambiosPlanEstimados: number;
  fechaRegistro: string | null;
  fechaUltimaActualizacion: string | null;
  fechaInicioPlan: string | null;
  fechaFinPlan: string | null;
  diasActivo: number;
}

const PAGE_SIZE = 20;

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR');
};

interface StatisticsCardsProps {
  totalCreditosConsumidos: number;
  totalRenovaciones: number;
  totalCambiosPlan: number;
  usuariosConPlan: number;
  totalUsuarios: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalCreditosConsumidos,
  totalRenovaciones,
  totalCambiosPlan,
  usuariosConPlan,
  totalUsuarios,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Créditos Consumidos</div>
        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {totalCreditosConsumidos.toLocaleString('es-AR')}
        </div>
      </div>
    </Card>
    <Card>
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Renovaciones Estimadas</div>
        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {totalRenovaciones}
        </div>
      </div>
    </Card>
    <Card>
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Cambios de Plan</div>
        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {totalCambiosPlan}
        </div>
      </div>
    </Card>
    <Card>
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Usuarios con Plan</div>
        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {usuariosConPlan} / {totalUsuarios}
        </div>
      </div>
    </Card>
  </div>
);

interface StrategicDataRowProps {
  item: StrategicData;
}

const StrategicDataRow: React.FC<StrategicDataRowProps> = ({ item }) => (
  <TableRow>
    <TableCell>
      <div>
        <div className="font-medium">{item.nombre}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{item.email}</div>
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
        {item.planActual}
      </span>
    </TableCell>
    <TableCell className="font-semibold">
      {(item.creditosConsumidosTotal || 0).toLocaleString('es-AR')}
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      {(item.creditosConsumidosMes || 0).toLocaleString('es-AR')}
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      {(item.creditosConsumidosDia || 0).toLocaleString('es-AR')}
    </TableCell>
    <TableCell className="hidden md:table-cell">
      {(item.creditosDisponibles || 0).toLocaleString('es-AR')}
    </TableCell>
    <TableCell className="hidden lg:table-cell">{item.renovacionesEstimadas}</TableCell>
    <TableCell className="hidden lg:table-cell">{item.cambiosPlanEstimados}</TableCell>
    <TableCell className="hidden md:table-cell">{item.diasActivo} días</TableCell>
    <TableCell className="hidden lg:table-cell">{formatDate(item.fechaRegistro)}</TableCell>
  </TableRow>
);

const LoadingState: React.FC = () => (
  <Card>
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  </Card>
);

const EmptyState: React.FC = () => (
  <Card>
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron datos</div>
  </Card>
);

interface StrategicDataTableProps {
  data: StrategicData[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const StrategicDataTable: React.FC<StrategicDataTableProps> = ({
  data,
  loading,
  page,
  totalPages,
  onPageChange,
}) => {
  if (loading) return <LoadingState />;
  if (data.length === 0) return <EmptyState />;

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="hidden md:table-cell">Plan Actual</TableHead>
              <TableHead>Créditos Consumidos</TableHead>
              <TableHead className="hidden lg:table-cell">Créditos Mes</TableHead>
              <TableHead className="hidden lg:table-cell">Créditos Día</TableHead>
              <TableHead className="hidden md:table-cell">Créditos Disponibles</TableHead>
              <TableHead className="hidden lg:table-cell">Renovaciones</TableHead>
              <TableHead className="hidden lg:table-cell">Cambios Plan</TableHead>
              <TableHead className="hidden md:table-cell">Días Activo</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <StrategicDataRow key={item.usuarioId} item={item} />
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            total={data.length}
            current={page}
            pageSize={PAGE_SIZE}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
};

const StrategicDataPage: React.FC = () => {
  const [data, setData] = useState<StrategicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<StrategicData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ datos: StrategicData[]; pagination?: unknown }>(
          '/admin/usuarios/datos-estrategicos'
        );
        const dataSafe = Array.isArray(res.data?.datos) ? res.data.datos : Array.isArray(res.data) ? res.data : [];
        setData(dataSafe);
        setFilteredData(dataSafe);
      } catch (error) {
        console.error('Error cargando datos estratégicos:', error);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    const dataSafe = Array.isArray(data) ? data : [];
    const filtered = dataSafe.filter(
      (item) =>
        item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.planActual?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setPage(1);
  }, [searchQuery, data]);

  const dataSafe = Array.isArray(data) ? data : [];
  const filteredDataSafe = Array.isArray(filteredData) ? filteredData : [];
  const paginatedData = filteredDataSafe.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredDataSafe.length / PAGE_SIZE);

  const totalCreditosConsumidos = dataSafe.reduce((sum, item) => sum + (item.creditosConsumidosTotal || 0), 0);
  const totalRenovaciones = dataSafe.reduce((sum, item) => sum + (item.renovacionesEstimadas || 0), 0);
  const totalCambiosPlan = dataSafe.reduce((sum, item) => sum + (item.cambiosPlanEstimados || 0), 0);
  const usuariosConPlan = dataSafe.filter((item) => item.planActual !== 'Sin plan').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Datos Estratégicos de Usuarios"
        description="Métricas relevantes para marketing y ventas"
      />

      <StatisticsCards
        totalCreditosConsumidos={totalCreditosConsumidos}
        totalRenovaciones={totalRenovaciones}
        totalCambiosPlan={totalCambiosPlan}
        usuariosConPlan={usuariosConPlan}
        totalUsuarios={data.length}
      />

      <Card>
        <div className="p-4">
          <Input
            label="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email o plan..."
          />
        </div>
      </Card>

      <StrategicDataTable
        data={paginatedData}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default StrategicDataPage;
