import React, { useState } from 'react';

import { Regla } from '../../types/reglas';

interface Props {
  regla: Regla;
  onClose: () => void;
  onSave: (updated: Partial<Regla>) => void;
}

const estados = ['propuesta', 'aprobada', 'rechazada', 'modificada'];

const EditReglaModal: React.FC<Props> = ({ regla, onClose, onSave }) => {
  const [titulo, setTitulo] = useState(regla.titulo_regla);
  const [descripcion, setDescripcion] = useState(regla.descripcion_completa);
  const [categoria, setCategoria] = useState(regla.categoria || '');
  const [params, setParams] = useState((regla.parametros_clave || []).join(', '));
  const [condiciones, setCondiciones] = useState(regla.condiciones || '');
  const [estado, setEstado] = useState(regla.estado || 'propuesta');

  const handleSubmit = () => {
    const payload: Partial<Regla> = {
      titulo_regla: titulo,
      descripcion_completa: descripcion,
      categoria,
      parametros_clave: params
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      condiciones,
      estado,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold">Editar regla {regla.id_regla}</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Título
            <input
              className="input-field w-full"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Descripción
            <textarea
              className="input-field w-full"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
            />
          </label>
          <label className="block text-sm font-medium">
            Categoría
            <input
              className="input-field w-full"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Parámetros clave (separados por coma)
            <input
              className="input-field w-full"
              value={params}
              onChange={(e) => setParams(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Condiciones
            <input
              className="input-field w-full"
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Estado
            <select
              className="input-field w-full"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
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

export default EditReglaModal;
