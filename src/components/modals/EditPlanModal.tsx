import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plan } from '../../types/planes';

interface Props {
  plan: Partial<Plan> & { id?: string };
  onClose: () => void;
  onSave: (updated: Partial<Plan>) => void;
  basePlans?: { id: string; name: string }[];
}

const EditPlanModal: React.FC<Props> = ({ plan, onClose, onSave }) => {
  const [id, setId] = useState(plan.id || '');
  const [name, setName] = useState(plan.name || '');
  const isNew = !plan.id;
  const [price, setPrice] = useState<string>(isNew ? '' : String(plan.price ?? ''));
  const [creditosTotales, setCreditosTotales] = useState<string>((plan as any).creditosTotales !== undefined ? String((plan as any).creditosTotales) : '');
  const [permiteCompuestas, setPermiteCompuestas] = useState<boolean>((plan as any).permiteCompuestas ?? false);
  const [wmOrg, setWmOrg] = useState<boolean>((plan as any).watermarkOrg ?? false);
  const [wmPrefas, setWmPrefas] = useState<boolean>((plan as any).watermarkPrefas ?? false);
  const [discountPct, setDiscountPct] = useState<string>(isNew ? '' : String(plan.discountPct ?? ''));
  const [discountUntil, setDiscountUntil] = useState<string>(plan.discountUntil ?? '');
  const [prioridad, setPrioridad] = useState<string>(isNew ? '' : String((plan as any).prioridad ?? ''));
  const [tags, setTags] = useState<{_id:string,name:string,slug:string}[]>([]);
  const [isOverage,setIsOverage]=useState<boolean>(plan.isOverage ?? false);
  const [parentPlan,setParentPlan]=useState<string>(plan.parentPlan || '');
  const [tagId, setTagId] = useState<string>(()=>{
    const tagField:any = (plan as any).tag;
    if (!tagField) return '';
    if (typeof tagField === 'string') return tagField;
    return tagField._id || '';
  });
  const [showSticker, setShowSticker] = useState<boolean>((plan as any).showDiscountSticker !== false);
  const [errorMsg,setErrorMsg]=useState<string>('');
  const [freeCredits, setFreeCredits] = useState<string>((plan as any).freeCredits !== undefined ? String((plan as any).freeCredits) : '');

  useEffect(()=>{
    axios.get('/api/admin/plan-tags').then(res=>setTags(res.data));
  },[]);

  const selectedTag = tags.find(t=>t._id===tagId);
  const isSuperSave = selectedTag?.slug==='super-save';

  const handleSubmit = () => {
    if(prioridad==='2'){
      if(Number(freeCredits)<=0){ setErrorMsg('Debes ingresar créditos promocionales > 0 para prioridad 2'); return; }
    }
    if(selectedTag && selectedTag.slug==='free-credits'){
      if(prioridad!=='2' || Number(freeCredits)<=0){ setErrorMsg('La etiqueta "créditos gratis" requiere prioridad 2 y créditos promocionales > 0'); return; }
    }
    setErrorMsg('');

    const payload: any = {
      id: plan.id ?? id,
      name: name.trim(),
      price: price === '' ? undefined : Number(price),
      creditosTotales: creditosTotales === '' ? undefined : Number(creditosTotales),
      freeCredits: freeCredits === '' ? undefined : Number(freeCredits),
      permiteCompuestas,
      watermarkOrg: wmOrg,
      watermarkPrefas: wmPrefas,
      discountPct: discountPct === '' ? undefined : Number(discountPct),
      discountUntil: discountUntil || undefined,
      prioridad: prioridad === '' ? undefined : Number(prioridad),
      tag: tagId === '' ? null : tagId,
      showDiscountSticker: showSticker,
      isOverage,
      parentPlan: isOverage ? parentPlan : undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">{plan.id ? 'Editar plan' : 'Nuevo plan'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!plan.id && (
            <label className="block text-sm font-medium">ID único
              <input className="input-field w-full" value={id} onChange={e => setId(e.target.value)} />
            </label>
          )}
          <label className="block text-sm font-medium md:col-span-2">Nombre
            <input className="input-field w-full" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Precio (ARS)
            <input type="number" className="input-field w-full" value={price} placeholder="Ej: 210000" onChange={e => setPrice(e.target.value)} />
          </label>
          <label className="block text-sm font-medium md:col-span-2">Créditos totales del plan
            <input type="number" className="input-field w-full" value={creditosTotales} placeholder="Ej: 1800" onChange={e => setCreditosTotales(e.target.value)} />
          </label>
          <div className="md:col-span-2 flex flex-col space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input type="checkbox" checked={permiteCompuestas} onChange={e=>setPermiteCompuestas(e.target.checked)} />
              <span>Permite prefactibilidades compuestas</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input type="checkbox" checked={wmOrg} onChange={e=>setWmOrg(e.target.checked)} />
              <span>Marca de agua organización</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input type="checkbox" checked={wmPrefas} onChange={e=>setWmPrefas(e.target.checked)} />
              <span>Marca de agua PreFac</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input type="checkbox" checked={showSticker} onChange={e=>setShowSticker(e.target.checked)} />
              <span>Mostrar etiqueta de descuento en esquina</span>
            </label>
          </div>
          <label className="block text-sm font-medium">Descuento %
            <input type="number" className="input-field w-full" value={discountPct} placeholder="Ej: 10" onChange={e => setDiscountPct(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Descuento hasta (YYYY-MM-DD)
            <input type="date" className="input-field w-full" value={discountUntil?.substring(0,10) || ''} onChange={e => setDiscountUntil(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Prioridad
            <select
              className="input-field w-full"
              value={prioridad}
              onChange={e => { const val=e.target.value; setPrioridad(val); }}
            >
              <option value="">— Seleccionar —</option>
              <option value="1">1 (Recomendado)</option>
              <option value="2">2 (Créditos bono)</option>
              <option value="3">3 (Super Ahorro)</option>
              <option value="4">4 (Básico)</option>
            </select>
          </label>
          <label className="block text-sm font-medium">Etiqueta visual
            <select className="input-field w-full" value={tagId} onChange={e=>setTagId(e.target.value)}>
              <option value="">— Ninguna —</option>
              {tags.map(t=> (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </label>
          {prioridad==='2' && (
          <label className="block text-sm font-medium">Créditos promocionales (solo prioridad 2)
            <input type="number" className="input-field w-full" value={freeCredits} placeholder="Ej: 3000" onChange={e=>setFreeCredits(e.target.value)} />
          </label>
          )}
        </div>
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditPlanModal; 