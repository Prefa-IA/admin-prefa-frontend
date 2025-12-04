import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

import { Button, Card, Input, PageHeader } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

interface Setting {
  _id: string;
  key: string;
  value: number;
  category?: string;
}

const CATEGORY_TRONERAS = 'troneras';
const API_SETTINGS_ENDPOINT = '/api/admin/settings';

const fetchConstantsByCategory = async (): Promise<Setting[]> => {
  try {
    const { data } = await axios.get<Setting[]>(API_SETTINGS_ENDPOINT, {
      params: { category: CATEGORY_TRONERAS },
    });
    return data || [];
  } catch (e) {
    console.warn('Error buscando con categoría, intentando sin categoría:', e);
    return [];
  }
};

const fetchAllConstants = async (): Promise<Setting[]> => {
  const { data: allSettings } = await axios.get<Setting[]>(API_SETTINGS_ENDPOINT);
  return (allSettings || []).filter(
    (s) =>
      s.key === 'TRONERA_DEPTH' ||
      s.key === 'MIN_ANGLE_FOR_TRONERA' ||
      s.key === 'MAX_ANGLE_FOR_TRONERA' ||
      s.key === 'CODIGO_URBANISTICO_EDICION'
  );
};

const formatDateForInput = (value: string | number | Date | null | undefined): string => {
  if (!value) return '';
  if (value instanceof Date) {
    const isoString = value.toISOString();
    return isoString.split('T')[0] || '';
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const isoString = date.toISOString();
      return isoString.split('T')[0] || '';
    }
    return value;
  }
  return '';
};

const buildInitialValues = (constants: Setting[]): { [key: string]: number | string } => {
  const initialValues: { [key: string]: number | string } = {};
  constants.forEach((s) => {
    if (s.key === 'CODIGO_URBANISTICO_EDICION') {
      initialValues[s.key] = formatDateForInput(s.value);
    } else {
      const numValue = typeof s.value === 'number' ? s.value : Number(s.value);
      initialValues[s.key] = isNaN(numValue) ? 0 : numValue;
    }
  });

  if (!initialValues['TRONERA_DEPTH']) initialValues['TRONERA_DEPTH'] = 0;
  if (!initialValues['MIN_ANGLE_FOR_TRONERA']) initialValues['MIN_ANGLE_FOR_TRONERA'] = 0;
  if (!initialValues['MAX_ANGLE_FOR_TRONERA']) initialValues['MAX_ANGLE_FOR_TRONERA'] = 0;
  if (!initialValues['CODIGO_URBANISTICO_EDICION'])
    initialValues['CODIGO_URBANISTICO_EDICION'] = '';

  return initialValues;
};

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando constantes...</p>
    </div>
  </div>
);

const ConstantsInputs: React.FC<{
  values: { [key: string]: number | string };
  settings: Setting[];
  editing: boolean;
  setNum: (k: string, v: string) => void;
  getValue: (key: string) => number | string;
  setString: (k: string, v: string) => void;
}> = ({ editing, setNum, getValue, setString }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Variables</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Profundidad tronera (m)"
          type="number"
          step="0.1"
          value={getValue('TRONERA_DEPTH') as number}
          onChange={(e) => setNum('TRONERA_DEPTH', e.target.value)}
          disabled={!editing}
        />
        <Input
          label="Ángulo mínimo (°)"
          type="number"
          step="1"
          value={getValue('MIN_ANGLE_FOR_TRONERA') as number}
          onChange={(e) => setNum('MIN_ANGLE_FOR_TRONERA', e.target.value)}
          disabled={!editing}
        />
        <Input
          label="Ángulo máximo (°)"
          type="number"
          step="1"
          value={getValue('MAX_ANGLE_FOR_TRONERA') as number}
          onChange={(e) => setNum('MAX_ANGLE_FOR_TRONERA', e.target.value)}
          disabled={!editing}
        />
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Version codigo urbanistico
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Input
          label="Edición del Código Urbanístico"
          type="date"
          value={getValue('CODIGO_URBANISTICO_EDICION') as string}
          onChange={(e) => setString('CODIGO_URBANISTICO_EDICION', e.target.value)}
          disabled={!editing}
        />
      </div>
    </div>
  </div>
);

const EditActions: React.FC<{
  editing: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}> = ({ editing, saving, onCancel, onSave }) => {
  if (!editing) return null;
  return (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onCancel} disabled={saving}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
        Guardar
      </Button>
    </div>
  );
};

const useConstantsState = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<{ [key: string]: number | string }>({});

  return {
    settings,
    setSettings,
    editing,
    setEditing,
    saving,
    setSaving,
    loading,
    setLoading,
    values,
    setValues,
  };
};

const useConstantsData = (
  setSettings: React.Dispatch<React.SetStateAction<Setting[]>>,
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number | string }>>,
  setLoading: (loading: boolean) => void
) => {
  const fetchConstants = useCallback(async () => {
    setLoading(true);
    try {
      const initialConstants = await fetchConstantsByCategory();
      const constants =
        initialConstants.length === 0 ? await fetchAllConstants() : initialConstants;

      setSettings(constants);
      const initialValues = buildInitialValues(constants);
      setValues(initialValues);
    } catch (err: unknown) {
      console.error('Error al cargar constantes:', err);
      toast.error('Error al cargar constantes');
    } finally {
      setLoading(false);
    }
  }, [setSettings, setValues, setLoading]);

  useEffect(() => {
    void fetchConstants();
  }, [fetchConstants]);

  return { fetchConstants };
};

const createUpdatePromises = (
  values: { [key: string]: number | string },
  settings: Setting[]
): Promise<unknown>[] =>
  Object.keys(values)
    .map((key) => {
      const setting = settings.find((s) => s.key === key);
      const settingValue = Reflect.get(values, key);
      if (setting) {
        return axios.put(`${API_SETTINGS_ENDPOINT}/${setting._id}`, {
          value: settingValue,
          key: setting.key,
          category: setting.category || CATEGORY_TRONERAS,
        });
      }
      if (key === 'CODIGO_URBANISTICO_EDICION') {
        return axios.post(API_SETTINGS_ENDPOINT, {
          key,
          value: settingValue,
          category: CATEGORY_TRONERAS,
        });
      }
      return null;
    })
    .filter(Boolean) as Promise<unknown>[];

const useSaveConstants = (
  values: { [key: string]: number | string },
  settings: Setting[],
  setSaving: (saving: boolean) => void,
  setEditing: (editing: boolean) => void,
  fetchConstants: () => Promise<void>
) => {
  const save = useCallback(async () => {
    for (const [key, value] of Object.entries(values)) {
      if (value === '' || value === null || value === undefined) {
        toast.error(`El valor para "${key}" no puede estar vacío`);
        return;
      }
      const numValue = Number(value);
      if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
        toast.error(`El valor para "${key}" debe ser un número válido`);
        return;
      }
      if (numValue < 0) {
        toast.error(`El valor para "${key}" no puede ser negativo`);
        return;
      }
    }

    setSaving(true);
    try {
      const updates = createUpdatePromises(values, settings);
      await Promise.all(updates);
      toast.success('Constantes guardadas correctamente');
      setEditing(false);
      void fetchConstants();
    } catch (e) {
      console.error('Error guardando constantes:', e);
      const errorMessage =
        (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ||
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error guardando constantes';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [values, settings, setSaving, setEditing, fetchConstants]);

  return { save };
};

const createSetNum = (
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number | string }>>
) => {
  return (k: string, v: string) => {
    setValues((prev: Record<string, number | string>) => ({ ...prev, [k]: Number(v) || 0 }));
  };
};

const createSetString = (
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number | string }>>
) => {
  return (k: string, v: string) => {
    setValues((prev: Record<string, number | string>) => ({ ...prev, [k]: v }));
  };
};

const createGetValue = (values: { [key: string]: number | string }, settings: Setting[]) => {
  return (key: string): number | string => {
    const value = Reflect.get(values, key);
    if (value !== undefined) {
      return value;
    }
    const setting = settings.find((s) => s.key === key);
    if (setting) {
      if (key === 'CODIGO_URBANISTICO_EDICION') {
        return formatDateForInput(setting.value);
      }
      const numValue = typeof setting.value === 'number' ? setting.value : Number(setting.value);
      return isNaN(numValue) ? 0 : numValue;
    }
    return key === 'CODIGO_URBANISTICO_EDICION' ? '' : 0;
  };
};

const ConstantesTronerasPage: React.FC = () => {
  const { user } = useAuth();
  const state = useConstantsState();
  const isSuperAdmin = user?.isSuperAdmin === true;

  const { fetchConstants } = useConstantsData(state.setSettings, state.setValues, state.setLoading);

  const { save } = useSaveConstants(
    state.values,
    state.settings,
    state.setSaving,
    state.setEditing,
    fetchConstants
  );

  const setNum = createSetNum(state.setValues);
  const setString = createSetString(state.setValues);
  const getValue = createGetValue(state.values, state.settings);

  if (state.loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Constantes de Troneras / LFI-LIB"
        description="Configura las constantes para el cálculo de troneras y LFI-LIB"
        actions={
          isSuperAdmin && !state.editing ? (
            <Button
              variant="secondary"
              onClick={() => state.setEditing(true)}
              className="flex items-center gap-2"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Editar
            </Button>
          ) : null
        }
      />

      <Card>
        <div className="space-y-6">
          <ConstantsInputs
            values={state.values}
            settings={state.settings}
            editing={state.editing}
            setNum={setNum}
            getValue={getValue}
            setString={setString}
          />
          <EditActions
            editing={state.editing}
            saving={state.saving}
            onCancel={() => {
              state.setEditing(false);
              void fetchConstants();
            }}
            onSave={() => {
              void save();
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ConstantesTronerasPage;
