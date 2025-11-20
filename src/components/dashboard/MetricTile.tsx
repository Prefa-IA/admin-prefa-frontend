import React from 'react';

interface Props {
  title: string;
  value: string | number;
  delta?: string;
  variant?: 'default' | 'success' | 'danger';
}

const bgMap = {
  default: 'bg-white dark:bg-gray-800',
  success: 'bg-green-100 dark:bg-green-900/30',
  danger: 'bg-red-100 dark:bg-red-900/30',
};

const MetricTile: React.FC<Props> = ({ title, value, delta, variant = 'default' }) => {
  const bgClass = Reflect.get(bgMap, variant) || bgMap.default;
  return (
    <div className={`p-4 rounded-lg shadow ${bgClass}`}>
      <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{value}</p>
      {delta && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{delta}</p>}
    </div>
  );
};

export default MetricTile;
