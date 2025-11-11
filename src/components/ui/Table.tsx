import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  title?: string;
}

const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`
        w-full divide-y divide-gray-200 dark:divide-gray-700
        ${className}
      `}>
        {children}
      </table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`
      bg-gray-50 dark:bg-gray-900/50
      ${className}
    `}>
      {children}
    </thead>
  );
};

const TableRow: React.FC<TableRowProps> = ({ children, className = '', onClick }) => {
  return (
    <tr
      className={`
        bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50
        transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

const TableHead: React.FC<TableCellProps> = ({ children, className = '', align = 'left', colSpan, title }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <th 
      className={`
        px-4 md:px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
        ${alignClasses[align]}
        ${className}
      `}
      colSpan={colSpan}
      title={title}
    >
      {children}
    </th>
  );
};

const TableCell: React.FC<TableCellProps> = ({ children, className = '', align = 'left', colSpan, title }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td 
      className={`
        px-4 md:px-6 py-4 text-sm text-gray-900 dark:text-gray-100
        ${alignClasses[align]}
        ${className}
      `}
      colSpan={colSpan}
      title={title}
    >
      {children}
    </td>
  );
};

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
};

export { Table, TableHeader, TableRow, TableHead, TableCell, TableBody };

