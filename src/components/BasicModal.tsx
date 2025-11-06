import React from 'react';

interface Props {
  show: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const BasicModal: React.FC<Props> = ({ show, title, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};
export default BasicModal;
