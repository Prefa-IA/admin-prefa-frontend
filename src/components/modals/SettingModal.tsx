import React, { useEffect, useState } from 'react';

import { Setting } from '../../types/settings';

interface Props {
  initial?: Setting;
  category: string;
  onClose: () => void;
  onSave: (data: Setting) => void;
}

const SettingModal: React.FC<Props> = ({ initial, category, onClose, onSave }) => {
  const [keyValue, setKeyValue] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initial) {
      setKeyValue(initial.key);
      setValue(JSON.stringify(initial.value));
      setDescription(initial.description || '');
    }
  }, [initial]);

  const handleSubmit = () => {
    if (!keyValue.trim()) return;
    const parsed: unknown = (() => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    })();
    onSave({
      ...(initial?._id ? { _id: initial._id } : {}),
      key: keyValue.trim(),
      category,
      value: parsed,
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl space-y-4">
        <h3 className="text-xl font-semibold">{initial ? 'Editar' : 'Nuevo'} parámetro</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Clave
            <input
              className="input-field w-full"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              disabled={!!initial}
            />
          </label>
          <label className="block text-sm font-medium">
            Valor (texto, número o JSON)
            <textarea
              className="input-field w-full h-24"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Descripción
            <input
              className="input-field w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

export type { Setting };
export default SettingModal;
