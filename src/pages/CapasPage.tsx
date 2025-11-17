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

const CapasPage: React.FC = () => {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [loading, setLoading] = useState(false);
  interface StatsData {
    featureCount?: number;
    [key: string]: unknown;
  }
  const [statsMap, setStatsMap] = useState<Record<string, StatsData>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadCapas = async () => {
    const res = await axios.get('/api/admin/capas');
    setCapas(res.data);
  };

  const fetchStats = async (id: string) => {
    try {
      const res = await axios.get(`/api/admin/capas/${id}/stats`);
      setStatsMap((prev) => ({ ...prev, [id]: res.data }));
    } catch {}
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

  const handleDrop = async (accepted: File[]) => {
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
      void handleDrop(accepted);
    },
  });

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    const form = new FormData();
    form.append('file', selectedFile);
    form.append('nombre', selectedFile.name.replace(/\.zip|\.shp/i, ''));
    setLoading(true);
    try {
      await axios.post('/api/admin/capas', form);
      await loadCapas();
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Capas" description="Gestiona las capas geográficas del sistema" />

      <Card title="Subir nueva capa" className="mb-6">
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
        {selectedFile && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Vista previa: {selectedFile.name}
            </h4>
            <ShpUploadAndGrid />
            <div className="flex justify-end">
              <Button
                variant="primary"
                disabled={loading}
                onClick={() => {
                  void handleConfirmUpload();
                }}
                isLoading={loading}
              >
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
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No hay capas cargadas
                </TableCell>
              </TableRow>
            ) : (
              capas.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>{c.categoria || '—'}</TableCell>
                  <TableCell>{c.version || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${qualityColor(
                          statsMap[c._id]?.['featureCount']
                        )}`}
                      ></span>
                      <span>{c.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString('es-AR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CapasPage;
