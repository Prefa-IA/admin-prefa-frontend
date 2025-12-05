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

const isValidGeoJSONFeature = (f: unknown): f is GeoJSONFeature =>
  typeof f === 'object' && f !== null && 'properties' in f && 'geometry' in f;

const extractFeatures = (geojson: unknown): GeoJSONFeature[] => {
  if (
    geojson &&
    typeof geojson === 'object' &&
    'features' in geojson &&
    Array.isArray(geojson.features)
  ) {
    return geojson.features.filter((f) => isValidGeoJSONFeature(f));
  }
  if (Array.isArray(geojson)) {
    return geojson.flatMap((fc: unknown) =>
      typeof fc === 'object' && fc !== null && 'features' in fc && Array.isArray(fc.features)
        ? fc.features.filter((f: unknown) => isValidGeoJSONFeature(f))
        : []
    );
  }
  return [];
};

const FileDropzone: React.FC<{
  isDragActive: boolean;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
}> = ({ isDragActive, getRootProps, getInputProps }) => (
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
);

const processShapefile = async (file: File): Promise<GeoJSONFeature[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const geojson = (await shp(arrayBuffer)) as unknown;
  return extractFeatures(geojson);
};

const FeatureRow: React.FC<{ feature: GeoJSONFeature; columns: string[]; index: number }> = ({
  feature,
  columns,
  index,
}) => (
  <tr key={index} className="hover:bg-gray-50">
    {columns.map((col) => {
      const value = Reflect.get(feature.properties, col);
      return (
        <td key={col} className="px-2 py-1 whitespace-nowrap">
          {value != null ? String(value) : ''}
        </td>
      );
    })}
  </tr>
);

const FeaturesTable: React.FC<{ features: GeoJSONFeature[] }> = ({ features: feats }) => {
  if (!feats.length) return null;
  const firstFeature = feats[0];
  if (!firstFeature) return null;
  const columns = Object.keys(firstFeature.properties || {});
  const displayedFeatures = feats.slice(0, 50);

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
          {displayedFeatures.map((feat, idx) => (
            <FeatureRow key={idx} feature={feat} columns={columns} index={idx} />
          ))}
        </tbody>
      </table>
      {feats.length > 50 && (
        <p className="text-xs italic p-2 text-gray-500">
          Mostrando los primeros 50 registros de {feats.length}
        </p>
      )}
    </div>
  );
};

const useShapefileUpload = (onDataLoaded?: (features: GeoJSONFeature[]) => void) => {
  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    if (!file) return;
    try {
      const feats = await processShapefile(file);
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

  return { features, getRootProps, getInputProps, isDragActive };
};

const ShpUploadAndGrid: React.FC<Props> = ({ onDataLoaded }) => {
  const { features, getRootProps, getInputProps, isDragActive } = useShapefileUpload(onDataLoaded);

  return (
    <div>
      <FileDropzone
        isDragActive={isDragActive}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
      />
      <FeaturesTable features={features} />
    </div>
  );
};

export default ShpUploadAndGrid;
