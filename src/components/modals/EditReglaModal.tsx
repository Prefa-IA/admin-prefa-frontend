import React, { useState } from 'react';

import { Regla } from '../../types/reglas';

interface Props {
  regla: Regla;
  onClose: () => void;
  onSave: (updated: Partial<Regla>) => void;
}

const ESTADOS = ['propuesta', 'aprobada', 'rechazada', 'modificada'] as const;

interface FormFields {
  titulo: string;
  descripcion: string;
  categoria: string;
  params: string;
  condiciones: string;
  estado: string;
}

const createPayload = (fields: FormFields): Partial<Regla> => ({
  titulo_regla: fields.titulo,
  descripcion_completa: fields.descripcion,
  categoria: fields.categoria,
  parametros_clave: fields.params
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean),
  condiciones: fields.condiciones,
  estado: fields.estado,
});

interface FormProps {
  fields: FormFields;
  onChange: (fields: FormFields) => void;
}

const ReglaForm: React.FC<FormProps> = ({ fields, onChange }) => {
  const updateField = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    onChange({ ...fields, [key]: value });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Título
        <input
          className="input-field w-full"
          value={fields.titulo}
          onChange={(e) => updateField('titulo', e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Descripción
        <textarea
          className="input-field w-full"
          value={fields.descripcion}
          onChange={(e) => updateField('descripcion', e.target.value)}
          rows={4}
        />
      </label>
      <label className="block text-sm font-medium">
        Categoría
        <input
          className="input-field w-full"
          value={fields.categoria}
          onChange={(e) => updateField('categoria', e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Parámetros clave (separados por coma)
        <input
          className="input-field w-full"
          value={fields.params}
          onChange={(e) => updateField('params', e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Condiciones
        <input
          className="input-field w-full"
          value={fields.condiciones}
          onChange={(e) => updateField('condiciones', e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Estado
        <select
          className="input-field w-full"
          value={fields.estado}
          onChange={(e) => updateField('estado', e.target.value)}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

const EditReglaModal: React.FC<Props> = ({ regla, onClose, onSave }) => {
  const [fields, setFields] = useState<FormFields>({
    titulo: regla.titulo_regla,
    descripcion: regla.descripcion_completa,
    categoria: regla.categoria || '',
    params: (regla.parametros_clave || []).join(', '),
    condiciones: regla.condiciones || '',
    estado: regla.estado || 'propuesta',
  });

  const handleSubmit = () => {
    const payload = createPayload(fields);
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold">Editar regla {regla.id_regla}</h3>
        <ReglaForm fields={fields} onChange={setFields} />
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
