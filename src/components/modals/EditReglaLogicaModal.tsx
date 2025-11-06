import React, { useEffect, useState } from 'react';
import BasicModal from '../BasicModal';

interface Regla {
  _id?: string;
  id_paso?: string;
  distrito_cpu: string;
  condicion_json: any;
  formula_json: any;
  /** Puede ser varias referencias CU */
  id_cu_referencia?: string[];
  descripcion?: string;
  activo?: boolean;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (r: Regla) => void;
  editing?: Regla | null;
  pasos: { _id: string; nombre_paso: string }[];
}

const EditReglaLogicaModal: React.FC<Props> = ({ show, onClose, onSave, editing, pasos }) => {
  const [form, setForm] = useState<any>({ distrito_cpu: '', condicion_json: '', formula_json: '', id_cu_referencia: '', activo: true });

  useEffect(() => {
    if (editing) {
      const toStr = (v:any)=> (typeof v==='object'&&v!==null? JSON.stringify(v, null, 2): (v||''));
      const idCu = (editing as any).id_cu_referencia;
      const idCuStr = Array.isArray(idCu) ? idCu.join(', ') : (idCu || '');
      setForm({ ...editing, id_cu_referencia: idCuStr, condicion_json: toStr(editing.condicion_json), formula_json: toStr(editing.formula_json) });
    } else {
      setForm({ distrito_cpu: '', condicion_json: '', formula_json: '', id_cu_referencia: '', activo: true });
    }
  }, [editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>{
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any)=>({...prev,[name]: type==='checkbox'?checked:value}));
  };

  return (
    <BasicModal show={show} onClose={onClose} title={editing?'Editar Regla':'Nueva Regla'}>
      <div className="space-y-4">
        <select name="id_paso" value={form.id_paso} onChange={handleChange} className="input-field w-full">
          <option value="">Seleccionar Paso</option>
          {pasos.map(p=> <option key={p._id} value={p._id}>{p.nombre_paso}</option>) }
        </select>
        <input name="distrito_cpu" value={form.distrito_cpu} onChange={handleChange} className="input-field w-full" placeholder="Distrito CPU" />
        <textarea name="condicion_json" value={form.condicion_json} onChange={handleChange} className="input-field w-full h-24" placeholder='Ej: {"frente":{"$gt":8.66}}'/>
        <textarea name="formula_json" value={form.formula_json} onChange={handleChange} className="input-field w-full h-24" placeholder="Ej: 3 * datosCatastrales.fondo"/>
        <input name="id_cu_referencia" value={form.id_cu_referencia} onChange={handleChange} className="input-field w-full" placeholder="Códigos CU separados por coma" />
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="input-field w-full" placeholder="Descripción"/>
        <label className="flex items-center gap-2 select-none"><input type="checkbox" name="activo" checked={form.activo} onChange={handleChange}/> Activo</label>
        <button className="btn-primary" onClick={()=>{
          const parseField = (v:any)=>{
            if(typeof v==='string'){
              try{ return JSON.parse(v); }catch{return v;}
            }
            return v;
          };
          const payload = {
            ...form,
            condicion_json: parseField(form.condicion_json),
            formula_json: parseField(form.formula_json),
            id_cu_referencia: typeof form.id_cu_referencia === 'string'
              ? form.id_cu_referencia.split(',').map((s: string) => s.trim()).filter(Boolean)
              : form.id_cu_referencia
          } as Regla;
          onSave(payload);
        }}>Guardar</button>
      </div>
    </BasicModal>
  );
};
export default EditReglaLogicaModal;
