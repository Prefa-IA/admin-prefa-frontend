import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import OcrExtractModal from '../components/modals/OcrExtractModal';
import { Button, Card, PageHeader } from '../components/ui';

const createFormData = (
  startPage: number,
  endPage: number,
  version: string | undefined,
  file: File
): FormData => {
  const fd = new FormData();
  fd.append('startPage', String(startPage));
  fd.append('endPage', String(endPage));
  if (version) fd.append('version', version);
  fd.append('pdf', file);
  return fd;
};

const getMessageClass = (message: string): string => {
  const isError = message.includes('error') || message.includes('Error');
  return isError
    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
};

const getMessageTextClass = (message: string): string => {
  const isError = message.includes('error') || message.includes('Error');
  return isError ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';
};

const MessageDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className={`p-3 rounded-lg ${getMessageClass(message)}`}>
    <p className={`text-sm ${getMessageTextClass(message)}`}>{message}</p>
  </div>
);

const ProgressBar: React.FC<{ processed: number; total: number }> = ({ processed, total }) => (
  <div className="space-y-2 max-w-md">
    <p className="text-sm text-gray-700 dark:text-gray-300">
      Procesando reglas mediante IA… ({processed}/{total} bloques)
    </p>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div
        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
        style={{
          width: `${total ? Math.floor((processed / total) * 100) : 0}%`,
        }}
      ></div>
    </div>
  </div>
);

const CompletedMessage: React.FC<{ inserted: number }> = ({ inserted }) => (
  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
    <p className="text-sm text-green-700 dark:text-green-400">
      Proceso completado. Reglas nuevas: {inserted}
    </p>
  </div>
);

const uploadExtract = async (
  startPage: number,
  endPage: number,
  version: string | undefined,
  file: File
): Promise<{ jobId: string }> => {
  const fd = createFormData(startPage, endPage, version, file);
  const { data } = await axios.post('/api/admin/codigo-urbanistico/extract/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const fetchJobStatus = async (
  jobId: string
): Promise<{
  status: string;
  processedChunks?: number;
  totalChunks?: number;
  insertedRules?: number;
}> => {
  const { data } = await axios.get(`/api/admin/codigo-urbanistico/job/${jobId}`);
  return data;
};

const updateProgress = (
  data: { status: string; processedChunks?: number; totalChunks?: number; insertedRules?: number },
  setJobStatus: (status: string | null) => void,
  setChunkProgress: React.Dispatch<React.SetStateAction<{ p: number; t: number; i: number }>>,
  setMessage: (msg: string | null) => void
): boolean => {
  setJobStatus(data.status);
  setChunkProgress({
    p: data.processedChunks || 0,
    t: data.totalChunks || 0,
    i: data.insertedRules || 0,
  });
  if (data.status === 'completed') {
    localStorage.removeItem('lastJobId');
    setMessage(`Proceso finalizado. Reglas nuevas: ${data.insertedRules || 0}`);
    return true;
  }
  return data.status === 'failed';
};

const useJobStatus = (
  jobId: string | null,
  setJobStatus: (status: string | null) => void,
  setChunkProgress: React.Dispatch<React.SetStateAction<{ p: number; t: number; i: number }>>,
  setMessage: (msg: string | null) => void
) => {
  useEffect(() => {
    if (!jobId) return;
    const intervalState = { interval: null as NodeJS.Timeout | null };
    const fetchStatus = async () => {
      try {
        const data = await fetchJobStatus(jobId);
        const shouldStop = updateProgress(data, setJobStatus, setChunkProgress, setMessage);
        if (shouldStop && intervalState.interval) {
          clearInterval(intervalState.interval);
          intervalState.interval = null;
        }
      } catch (err) {
        console.error(err);
      }
    };
    void fetchStatus();
    intervalState.interval = setInterval(() => {
      void fetchStatus();
    }, 5000);
    return () => {
      if (intervalState.interval) {
        clearInterval(intervalState.interval);
      }
    };
  }, [jobId, setJobStatus, setChunkProgress, setMessage]);
};

const useCompletedJob = (
  jobStatus: string | null,
  jobId: string | null,
  navigate: (path: string) => void,
  setMessage: (msg: string | null) => void
) => {
  useEffect(() => {
    if (jobStatus === 'completed') {
      const loadRules = async () => {
        try {
          const { data } = await axios.get('/api/reglas', { params: { job: jobId } });
          const count = Array.isArray(data) ? data.length : 0;
          setMessage(`Proceso finalizado. Se generaron ${count} reglas.`);
          setTimeout(() => navigate('/reglas'), 1500);
        } catch {
          navigate('/reglas');
        }
      };
      void loadRules();
    }
  }, [jobStatus, navigate, jobId, setMessage]);
};

const useInitialJob = (
  jobId: string | null,
  setJobId: (id: string) => void,
  setJobStatus: (status: string) => void
) => {
  useEffect(() => {
    const last = localStorage.getItem('lastJobId');
    if (last && !jobId) {
      const loadJob = async () => {
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
      };
      void loadJob();
    }
  }, [jobId, setJobId, setJobStatus]);
};

const useCodigoUrbanisticoState = () => {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [chunkProgress, setChunkProgress] = useState<{ p: number; t: number; i: number }>({
    p: 0,
    t: 0,
    i: 0,
  });

  return {
    showModal,
    setShowModal,
    isProcessing,
    setIsProcessing,
    message,
    setMessage,
    jobId,
    setJobId,
    jobStatus,
    setJobStatus,
    chunkProgress,
    setChunkProgress,
  };
};

const CodigoUrbanisticoContent: React.FC<{
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  isProcessing: boolean;
  message: string | null;
  jobStatus: string | null;
  chunkProgress: { p: number; t: number; i: number };
  onSubmit: (data: {
    startPage: number;
    endPage: number;
    version?: string;
    file?: File;
  }) => Promise<void>;
}> = ({ showModal, setShowModal, isProcessing, message, jobStatus, chunkProgress, onSubmit }) => (
  <>
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

        {message && <MessageDisplay message={message} />}

        {jobStatus && (
          <div className="space-y-2 max-w-md">
            {jobStatus === 'processing' || jobStatus === 'queued' ? (
              <ProgressBar processed={chunkProgress.p} total={chunkProgress.t} />
            ) : (
              <CompletedMessage inserted={chunkProgress.i} />
            )}
          </div>
        )}
      </div>
    </Card>

    {showModal && (
      <OcrExtractModal
        onClose={() => setShowModal(false)}
        onSubmit={(data) => {
          void onSubmit(data);
        }}
      />
    )}
  </>
);

const CodigoUrbanisticoPage: React.FC = () => {
  const navigate = useNavigate();
  const state = useCodigoUrbanisticoState();

  const handleSubmit = async ({
    startPage,
    endPage,
    version,
    file,
  }: {
    startPage: number;
    endPage: number;
    version?: string;
    file?: File;
  }) => {
    state.setIsProcessing(true);
    state.setMessage(null);
    try {
      if (!file) return;
      const data = await uploadExtract(startPage, endPage, version, file);
      state.setJobId(data.jobId);
      state.setJobStatus('queued');
      localStorage.setItem('lastJobId', data.jobId);
      state.setMessage(`Proceso iniciado. ID de tarea: ${data.jobId}`);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { message?: string };
      state.setMessage(error.message || 'Ocurrió un error');
    } finally {
      state.setIsProcessing(false);
      state.setShowModal(false);
    }
  };

  useInitialJob(state.jobId, state.setJobId, state.setJobStatus);
  useJobStatus(state.jobId, state.setJobStatus, state.setChunkProgress, state.setMessage);
  useCompletedJob(state.jobStatus, state.jobId, navigate, state.setMessage);

  return (
    <div>
      <PageHeader
        title="Código Urbanístico"
        description="Selecciona el rango de páginas del PDF que deseas analizar y el sistema extraerá las reglas urbanísticas para su posterior revisión."
      />
      <CodigoUrbanisticoContent
        showModal={state.showModal}
        setShowModal={state.setShowModal}
        isProcessing={state.isProcessing}
        message={state.message}
        jobStatus={state.jobStatus}
        chunkProgress={state.chunkProgress}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CodigoUrbanisticoPage;
