import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../Card';
import { RevenueItem } from '../../types/components';

const COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#9e9e9e',
  gold: '#f9a825',
};

const RevenueBarChart: React.FC<{ data: RevenueItem[] }> = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-2">Revenue por plan</h3>
    {data.length === 0 ? (
      <p className="text-sm text-gray-500">Sin información disponible.</p>
    ) : (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="plan" />
          <YAxis />
          <Tooltip formatter={(v: any) => `$${v}`} />
          <Bar dataKey="revenue">
            {data.map((entry) => (
              <Cell key={`cell-${entry.plan}`} fill={COLORS[entry.plan] || '#1976d2'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </Card>
);

export default RevenueBarChart; 