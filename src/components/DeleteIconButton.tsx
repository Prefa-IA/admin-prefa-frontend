import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Props {
  onClick?: () => void;
  title?: string;
}

const DeleteIconButton: React.FC<Props> = ({ onClick, title = 'Eliminar' }) => (
  <button
    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    onClick={onClick}
    title={title}
  >
    <TrashIcon className="w-5 h-5" />
  </button>
);

export default DeleteIconButton; 