import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSave: (payload: { codigo: string; descripcion: string }) => void;
}

const NewCodigoModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = () => {
    if (!codigo.trim()) return;
    onSave({ codigo: codigo.trim(), descripcion });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">Nuevo código</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Código
            <input
              className="input-field w-full"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Descripción
            <textarea
              className="input-field w-full"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCodigoModal;
