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
  scheduledAt?: string;
  sentAt?: string;
  template: string;
  recipients?: { mode?: string; plan?: string[]; emails?: string[] };
  total?: number;
  sentCount?: number;
  status?: string;
  state?: string;
  error?: string;
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

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('es-AR') : '—';

const formatRecipients = (recipients?: NewsletterJob['recipients']): string => {
  if (!recipients?.mode) return '—';
  if (recipients.mode === 'all') return 'Todos';
  if (recipients.mode === 'plan') {
    return recipients.plan && recipients.plan.length > 0
      ? `Plan: ${recipients.plan.join(', ')}`
      : 'Plan';
  }
  if (recipients.mode === 'emails') {
    return recipients.emails && recipients.emails.length > 0
      ? `${recipients.emails.length} emails`
      : 'Emails';
  }
  return recipients.mode;
};

const HistoryTable: React.FC<{ history: NewsletterJob[] }> = ({ history }) => {
  if (history.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay historial disponible
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {history.map((j) => (
        <TableRow key={j._id}>
          <TableCell>{formatDateTime(j.createdAt)}</TableCell>
          <TableCell>{formatDateTime(j.scheduledAt)}</TableCell>
          <TableCell>{formatDateTime(j.sentAt)}</TableCell>
          <TableCell>{j.template}</TableCell>
          <TableCell>{formatRecipients(j.recipients)}</TableCell>
          <TableCell>{`${j.sentCount ?? 0}/${j.total ?? 0}`}</TableCell>
          <TableCell>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                j['state']
              )}`}
            >
              {j['state'] != null ? String(j['state']) : '—'}
            </span>
            {j['state'] === 'failed' && j.error ? (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{j.error}</div>
            ) : null}
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
              <TableHead>Creado</TableHead>
              <TableHead>Programado</TableHead>
              <TableHead>Enviado</TableHead>
              <TableHead>Plantilla</TableHead>
              <TableHead>Destinatarios</TableHead>
              <TableHead>Envíos</TableHead>
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
