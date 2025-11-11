import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { PageHeader, Card, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Button } from '../components/ui';
import ShpUploadAndGrid from '../components/shp/ShpUploadAndGrid';
import { Capa } from '../types/capas';
import { qualityColor } from '../utils/qualityColor';

const categoriaConst = 'afectacion';

const AfectacionesPage: React.FC = () => {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});

  const fetchCapas = async () => {
    const res = await axios.get('/api/admin/capas', { params: { categoria: categoriaConst } });
    setCapas(res.data);
  };

  const fetchStats = async (id: string) => {
    try {
      const res = await axios.get(`/api/admin/capas/${id}/stats`);
      setStatsMap(prev => ({ ...prev, [id]: res.data }));
    } catch {}
  };

  useEffect(() => {
    fetchCapas();
  }, []);

  useEffect(() => {
    capas.forEach(c => {
      if (!statsMap[c._id]) fetchStats(c._id);
    });
  }, [capas]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'], 'application/octet-stream': ['.shp'] },
    multiple: false,
    onDrop: (accepted) => {
      if (!accepted.length) return;
      setSelectedFile(accepted[0]);
    },
  });

  const upload = async () => {
    if (!selectedFile) return;
    const form = new FormData();
    form.append('file', selectedFile);
    form.append('nombre', selectedFile.name.replace(/\.zip|\.shp/i, ''));
    form.append('categoria', categoriaConst);
    setLoading(true);
    await axios.post('/api/admin/capas', form);
    setSelectedFile(null);
    fetchCapas();
    setLoading(false);
  };


  return (
    <div>
      <PageHeader
        title="Afectaciones y Restricciones"
        description="Gestiona las capas de afectaciones y restricciones del sistema"
      />

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
            {isDragActive ? 'Suelta el ZIP/SHP aquí…' : 'Arrastra un .zip/.shp o haz clic para seleccionar'}
          </p>
        </div>
        {selectedFile && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Vista previa: {selectedFile.name}</h4>
            <ShpUploadAndGrid />
            <div className="flex justify-end">
              <Button variant="primary" disabled={loading} onClick={upload} isLoading={loading}>
                Confirmar y guardar capa
              </Button>
            </div>
          </div>
        )}
      </Card>

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
              capas.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${qualityColor(statsMap[c._id]?.featureCount)}`}></span>
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

export default AfectacionesPage; 