import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import Button from './Button';

interface PaginationProps {
  total: number;
  current: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

const generateAllPages = (totalPages: number): (number | string)[] =>
  Array.from({ length: totalPages }, (_, i) => i + 1);

const generateStartPages = (totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = Array.from({ length: 4 }, (_, i) => i + 1);
  pages.push('...');
  pages.push(totalPages);
  return pages;
};

const generateEndPages = (totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [1, '...'];
  const endPages = Array.from({ length: 4 }, (_, i) => totalPages - 3 + i);
  pages.push(...endPages);
  return pages;
};

const generateMiddlePages = (current: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [1, '...'];
  const middlePages = Array.from({ length: 3 }, (_, i) => current - 1 + i);
  pages.push(...middlePages);
  pages.push('...');
  pages.push(totalPages);
  return pages;
};

const getPageNumbers = (current: number, totalPages: number): (number | string)[] => {
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    return generateAllPages(totalPages);
  }

  if (current <= 3) {
    return generateStartPages(totalPages);
  }

  if (current >= totalPages - 2) {
    return generateEndPages(totalPages);
  }

  return generateMiddlePages(current, totalPages);
};

const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  pageSize = 20,
  onPageChange,
  className = '',
  showPageNumbers = true,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const PageNumberButton: React.FC<{ page: number | string; index: number }> = ({
    page,
    index,
  }) => {
    if (page === '...') {
      return (
        <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
          ...
        </span>
      );
    }

    const pageNum = page as number;
    const isActive = pageNum === current;

    return (
      <button
        key={pageNum}
        onClick={() => onPageChange(pageNum)}
        className={`
          min-w-[2.5rem] h-9 px-3 rounded-lg text-sm font-medium transition-all
          ${
            isActive
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }
        `}
      >
        {pageNum}
      </button>
    );
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {getPageNumbers(current, totalPages).map((page, idx) => (
              <PageNumberButton key={idx} page={page} index={idx} />
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {(current - 1) * pageSize + 1} - {Math.min(current * pageSize, total)} de {total}
      </div>
    </div>
  );
};

export default Pagination;
