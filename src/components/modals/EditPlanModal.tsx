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

const usePlanTags = () => {
  const [tags, setTags] = useState<PlanTag[]>([]);
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
  return tags;
};

const usePlanFormState = (plan: Partial<Plan> & { id?: string }) => {
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
  const [isOverage] = useState<boolean>(plan.isOverage ?? false);
  const [parentPlan] = useState<string>(plan.parentPlan || '');
  const [tagId, setTagId] = useState<string>(getInitialTagId(plan.tag));
  const [showSticker, setShowSticker] = useState<boolean>(plan.showDiscountSticker !== false);
  const [freeCredits, setFreeCredits] = useState<string>(
    plan.freeCredits !== undefined ? String(plan.freeCredits) : ''
  );

  return {
    isNew,
    id,
    setId,
    name,
    setName,
    price,
    setPrice,
    creditosTotales,
    setCreditosTotales,
    permiteCompuestas,
    setPermiteCompuestas,
    wmOrg,
    setWmOrg,
    wmPrefas,
    setWmPrefas,
    discountPct,
    setDiscountPct,
    discountUntil,
    setDiscountUntil,
    prioridad,
    setPrioridad,
    isOverage,
    parentPlan,
    tagId,
    setTagId,
    showSticker,
    setShowSticker,
    freeCredits,
    setFreeCredits,
  };
};

const validatePlanForm = (
  prioridad: string,
  freeCredits: string,
  selectedTag: PlanTag | undefined,
  setErrorMsg: (msg: string) => void
): boolean => {
  if (prioridad === '2' && Number(freeCredits) <= 0) {
    setErrorMsg('Debes ingresar créditos promocionales > 0 para prioridad 2');
    return false;
  }
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

const buildPlanPayload = (
  plan: Partial<Plan> & { id?: string },
  formState: ReturnType<typeof usePlanFormState>
): PlanPayload => {
  const {
    id,
    name,
    price,
    creditosTotales,
    freeCredits,
    permiteCompuestas,
    wmOrg,
    wmPrefas,
    discountPct,
    discountUntil,
    prioridad,
    tagId,
    showSticker,
    isOverage,
    parentPlan,
  } = formState;
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

const PlanBasicFields: React.FC<{
  plan: Partial<Plan> & { id?: string };
  formState: ReturnType<typeof usePlanFormState>;
}> = ({ plan, formState }) => (
  <>
    {!plan.id && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        ID único
        <input
          className="input-field w-full"
          value={formState.id}
          onChange={(e) => formState.setId(e.target.value)}
        />
      </label>
    )}
    <label className="block text-sm font-medium md:col-span-2 text-gray-700 dark:text-gray-300">
      Nombre
      <input
        className="input-field w-full"
        value={formState.name}
        onChange={(e) => formState.setName(e.target.value)}
      />
    </label>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Precio (ARS)
      <input
        type="number"
        className="input-field w-full"
        value={formState.price}
        placeholder="Ej: 210000"
        onChange={(e) => formState.setPrice(e.target.value)}
      />
    </label>
    <label className="block text-sm font-medium md:col-span-2 text-gray-700 dark:text-gray-300">
      Créditos totales del plan
      <input
        type="number"
        className="input-field w-full"
        value={formState.creditosTotales}
        placeholder="Ej: 1800"
        onChange={(e) => formState.setCreditosTotales(e.target.value)}
      />
    </label>
  </>
);

const PlanCheckboxes: React.FC<{ formState: ReturnType<typeof usePlanFormState> }> = ({
  formState,
}) => (
  <div className="md:col-span-2 flex flex-col space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={formState.permiteCompuestas}
        onChange={(e) => formState.setPermiteCompuestas(e.target.checked)}
        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
      />
      <span>Permite prefactibilidades compuestas</span>
    </label>
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={formState.wmOrg}
        onChange={(e) => formState.setWmOrg(e.target.checked)}
        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
      />
      <span>Marca de agua organización</span>
    </label>
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={formState.wmPrefas}
        onChange={(e) => formState.setWmPrefas(e.target.checked)}
        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
      />
      <span>Marca de agua PreFac</span>
    </label>
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={formState.showSticker}
        onChange={(e) => formState.setShowSticker(e.target.checked)}
        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
      />
      <span>Mostrar etiqueta de descuento en esquina</span>
    </label>
  </div>
);

const PlanDiscountFields: React.FC<{ formState: ReturnType<typeof usePlanFormState> }> = ({
  formState,
}) => (
  <>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Descuento %
      <input
        type="number"
        className="input-field w-full"
        value={formState.discountPct}
        placeholder="Ej: 10"
        onChange={(e) => formState.setDiscountPct(e.target.value)}
      />
    </label>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Descuento hasta (YYYY-MM-DD)
      <input
        type="date"
        className="input-field w-full"
        value={formState.discountUntil?.substring(0, 10) || ''}
        onChange={(e) => formState.setDiscountUntil(e.target.value)}
      />
    </label>
  </>
);

const PlanPriorityFields: React.FC<{
  formState: ReturnType<typeof usePlanFormState>;
  tags: ReturnType<typeof usePlanTags>;
}> = ({ formState, tags }) => (
  <>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Prioridad
      <select
        className="input-field w-full"
        value={formState.prioridad}
        onChange={(e) => formState.setPrioridad(e.target.value)}
      >
        <option value="">— Seleccionar —</option>
        <option value="1">1 (Recomendado)</option>
        <option value="2">2 (Créditos bono)</option>
        <option value="3">3 (Super Ahorro)</option>
        <option value="4">4 (Básico)</option>
      </select>
    </label>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Etiqueta visual
      <select
        className="input-field w-full"
        value={formState.tagId}
        onChange={(e) => formState.setTagId(e.target.value)}
      >
        <option value="">— Ninguna —</option>
        {tags.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
    {formState.prioridad === '2' && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Créditos promocionales (solo prioridad 2)
        <input
          type="number"
          className="input-field w-full"
          value={formState.freeCredits}
          placeholder="Ej: 3000"
          onChange={(e) => formState.setFreeCredits(e.target.value)}
        />
      </label>
    )}
  </>
);

const PlanFormFields: React.FC<{
  plan: Partial<Plan> & { id?: string };
  formState: ReturnType<typeof usePlanFormState>;
  tags: ReturnType<typeof usePlanTags>;
}> = ({ plan, formState, tags }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <PlanBasicFields plan={plan} formState={formState} />
    <PlanCheckboxes formState={formState} />
    <PlanDiscountFields formState={formState} />
    <PlanPriorityFields formState={formState} tags={tags} />
  </div>
);

const EditPlanModal: React.FC<Props> = ({ plan, onClose, onSave }) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const tags = usePlanTags();
  const formState = usePlanFormState(plan);
  const selectedTag = tags.find((t) => t._id === formState.tagId);

  const handleSubmit = () => {
    setErrorMsg('');
    if (!validatePlanForm(formState.prioridad, formState.freeCredits, selectedTag, setErrorMsg)) {
      return;
    }
    const payload = buildPlanPayload(plan, formState);
    onSave(payload as Partial<Plan>);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {plan.id ? 'Editar plan' : 'Nuevo plan'}
        </h3>
        <PlanFormFields plan={plan} formState={formState} tags={tags} />
        {errorMsg && <p className="text-red-600 dark:text-red-400 text-sm">{errorMsg}</p>}
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
