import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  show: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLocked]);
};

const Modal: React.FC<ModalProps> = ({
  show,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  useBodyScrollLock(show);

  if (!show) return null;

  const sizeClass = Reflect.get(SIZE_CLASSES, size) || SIZE_CLASSES.md;

  const handleOverlayClick = (e: React.MouseEvent<HTMLElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (closeOnOverlayClick && e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          aria-label="Cerrar modal"
        />
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={`
            relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto
            ${sizeClass}
            transform transition-all
          `}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h3
              id="modal-title"
              className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 pr-4"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              aria-label="Cerrar modal"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
