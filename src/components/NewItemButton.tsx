import React from 'react';

interface NewItemButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const NewItemButton: React.FC<NewItemButtonProps> = ({ label, onClick, className = '' }) => {
  return (
    <button
      className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default NewItemButton; 