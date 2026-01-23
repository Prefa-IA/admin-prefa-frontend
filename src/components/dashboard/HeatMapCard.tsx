import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import 'leaflet.heat';

import { HeatMapPoint } from '../../types/components';
import Card from '../Card';

import 'leaflet/dist/leaflet.css';

interface LeafletWindow extends Window {
  L?: {
    heatLayer: (
      points: number[][],
      options: Record<string, unknown>
    ) => {
      addTo: (map: unknown) => unknown;
    };
  };
}

const HeatLayer: React.FC<{ points: HeatMapPoint[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const leafletWindow = window as unknown as LeafletWindow;
    if (!leafletWindow.L?.heatLayer) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const heat = leafletWindow.L.heatLayer(
      points.map((p) => [p.lat, p.lon, p.count || 1]),
      {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        minOpacity: 0.25,
        gradient: {
          0.0: 'rgba(255, 255, 0, 0.2)', // 20% - Amarillo visible
          0.1: 'rgba(255, 240, 0, 0.3)', // 30% - Amarillo
          0.2: 'rgba(255, 220, 0, 0.4)', // 40% - Amarillo más visible
          0.3: 'rgba(255, 200, 0, 0.5)', // 50% - Amarillo-naranja claro
          0.4: 'rgba(255, 180, 0, 0.6)', // 60% - Amarillo-naranja
          0.5: 'rgba(255, 150, 0, 0.7)', // 70% - Naranja claro
          0.6: 'rgba(255, 120, 0, 0.75)', // 75% - Naranja
          0.7: 'rgba(255, 90, 0, 0.8)', // 80% - Naranja intenso
          0.8: 'rgba(255, 60, 0, 0.85)', // 85% - Naranja-rojo
          0.9: 'rgba(255, 30, 0, 0.9)', // 90% - Rojo-naranja
          1.0: 'rgba(255, 0, 0, 0.95)', // 95% - Rojo (máximo escalable)
        },
      }
    ).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);
  return null;
};

const HeatMapCard: React.FC<{ points: HeatMapPoint[] }> = ({ points }) => {
  const center: [number, number] = [-34.61, -58.38];
  const maxBounds: [[number, number], [number, number]] = [
    [-34.75, -58.53],
    [-34.47, -58.2],
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Heatmap de barrios
      </h3>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <MapContainer
        // @ts-expect-error - react-leaflet types may be incomplete
        center={center}
        zoom={12}
        maxBounds={maxBounds}
        maxBoundsViscosity={1}
        style={{ height: 400, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <HeatLayer points={points} />
      </MapContainer>
    </Card>
  );
};

export default HeatMapCard;
