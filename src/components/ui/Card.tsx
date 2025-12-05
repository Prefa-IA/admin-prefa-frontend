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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {headerActions && (
            <div className="flex items-center gap-2 flex-wrap">{headerActions}</div>
          )}
        </div>
      )}
      <div className={title || headerActions ? 'p-4 sm:p-6' : 'p-4 sm:p-6'}>{children}</div>
    </div>
  );
};

export default Card;
