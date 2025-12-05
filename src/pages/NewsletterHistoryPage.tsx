import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Button,
  Card,
  PageHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';

interface NewsletterJob {
  _id: string;
  createdAt: string;
  template: string;
  recipients?: { mode?: string };
  status?: string;
  state?: string;
  [key: string]: unknown;
}

const PAGE_SIZE = 30;

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando historial...</p>
    </div>
  </div>
);

const getStatusBadgeClass = (state: string | undefined): string => {
  if (state === 'sent' || state === 'completed') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  if (state === 'failed') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
};

const HistoryTable: React.FC<{ history: NewsletterJob[] }> = ({ history }) => {
  if (history.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay historial disponible
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {history.map((j) => (
        <TableRow key={j._id}>
          <TableCell>{new Date(j.createdAt).toLocaleString('es-AR')}</TableCell>
          <TableCell>{j.template}</TableCell>
          <TableCell>{j.recipients?.mode}</TableCell>
          <TableCell>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                j['state']
              )}`}
            >
              {j['state'] != null ? String(j['state']) : '—'}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const NewsletterHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<NewsletterJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/emails/history', {
        params: { page, limit: PAGE_SIZE },
      });
      setHistory(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Error cargando historial:', e);
      setHistory([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && history.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Historial de Newsletters"
        description="Consulta el historial de newsletters y avisos enviados"
      />

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Historial de envíos</h3>
          <Button variant="ghost" size="sm" onClick={() => void loadHistory()}>
            Refrescar
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Plantilla</TableHead>
              <TableHead>Modo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <HistoryTable history={history} />
          </TableBody>
        </Table>
        {total > 0 && (
          <div className="mt-6">
            <Pagination total={total} current={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewsletterHistoryPage;
