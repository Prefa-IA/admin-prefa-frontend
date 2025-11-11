import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../Card';
import { DashboardItem } from '../../types/components';

const COLORS: Record<string, string> = {
  gratuito: '#90caf9',
  bronze: '#cd7f32',
  silver: '#9e9e9e',
  gold: '#f9a825',
};

const FunnelChart: React.FC<{ data: DashboardItem[] }> = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-2">Funnel de conversión de planes</h3>
    {data.length === 0 ? (
      <p className="text-sm text-gray-500">Sin información disponible.</p>
    ) : (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="label" type="category" />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((item) => (
              <Cell key={`cell-${item.label}`} fill={COLORS[item.label] || '#1976d2'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </Card>
);

export default FunnelChart; 