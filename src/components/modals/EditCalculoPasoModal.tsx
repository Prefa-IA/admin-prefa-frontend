import React, { useState, useEffect } from 'react';
import BasicModal from '../BasicModal';

interface Paso {
  _id?: string;
  orden: number;
  nombre_paso: string;
  metodo_interno: string;
  descripcion?: string;
  activo?: boolean;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (p: Paso) => void;
  editing?: Paso | null;
}

const EditCalculoPasoModal: React.FC<Props> = ({ show, onClose, onSave, editing }) => {
  const [form, setForm] = useState<Paso>({ orden: 1, nombre_paso: '', metodo_interno: '', descripcion: '', activo: true });

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ orden: 1, nombre_paso: '', metodo_interno: '', descripcion: '', activo: true });
  }, [editing]);

  // Render
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <BasicModal show={show} onClose={onClose} title={editing ? 'Editar Paso' : 'Nuevo Paso'}>
      <div className="space-y-4">
        <input name="orden" type="number" value={form.orden} onChange={handleChange} className="input-field w-full" placeholder="Orden (1,2,3...)" />
        <input name="nombre_paso" value={form.nombre_paso} onChange={handleChange} className="input-field w-full" placeholder="Nombre del Paso" />
        <input name="metodo_interno" value={form.metodo_interno} onChange={handleChange} className="input-field w-full" placeholder="Nombre del método interno (opcional)" />
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="input-field w-full" placeholder="Descripción" />
        <label className="flex items-center gap-2 select-none"><input type="checkbox" name="activo" checked={form.activo} onChange={handleChange}/> Activo</label>
        <button className="btn-primary" onClick={() => onSave(form)}>Guardar</button>
      </div>
    </BasicModal>
  );
};

export default EditCalculoPasoModal;
