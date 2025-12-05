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
    <TableCell>
      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
        {item.planActual}
      </span>
    </TableCell>
    <TableCell className="font-semibold">
      {(item.creditosConsumidosTotal || 0).toLocaleString('es-AR')}
    </TableCell>
    <TableCell>{(item.creditosConsumidosMes || 0).toLocaleString('es-AR')}</TableCell>
    <TableCell>{(item.creditosConsumidosDia || 0).toLocaleString('es-AR')}</TableCell>
    <TableCell>{(item.creditosDisponibles || 0).toLocaleString('es-AR')}</TableCell>
    <TableCell>{item.renovacionesEstimadas}</TableCell>
    <TableCell>{item.cambiosPlanEstimados}</TableCell>
    <TableCell>{item.diasActivo} días</TableCell>
    <TableCell>{formatDate(item.fechaRegistro)}</TableCell>
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
              <TableHead>Plan Actual</TableHead>
              <TableHead>Créditos Consumidos</TableHead>
              <TableHead>Créditos Mes</TableHead>
              <TableHead>Créditos Día</TableHead>
              <TableHead>Créditos Disponibles</TableHead>
              <TableHead>Renovaciones</TableHead>
              <TableHead>Cambios Plan</TableHead>
              <TableHead>Días Activo</TableHead>
              <TableHead>Fecha Registro</TableHead>
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
        const res = await axios.get<StrategicData[]>('/admin/usuarios/datos-estrategicos');
        setData(res.data);
        setFilteredData(res.data);
      } catch (error) {
        console.error('Error cargando datos estratégicos:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.planActual.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setPage(1);
  }, [searchQuery, data]);

  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const totalCreditosConsumidos = data.reduce((sum, item) => sum + item.creditosConsumidosTotal, 0);
  const totalRenovaciones = data.reduce((sum, item) => sum + item.renovacionesEstimadas, 0);
  const totalCambiosPlan = data.reduce((sum, item) => sum + item.cambiosPlanEstimados, 0);
  const usuariosConPlan = data.filter((item) => item.planActual !== 'Sin plan').length;

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
