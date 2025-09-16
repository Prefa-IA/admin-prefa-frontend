import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Card from '../components/Card';
import ShpUploadAndGrid from '../components/shp/ShpUploadAndGrid';

interface Capa {
  _id: string;
  nombre: string;
  categoria: string;
  version: string;
  status: string;
  createdAt: string;
}

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

  const qualityColor = (count?: number) => {
    if (count === undefined) return 'bg-gray-400';
    if (count === 0) return 'bg-red-500';
    if (count < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Afectaciones y Restricciones</h1>
      </div>
      <Card>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
            isDragActive ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? 'Suelta el ZIP/SHP aquí…' : 'Arrastra un .zip/.shp o haz clic para seleccionar'}
        </div>
        {selectedFile && (
          <div className="mt-4 space-y-4">
            <h4 className="font-semibold">Vista previa: {selectedFile.name}</h4>
            <ShpUploadAndGrid />
            <button className="btn-primary" disabled={loading} onClick={upload}>
              {loading ? 'Subiendo…' : 'Confirmar y guardar capa'}
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-2">Afectaciones cargadas</h3>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {capas.map((c) => (
              <tr key={c._id} className="odd:bg-gray-50">
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${qualityColor(statsMap[c._id]?.featureCount)}`}></span>
                  <span>{c.status}</span>
                </td>
                <td className="px-4 py-2">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AfectacionesPage; 