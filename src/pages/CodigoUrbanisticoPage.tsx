import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button } from '../components/ui';
import OcrExtractModal from '../components/modals/OcrExtractModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CodigoUrbanisticoPage: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const handleSubmit = async ({ startPage, endPage, version, file }: { startPage: number; endPage: number; version?: string; file?: File }) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      if (!file) return;
      const fd = new FormData();
      fd.append('startPage', String(startPage));
      fd.append('endPage', String(endPage));
      if (version) fd.append('version', version);
      fd.append('pdf', file);
      const { data } = await axios.post('/api/admin/codigo-urbanistico/extract/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobId(data.jobId);
      setJobStatus('queued');
      localStorage.setItem('lastJobId', data.jobId);
      setMessage(`Proceso iniciado. ID de tarea: ${data.jobId}`);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Ocurrió un error');
    } finally {
      setIsProcessing(false);
      setShowModal(false);
    }
  };

  useEffect(() => {
    const last = localStorage.getItem('lastJobId');
    if (last && !jobId) {
      (async () => {
        try {
          const axios = (await import('axios')).default;
          const { data } = await axios.get(`/api/admin/codigo-urbanistico/job/${last}`);
          if (data.status === 'processing' || data.status === 'queued') {
            setJobId(last);
            setJobStatus(data.status);
          } else {
            localStorage.removeItem('lastJobId');
          }
        } catch {
          localStorage.removeItem('lastJobId');
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;
    let interval: any;
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`/api/admin/codigo-urbanistico/job/${jobId}`);
        setJobStatus(data.status);
        setChunkProgress({p:data.processedChunks||0,t:data.totalChunks||0,i:data.insertedRules||0});
        if (data.status === 'completed') {
          localStorage.removeItem('lastJobId');
          setMessage(`Proceso finalizado. Reglas nuevas: ${data.insertedRules}`);
        }
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (jobStatus === 'completed') {
      (async () => {
        try {
          const { data } = await axios.get('/api/reglas', { params: { job: jobId } });
          const count = Array.isArray(data) ? data.length : 0;
          setMessage(`Proceso finalizado. Se generaron ${count} reglas.`);
          setTimeout(() => navigate('/reglas'), 1500);
        } catch {
          navigate('/reglas');
        }
      })();
    }
  }, [jobStatus, navigate]);

  const [chunkProgress, setChunkProgress] = useState<{p:number;t:number;i:number}>({p:0,t:0,i:0});

  return (
    <div>
      <PageHeader
        title="Código Urbanístico"
        description="Selecciona el rango de páginas del PDF que deseas analizar y el sistema extraerá las reglas urbanísticas para su posterior revisión."
      />

      <Card>
        <div className="space-y-6">
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            disabled={isProcessing || jobStatus === 'processing' || jobStatus === 'queued'}
            isLoading={isProcessing}
          >
        {isProcessing ? 'Procesando…' : 'Iniciar extracción de reglas'}
          </Button>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('error') || message.includes('Error')
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}>
              <p className={`text-sm ${
                message.includes('error') || message.includes('Error')
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>{message}</p>
            </div>
          )}

      {jobStatus && (
        <div className="space-y-2 max-w-md">
              {jobStatus === 'processing' || jobStatus === 'queued' ? (
            <>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Procesando reglas mediante IA… ({chunkProgress.p}/{chunkProgress.t} bloques)
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${chunkProgress.t ? Math.floor((chunkProgress.p / chunkProgress.t) * 100) : 0}%` }}
                    ></div>
              </div>
            </>
          ) : (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Proceso completado. Reglas nuevas: {chunkProgress.i}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {showModal && <OcrExtractModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  );
};

export default CodigoUrbanisticoPage; 