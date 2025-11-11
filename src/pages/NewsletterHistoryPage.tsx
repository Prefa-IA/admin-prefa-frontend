import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Button, Pagination } from '../components/ui';

const NewsletterHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 30;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/emails/history', {
        params: { page, limit: PAGE_SIZE }
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
    loadHistory();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando historial...</p>
        </div>
      </div>
    );
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
          <Button variant="ghost" size="sm" onClick={loadHistory}>
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
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay historial disponible
                </TableCell>
              </TableRow>
            ) : (
              history.map((j: any) => (
                <TableRow key={j._id}>
                  <TableCell>{new Date(j.createdAt).toLocaleString('es-AR')}</TableCell>
                  <TableCell>{j.template}</TableCell>
                  <TableCell>{j.recipients?.mode}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      j.state === 'sent' || j.state === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : j.state === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {j.state}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {total > 0 && (
          <div className="mt-6">
            <Pagination
              total={total}
              current={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewsletterHistoryPage;

