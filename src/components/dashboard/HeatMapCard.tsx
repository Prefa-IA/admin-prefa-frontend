import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Card from '../Card';
import { HeatMapPoint } from '../../types/components';

const HeatLayer: React.FC<{ points: HeatMapPoint[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const heat = (window as any).L.heatLayer(
      points.map(p => [p.lat, p.lon, p.count || 1]),
      {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        gradient: {
          0.0: 'rgba(255, 255, 0, 0.4)',      // Amarillo visible desde el inicio
          0.2: 'rgba(255, 200, 0, 0.7)',      // Amarillo más opaco
          0.4: 'rgba(255, 150, 0, 0.8)',      // Amarillo-naranja
          0.6: 'rgba(255, 100, 0, 0.9)',      // Naranja
          0.8: 'rgba(255, 50, 0, 0.95)',     // Naranja-rojo
          1.0: 'rgba(255, 0, 0, 1)'          // Rojo intenso
        }
      }
    ).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);
  return null;
};

const HeatMapCard: React.FC<{ points: HeatMapPoint[] }> = ({ points }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Heatmap de barrios</h3>
      {/* @ts-ignore */}<MapContainer
        center={[-34.61, -58.38] as LatLngExpression}
        zoom={12}
        maxBounds={[[-34.75, -58.53], [-34.47, -58.2]] as any}
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