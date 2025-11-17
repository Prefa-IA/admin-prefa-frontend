import React from 'react';

interface Props {
  title: string;
  value: string | number;
  delta?: string;
  variant?: 'default' | 'success' | 'danger';
}

const bgMap = {
  default: 'bg-white',
  success: 'bg-green-100',
  danger: 'bg-red-100',
};

const MetricTile: React.FC<Props> = ({ title, value, delta, variant = 'default' }) => {
  return (
    <div className={`p-4 rounded-lg shadow ${bgMap[variant]}`}>
      <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{title}</p>
      <p className="text-3xl font-bold text-blue-700">{value}</p>
      {delta && <p className="text-xs text-green-600 mt-1">{delta}</p>}
    </div>
  );
};

export default MetricTile;
