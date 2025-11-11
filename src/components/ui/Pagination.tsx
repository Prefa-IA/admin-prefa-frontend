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

const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  pageSize = 20,
  onPageChange,
  className = '',
  showPageNumbers = true
}) => {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
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
                    ${isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
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
        Mostrando {((current - 1) * pageSize) + 1} - {Math.min(current * pageSize, total)} de {total}
      </div>
    </div>
  );
};

export default Pagination;

