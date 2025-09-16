import React from 'react';

interface Props {
  onClick?: () => void;
  title?: string;
}

const EditIconButton: React.FC<Props> = ({ onClick, title = 'Editar' }) => (
  <button
    className="text-blue-600 hover:text-blue-800 p-1"
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
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z"
      />
    </svg>
  </button>
);

export default EditIconButton; 