import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from './ui';

interface NewItemButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const NewItemButton: React.FC<NewItemButtonProps> = ({ label, onClick, className = '' }) => {
  return (
    <Button
      variant="success"
      onClick={onClick}
      className={className}
    >
      <PlusIcon className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
};

export default NewItemButton; 