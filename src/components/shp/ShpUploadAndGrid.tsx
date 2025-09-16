import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
// @ts-ignore – la librería no proporciona tipos
import shp from 'shpjs';

interface Props {
  onDataLoaded?: (features: any[]) => void;
}

const ShpUploadAndGrid: React.FC<Props> = ({ onDataLoaded }) => {
  const [features, setFeatures] = useState<any[]>([]);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/octet-stream': ['.shp'],
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      const file = acceptedFiles[0];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const geojson: any = await shp(arrayBuffer);
        // shpjs puede devolver FeatureCollection o Array de FC
        const feats: any[] =
          geojson?.features ?? (Array.isArray(geojson) ? geojson.flatMap((fc: any) => fc.features) : []);
        setFeatures(feats);
        onDataLoaded?.(feats);
      } catch (error) {
        console.error('Error leyendo shapefile:', error);
      }
    },
  });

  const renderTable = () => {
    if (!features.length) return null;
    const columns = Object.keys(features[0].properties || {});
    return (
      <div className="overflow-auto mt-4 border border-gray-200 rounded-md">
        <table className="min-w-full text-xs divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-2 py-1 text-left font-medium text-gray-700 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {features.slice(0, 50).map((feat, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1 whitespace-nowrap">
                    {feat.properties[col] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {features.length > 50 && (
          <p className="text-xs italic p-2 text-gray-500">
            Mostrando los primeros 50 registros de {features.length}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-md text-center cursor-pointer transition-colors ${
          isDragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? 'Suelta el archivo aquí…' : 'Arrastra un .zip o .shp o haz clic para seleccionar'}
      </div>
      {renderTable()}
    </div>
  );
};

export default ShpUploadAndGrid; 