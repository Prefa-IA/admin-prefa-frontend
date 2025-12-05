import React, { useEffect, useState } from 'react';

import { ReglaLogica } from '../../types/reglas';
import BasicModal from '../BasicModal';

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (r: ReglaLogica) => void;
  editing?: ReglaLogica | null;
  pasos: { _id: string; nombre_paso: string }[];
}

interface FormData {
  distrito_cpu: string;
  condicion_json: string;
  formula_json: string;
  id_cu_referencia: string;
  activo: boolean;
  id_paso?: string;
  descripcion?: string;
}

const toStr = (v: unknown): string =>
  typeof v === 'object' && v !== null ? JSON.stringify(v, null, 2) : String(v || '');

const createFormDataFromEditing = (editing: ReglaLogica): FormData => {
  const idCu = editing.id_cu_referencia;
  const idCuStr = Array.isArray(idCu) ? idCu.join(', ') : idCu || '';
  const formData: FormData = {
    distrito_cpu: editing.distrito_cpu || '',
    condicion_json: toStr(editing.condicion_json),
    formula_json: toStr(editing.formula_json),
    id_cu_referencia: idCuStr,
    activo: editing.activo ?? true,
  };
  if (editing.id_paso !== undefined) {
    formData.id_paso = editing.id_paso;
  }
  if (editing.descripcion !== undefined) {
    formData.descripcion = editing.descripcion;
  }
  return formData;
};

const getInitialFormData = (): FormData => ({
  distrito_cpu: '',
  condicion_json: '',
  formula_json: '',
  id_cu_referencia: '',
  activo: true,
});

const parseField = (v: string): unknown => {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
};

const parseIdCu = (value: string): string[] =>
  value
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

const createPayload = (form: FormData): ReglaLogica =>
  ({
    ...form,
    condicion_json: parseField(form.condicion_json),
    formula_json: parseField(form.formula_json),
    id_cu_referencia:
      typeof form.id_cu_referencia === 'string'
        ? parseIdCu(form.id_cu_referencia)
        : form.id_cu_referencia,
  }) as ReglaLogica;

const useReglaForm = (editing: ReglaLogica | null | undefined) => {
  const [form, setForm] = useState<FormData>(getInitialFormData());

  useEffect(() => {
    if (editing) {
      setForm(createFormDataFromEditing(editing));
    } else {
      setForm(getInitialFormData());
    }
  }, [editing]);

  return { form, setForm };
};

const handleFormChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  setForm: React.Dispatch<React.SetStateAction<FormData>>
) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const name = target.name;
  const value = target.value;
  const type = 'type' in target ? target.type : 'text';
  const checked = 'checked' in target ? target.checked : false;
  setForm((prev: FormData) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
};

const FormFields: React.FC<{
  form: FormData;
  pasos: Props['pasos'];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}> = ({ form, pasos, onChange }) => (
  <>
    <select name="id_paso" value={form.id_paso} onChange={onChange} className="input-field w-full">
      <option value="">Seleccionar Paso</option>
      {pasos.map((p) => (
        <option key={p._id} value={p._id}>
          {p.nombre_paso}
        </option>
      ))}
    </select>
    <input
      name="distrito_cpu"
      value={form.distrito_cpu}
      onChange={onChange}
      className="input-field w-full"
      placeholder="Distrito CPU"
    />
    <textarea
      name="condicion_json"
      value={form.condicion_json}
      onChange={onChange}
      className="input-field w-full h-24"
      placeholder='Ej: {"frente":{"$gt":8.66}}'
    />
    <textarea
      name="formula_json"
      value={form.formula_json}
      onChange={onChange}
      className="input-field w-full h-24"
      placeholder="Ej: 3 * datosCatastrales.fondo"
    />
    <input
      name="id_cu_referencia"
      value={form.id_cu_referencia}
      onChange={onChange}
      className="input-field w-full"
      placeholder="Códigos CU separados por coma"
    />
    <textarea
      name="descripcion"
      value={form.descripcion}
      onChange={onChange}
      className="input-field w-full"
      placeholder="Descripción"
    />
    <label className="flex items-center gap-2 select-none">
      <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} /> Activo
    </label>
  </>
);

const EditReglaLogicaModal: React.FC<Props> = ({ show, onClose, onSave, editing, pasos }) => {
  const { form, setForm } = useReglaForm(editing);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    handleFormChange(e, setForm);
  };

  const handleSave = () => {
    onSave(createPayload(form));
  };

  return (
    <BasicModal show={show} onClose={onClose} title={editing ? 'Editar Regla' : 'Nueva Regla'}>
      <div className="space-y-4">
        <FormFields form={form} pasos={pasos} onChange={handleChange} />
        <button className="btn-primary" onClick={handleSave}>
          Guardar
        </button>
      </div>
    </BasicModal>
  );
};
export default EditReglaLogicaModal;
