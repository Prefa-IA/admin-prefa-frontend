import React from 'react';

interface Props {
  onClick?: () => void;
  title?: string;
}

const DeleteIconButton: React.FC<Props> = ({ onClick, title = 'Eliminar' }) => (
  <button
    className="text-red-600 hover:text-red-800 p-1"
    onClick={onClick}
    title={title}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
      />
    </svg>
  </button>
);

export default DeleteIconButton; 