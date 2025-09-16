import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSave: (payload: { codigo: string; nombre: string; alturaMax: number }) => void;
}

const NewZonificacionModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [alturaMax, setAlturaMax] = useState<number | ''>('');

  const handleSubmit = () => {
    if (!codigo.trim() || !nombre.trim() || alturaMax === '') return;
    onSave({ codigo: codigo.trim(), nombre: nombre.trim(), alturaMax: Number(alturaMax) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">Nueva zonificación</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Código
            <input className="input-field w-full" value={codigo} onChange={e => setCodigo(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Nombre
            <input className="input-field w-full" value={nombre} onChange={e => setNombre(e.target.value)} />
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

export default NewZonificacionModal; 