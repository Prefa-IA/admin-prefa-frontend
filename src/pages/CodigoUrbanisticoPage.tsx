import React, { useState, useEffect } from 'react';
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
      if (!file) return; // debería estar validado por modal
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

  // Polling de estado
  useEffect(() => {
    // al montar, retomar último job si está en progreso
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
    // Primer llamada inmediata
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Código Urbanístico</h1>
      <p className="text-sm text-gray-600 max-w-xl">
        Selecciona el rango de páginas del PDF que deseas analizar y el sistema extraerá las reglas urbanísticas para su
        posterior revisión.
      </p>
      <button className="btn-primary" onClick={() => setShowModal(true)} disabled={isProcessing || jobStatus==='processing' || jobStatus==='queued'}>
        {isProcessing ? 'Procesando…' : 'Iniciar extracción de reglas'}
      </button>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {jobStatus && (
        <div className="space-y-2 max-w-md">
          {jobStatus==='processing' || jobStatus==='queued' ? (
            <>
              <p className="text-sm text-gray-700">Procesando reglas mediante IA… ({chunkProgress.p}/{chunkProgress.t} bloques)</p>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-blue-600 h-2 rounded" style={{ width: `${chunkProgress.t? Math.floor(chunkProgress.p/chunkProgress.t*100):0}%` }}></div>
              </div>
            </>
          ) : (
            <p className="text-sm text-green-700">Proceso completado. Reglas nuevas: {chunkProgress.i}</p>
          )}
        </div>
      )}

      {showModal && <OcrExtractModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  );
};

export default CodigoUrbanisticoPage; 