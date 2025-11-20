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

const categoriaConst = 'afectacion';

interface StatsData {
  count?: number;
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
        ? 'Suelta el ZIP/SHP aquí…'
        : 'Arrastra un .zip/.shp o haz clic para seleccionar'}
    </p>
  </div>
);

const createUploadFormData = (file: File): FormData => {
  const form = new FormData();
  form.append('file', file);
  form.append('nombre', file.name.replace(/\.zip|\.shp/i, ''));
  form.append('categoria', categoriaConst);
  return form;
};

const CapaRow: React.FC<{
  capa: Capa;
  statsMap: Record<string, StatsData>;
}> = ({ capa, statsMap }) => (
  <TableRow key={capa._id}>
    <TableCell className="font-medium">{capa.nombre}</TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${qualityColor(
            statsMap[capa._id]?.['featureCount'] as number | undefined
          )}`}
        ></span>
        <span>{capa.status}</span>
      </div>
    </TableCell>
    <TableCell>{new Date(capa.createdAt).toLocaleDateString('es-AR')}</TableCell>
  </TableRow>
);

const useAfectacionesData = () => {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, StatsData>>({});

  const fetchCapas = async () => {
    const res = await axios.get('/api/admin/capas', { params: { categoria: categoriaConst } });
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
    void fetchCapas();
  }, []);

  useEffect(() => {
    capas.forEach((c) => {
      if (!statsMap[c._id]) {
        void fetchStats(c._id);
      }
    });
  }, [capas, statsMap]);

  return { capas, statsMap, refetchCapas: fetchCapas };
};

const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'], 'application/octet-stream': ['.shp'] },
    multiple: false,
    onDrop: (accepted) => {
      if (!accepted.length) return;
      const file = accepted[0];
      if (file) {
        setSelectedFile(file);
      }
    },
  });

  const upload = async (onSuccess: () => void) => {
    if (!selectedFile) return;
    const form = createUploadFormData(selectedFile);
    setLoading(true);
    try {
      await axios.post('/api/admin/capas', form);
      setSelectedFile(null);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return { selectedFile, loading, getRootProps, getInputProps, isDragActive, upload };
};

const UploadPreview: React.FC<{
  fileName: string;
  loading: boolean;
  onUpload: () => void;
}> = ({ fileName, loading, onUpload }) => (
  <div className="mt-6 space-y-4">
    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Vista previa: {fileName}</h4>
    <ShpUploadAndGrid />
    <div className="flex justify-end">
      <Button variant="primary" disabled={loading} onClick={onUpload} isLoading={loading}>
        Confirmar y guardar capa
      </Button>
    </div>
  </div>
);

const AfectacionesTable: React.FC<{
  capas: Capa[];
  statsMap: Record<string, StatsData>;
}> = ({ capas, statsMap }) => (
  <Card title="Afectaciones cargadas">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {capas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay afectaciones cargadas
            </TableCell>
          </TableRow>
        ) : (
          capas.map((c) => <CapaRow key={c._id} capa={c} statsMap={statsMap} />)
        )}
      </TableBody>
    </Table>
  </Card>
);

const AfectacionesPage: React.FC = () => {
  const { capas, statsMap, refetchCapas } = useAfectacionesData();
  const { selectedFile, loading, getRootProps, getInputProps, isDragActive, upload } =
    useFileUpload();

  const handleUpload = () => {
    void upload(() => {
      void refetchCapas();
    });
  };

  return (
    <div>
      <PageHeader
        title="Afectaciones y Restricciones"
        description="Gestiona las capas de afectaciones y restricciones del sistema"
      />

      <Card title="Subir nueva capa" className="mb-6">
        <FileUploadZone
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
        />
        {selectedFile && (
          <UploadPreview fileName={selectedFile.name} loading={loading} onUpload={handleUpload} />
        )}
      </Card>

      <AfectacionesTable capas={capas} statsMap={statsMap} />
    </div>
  );
};

export default AfectacionesPage;
