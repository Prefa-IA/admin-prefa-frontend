import React from 'react';

interface Props {
  total: number;
  current: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<Props> = ({ total, current, pageSize = 20, onPageChange, className = '' }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const numbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        className="px-2 py-1 rounded disabled:opacity-50 bg-gray-200 hover:bg-gray-300"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
      >
        «
      </button>
      {numbers.map(n => (
        <button
          key={n}
          className={`px-3 py-1 rounded text-sm ${n === current ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => onPageChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        className="px-2 py-1 rounded disabled:opacity-50 bg-gray-200 hover:bg-gray-300"
        onClick={() => onPageChange(current + 1)}
        disabled={current === totalPages}
      >
        »
      </button>
    </div>
  );
};

export default Pagination; 