import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import ShpUploadAndGrid from '../components/shp/ShpUploadAndGrid';
import {
  Button,
  Card,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Capa } from '../types/capas';
import { qualityColor } from '../utils/qualityColor';

interface StatsData {
  featureCount?: number;
  [key: string]: unknown;
}

const FileUploadZone: React.FC<{
  isDragActive: boolean;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
}> = ({ isDragActive, getRootProps, getInputProps }) => (
  <div
    {...getRootProps()}
    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
      isDragActive
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
    }`}
  >
    <input {...getInputProps()} />
    <p className="text-gray-600 dark:text-gray-400">
      {isDragActive
        ? 'Suelta el ZIP o SHP aquí…'
        : 'Arrastra un .zip/.shp o haz clic para seleccionar'}
    </p>
  </div>
);

const createUploadFormData = (file: File): FormData => {
  const form = new FormData();
  form.append('file', file);
  form.append('nombre', file.name.replace(/\.zip|\.shp/i, ''));
  return form;
};

const CapaRow: React.FC<{
  capa: Capa;
  statsMap: Record<string, StatsData>;
}> = ({ capa, statsMap }) => (
  <TableRow key={capa._id}>
    <TableCell className="font-medium">{capa.nombre}</TableCell>
    <TableCell>{capa.categoria || '—'}</TableCell>
    <TableCell>{capa.version || '—'}</TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${qualityColor(
            statsMap[capa._id]?.['featureCount']
          )}`}
        ></span>
        <span>{capa.status}</span>
      </div>
    </TableCell>
    <TableCell>{new Date(capa.createdAt).toLocaleDateString('es-AR')}</TableCell>
  </TableRow>
);

const useCapasData = () => {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, StatsData>>({});

  const loadCapas = async () => {
    const res = await axios.get('/api/admin/capas');
    setCapas(res.data);
  };

  const fetchStats = async (id: string) => {
    try {
      const res = await axios.get(`/api/admin/capas/${id}/stats`);
      setStatsMap((prev) => ({ ...prev, [id]: res.data }));
    } catch {
      // Silently handle errors
    }
  };

  useEffect(() => {
    void loadCapas();
  }, []);

  useEffect(() => {
    capas.forEach((c) => {
      if (!statsMap[c._id]) {
        void fetchStats(c._id);
      }
    });
  }, [capas, statsMap]);

  return { capas, statsMap, reloadCapas: loadCapas };
};

const useCapasUpload = (onUploadSuccess: () => void) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = (accepted: File[]) => {
    if (!accepted.length) return;
    const file = accepted[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'], 'application/octet-stream': ['.shp'] },
    multiple: false,
    onDrop: (accepted) => {
      handleDrop(accepted);
    },
  });

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    const form = createUploadFormData(selectedFile);
    setLoading(true);
    try {
      await axios.post('/api/admin/capas', form);
      setSelectedFile(null);
      onUploadSuccess();
    } finally {
      setLoading(false);
    }
  };

  return { selectedFile, loading, getRootProps, getInputProps, isDragActive, handleConfirmUpload };
};

const CapasUploadSection: React.FC<{
  selectedFile: File | null;
  loading: boolean;
  isDragActive: boolean;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  onUpload: () => void;
}> = ({ selectedFile, loading, isDragActive, getRootProps, getInputProps, onUpload }) => (
  <Card title="Subir nueva capa" className="mb-6">
    <FileUploadZone
      isDragActive={isDragActive}
      getRootProps={getRootProps}
      getInputProps={getInputProps}
    />
    {selectedFile && (
      <div className="mt-6 space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          Vista previa: {selectedFile.name}
        </h4>
        <ShpUploadAndGrid />
        <div className="flex justify-end">
          <Button variant="primary" disabled={loading} onClick={onUpload} isLoading={loading}>
            Confirmar y guardar capa
          </Button>
        </div>
      </div>
    )}
    {loading && !selectedFile && (
      <div className="mt-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Procesando…</p>
      </div>
    )}
  </Card>
);

const CapasTable: React.FC<{
  capas: Capa[];
  statsMap: Record<string, StatsData>;
}> = ({ capas, statsMap }) => (
  <Card title="Capas cargadas">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Versión</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {capas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay capas cargadas
            </TableCell>
          </TableRow>
        ) : (
          capas.map((c) => <CapaRow key={c._id} capa={c} statsMap={statsMap} />)
        )}
      </TableBody>
    </Table>
  </Card>
);

const CapasPage: React.FC = () => {
  const { capas, statsMap, reloadCapas } = useCapasData();
  const { selectedFile, loading, getRootProps, getInputProps, isDragActive, handleConfirmUpload } =
    useCapasUpload(() => {
      void reloadCapas();
    });

  return (
    <div>
      <PageHeader title="Capas" description="Gestiona las capas geográficas del sistema" />
      <CapasUploadSection
        selectedFile={selectedFile}
        loading={loading}
        isDragActive={isDragActive}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        onUpload={() => {
          void handleConfirmUpload();
        }}
      />
      <CapasTable capas={capas} statsMap={statsMap} />
    </div>
  );
};

export default CapasPage;
