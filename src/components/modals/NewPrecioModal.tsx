import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSave: (payload: { barrio: string; valor: number }) => void;
}

const NewPrecioModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [barrio, setBarrio] = useState('');
  const [valor, setValor] = useState<number | ''>('');

  const handleSubmit = () => {
    if (!barrio.trim() || valor === '') return;
    onSave({ barrio: barrio.trim(), valor: Number(valor) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">Nuevo precio m²</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Barrio
            <input
              className="input-field w-full"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Valor USD
            <input
              type="number"
              className="input-field w-full"
              value={valor}
              onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
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

export default NewPrecioModal;
