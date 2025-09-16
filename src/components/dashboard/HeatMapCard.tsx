import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Card from '../Card';

interface Point {
  lat: number;
  lon: number;
  count: number;
}

const HeatLayer: React.FC<{ points: Point[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const heat = (window as any).L.heatLayer(
      points.map(p => [p.lat, p.lon, p.count]),
      { radius: 25, blur: 15, maxZoom: 17 }
    ).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);
  return null;
};

const HeatMapCard: React.FC<{ points: Point[] }> = ({ points }) => {
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