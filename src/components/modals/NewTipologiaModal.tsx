import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSave: (payload: { etiqueta: string; alturaMin: number; alturaMax: number }) => void;
}

const NewTipologiaModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [etiqueta, setEtiqueta] = useState('');
  const [alturaMin, setAlturaMin] = useState<number | ''>('');
  const [alturaMax, setAlturaMax] = useState<number | ''>('');

  const handleSubmit = () => {
    if (!etiqueta.trim() || alturaMin === '' || alturaMax === '') return;
    onSave({ etiqueta: etiqueta.trim(), alturaMin: Number(alturaMin), alturaMax: Number(alturaMax) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">Nueva tipología</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Etiqueta
            <input className="input-field w-full" value={etiqueta} onChange={e => setEtiqueta(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Altura mínima (m)
            <input type="number" className="input-field w-full" value={alturaMin} onChange={e => setAlturaMin(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
          <label className="block text-sm font-medium">Altura máxima (m)
            <input type="number" className="input-field w-full" value={alturaMax} onChange={e => setAlturaMax(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default NewTipologiaModal; 