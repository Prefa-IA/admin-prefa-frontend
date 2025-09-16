import React from 'react';

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white shadow rounded-lg p-6 ${className}`}>{children}</div>
);

export default Card; 