import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface Props {
  onClick?: () => void;
  title?: string;
}

const EditIconButton: React.FC<Props> = ({ onClick, title = 'Editar' }) => (
  <button
    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
    onClick={onClick}
    title={title}
  >
    <PencilSquareIcon className="w-5 h-5" />
  </button>
);

export default EditIconButton;
