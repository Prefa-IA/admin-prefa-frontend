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
  style?: React.CSSProperties;
}

const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg">
          <table
            className={`
            min-w-full divide-y divide-gray-200 dark:divide-gray-700
            ${className}
          `}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead
      className={`
      bg-gray-50 dark:bg-gray-900/50
      ${className}
    `}
    >
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

const TableHead: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
  colSpan,
  title,
  style,
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  const alignClass = Reflect.get(alignClasses, align) || alignClasses.left;

  return (
    <th
      className={`
        px-3 sm:px-4 md:px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
        ${alignClass}
        ${className}
      `}
      colSpan={colSpan}
      title={title}
      style={style}
    >
      {children}
    </th>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
  colSpan,
  title,
  style,
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  const alignClass = Reflect.get(alignClasses, align) || alignClasses.left;

  return (
    <td
      className={`
        px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap
        ${alignClass}
        ${className}
      `}
      colSpan={colSpan}
      title={title}
      style={style}
    >
      {children}
    </td>
  );
};

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
};

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
