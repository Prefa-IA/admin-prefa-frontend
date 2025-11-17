import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Plan } from '../../types/planes';

interface PlanTag {
  _id: string;
  name: string;
  slug: string;
}

interface PlanPayload {
  id?: string;
  name: string;
  price?: number | undefined;
  creditosTotales?: number | undefined;
  freeCredits?: number | undefined;
  permiteCompuestas: boolean;
  watermarkOrg: boolean;
  watermarkPrefas: boolean;
  discountPct?: number | undefined;
  discountUntil?: string | undefined;
  prioridad?: number | undefined;
  tag: string | null;
  showDiscountSticker: boolean;
  isOverage: boolean;
  parentPlan?: string | undefined;
}

interface Props {
  plan: Partial<Plan> & { id?: string };
  onClose: () => void;
  onSave: (updated: Partial<Plan>) => void;
  basePlans?: { id: string; name: string }[];
}

const getInitialTagId = (tag: Plan['tag']): string => {
  if (!tag) return '';
  if (typeof tag === 'string') return tag;
  return tag._id || '';
};

const getInitialStringValue = (value: number | undefined, isNew: boolean): string => {
  return isNew ? '' : String(value ?? '');
};

const EditPlanModal: React.FC<Props> = ({ plan, onClose, onSave }) => {
  const isNew = !plan.id;
  const [id, setId] = useState(plan.id || '');
  const [name, setName] = useState(plan.name || '');
  const [price, setPrice] = useState<string>(getInitialStringValue(plan.price, isNew));
  const [creditosTotales, setCreditosTotales] = useState<string>(
    plan.creditosTotales !== undefined ? String(plan.creditosTotales) : ''
  );
  const [permiteCompuestas, setPermiteCompuestas] = useState<boolean>(
    plan.permiteCompuestas ?? false
  );
  const [wmOrg, setWmOrg] = useState<boolean>(plan.watermarkOrg ?? false);
  const [wmPrefas, setWmPrefas] = useState<boolean>(plan.watermarkPrefas ?? false);
  const [discountPct, setDiscountPct] = useState<string>(
    getInitialStringValue(plan.discountPct, isNew)
  );
  const [discountUntil, setDiscountUntil] = useState<string>(plan.discountUntil ?? '');
  const [prioridad, setPrioridad] = useState<string>(getInitialStringValue(plan.prioridad, isNew));
  const [tags, setTags] = useState<PlanTag[]>([]);
  const [isOverage] = useState<boolean>(plan.isOverage ?? false);
  const [parentPlan] = useState<string>(plan.parentPlan || '');
  const [tagId, setTagId] = useState<string>(getInitialTagId(plan.tag));
  const [showSticker, setShowSticker] = useState<boolean>(plan.showDiscountSticker !== false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [freeCredits, setFreeCredits] = useState<string>(
    plan.freeCredits !== undefined ? String(plan.freeCredits) : ''
  );

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get<PlanTag[]>('/api/admin/plan-tags');
        setTags(response.data);
      } catch {
        // Silently handle errors
      }
    };
    void fetchTags();
  }, []);

  const selectedTag = tags.find((t) => t._id === tagId);

  const validatePrioridad2 = (): boolean => {
    if (prioridad === '2' && Number(freeCredits) <= 0) {
      setErrorMsg('Debes ingresar créditos promocionales > 0 para prioridad 2');
      return false;
    }
    return true;
  };

  const validateFreeCreditsTag = (): boolean => {
    if (selectedTag?.slug === 'free-credits') {
      if (prioridad !== '2' || Number(freeCredits) <= 0) {
        setErrorMsg(
          'La etiqueta "créditos gratis" requiere prioridad 2 y créditos promocionales > 0'
        );
        return false;
      }
    }
    return true;
  };

  const buildPayload = (): PlanPayload => {
    return {
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
  };

  const handleSubmit = () => {
    setErrorMsg('');

    if (!validatePrioridad2()) {
      return;
    }

    if (!validateFreeCreditsTag()) {
      return;
    }

    const payload = buildPayload();
    onSave(payload as Partial<Plan>);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">{plan.id ? 'Editar plan' : 'Nuevo plan'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!plan.id && (
            <label className="block text-sm font-medium">
              ID único
              <input
                className="input-field w-full"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label>
          )}
          <label className="block text-sm font-medium md:col-span-2">
            Nombre
            <input
              className="input-field w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Precio (ARS)
            <input
              type="number"
              className="input-field w-full"
              value={price}
              placeholder="Ej: 210000"
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium md:col-span-2">
            Créditos totales del plan
            <input
              type="number"
              className="input-field w-full"
              value={creditosTotales}
              placeholder="Ej: 1800"
              onChange={(e) => setCreditosTotales(e.target.value)}
            />
          </label>
          <div className="md:col-span-2 flex flex-col space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={permiteCompuestas}
                onChange={(e) => setPermiteCompuestas(e.target.checked)}
              />
              <span>Permite prefactibilidades compuestas</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input type="checkbox" checked={wmOrg} onChange={(e) => setWmOrg(e.target.checked)} />
              <span>Marca de agua organización</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={wmPrefas}
                onChange={(e) => setWmPrefas(e.target.checked)}
              />
              <span>Marca de agua PreFac</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={showSticker}
                onChange={(e) => setShowSticker(e.target.checked)}
              />
              <span>Mostrar etiqueta de descuento en esquina</span>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Descuento %
            <input
              type="number"
              className="input-field w-full"
              value={discountPct}
              placeholder="Ej: 10"
              onChange={(e) => setDiscountPct(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Descuento hasta (YYYY-MM-DD)
            <input
              type="date"
              className="input-field w-full"
              value={discountUntil?.substring(0, 10) || ''}
              onChange={(e) => setDiscountUntil(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Prioridad
            <select
              className="input-field w-full"
              value={prioridad}
              onChange={(e) => {
                const val = e.target.value;
                setPrioridad(val);
              }}
            >
              <option value="">— Seleccionar —</option>
              <option value="1">1 (Recomendado)</option>
              <option value="2">2 (Créditos bono)</option>
              <option value="3">3 (Super Ahorro)</option>
              <option value="4">4 (Básico)</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Etiqueta visual
            <select
              className="input-field w-full"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
            >
              <option value="">— Ninguna —</option>
              {tags.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          {prioridad === '2' && (
            <label className="block text-sm font-medium">
              Créditos promocionales (solo prioridad 2)
              <input
                type="number"
                className="input-field w-full"
                value={freeCredits}
                placeholder="Ej: 3000"
                onChange={(e) => setFreeCredits(e.target.value)}
              />
            </label>
          )}
        </div>
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
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

export default EditPlanModal;
