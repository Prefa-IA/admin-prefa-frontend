import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children, title, headerActions }) => {
  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
      ${className}
    `}
    >
      {(title || headerActions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          )}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className={title || headerActions ? 'p-6' : 'p-6'}>{children}</div>
    </div>
  );
};

export default Card;
