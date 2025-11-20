import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import shp from 'shpjs';

interface GeoJSONFeature {
  properties: Record<string, unknown>;
  geometry: unknown;
}

interface Props {
  onDataLoaded?: (features: GeoJSONFeature[]) => void;
}

const ShpUploadAndGrid: React.FC<Props> = ({ onDataLoaded }) => {
  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);
  const handleDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const geojson = (await shp(arrayBuffer)) as
        | { features?: GeoJSONFeature[] }
        | GeoJSONFeature[]
        | undefined;
      const feats: GeoJSONFeature[] =
        geojson && 'features' in geojson && Array.isArray(geojson.features)
          ? geojson.features.filter(
              (f): f is GeoJSONFeature =>
                typeof f === 'object' && f !== null && 'properties' in f && 'geometry' in f
            )
          : Array.isArray(geojson)
            ? geojson.flatMap((fc) =>
                'features' in fc && Array.isArray(fc.features)
                  ? fc.features.filter(
                      (f): f is GeoJSONFeature =>
                        typeof f === 'object' && f !== null && 'properties' in f && 'geometry' in f
                    )
                  : []
              )
            : [];
      setFeatures(feats);
      onDataLoaded?.(feats);
    } catch (error) {
      console.error('Error leyendo shapefile:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/octet-stream': ['.shp'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      void handleDrop(acceptedFiles);
    },
  });

  const renderTable = () => {
    if (!features.length) return null;
    const firstFeature = features[0];
    if (!firstFeature) return null;
    const columns = Object.keys(firstFeature.properties || {});
    return (
      <div className="overflow-auto mt-4 border border-gray-200 rounded-md">
        <table className="min-w-full text-xs divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 text-left font-medium text-gray-700 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {features.slice(0, 50).map((feat, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => {
                  const value = Reflect.get(feat.properties, col);
                  return (
                    <td key={col} className="px-2 py-1 whitespace-nowrap">
                      {value != null ? String(value) : ''}
                    </td>
                  );
                })}
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
        {isDragActive
          ? 'Suelta el archivo aquí…'
          : 'Arrastra un .zip o .shp o haz clic para seleccionar'}
      </div>
      {renderTable()}
    </div>
  );
};

export default ShpUploadAndGrid;
