import React, { useCallback, useEffect, useState } from 'react';
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

const fetchConstantsByCategory = async (): Promise<Setting[]> => {
  try {
    const { data } = await axios.get<Setting[]>('/api/admin/settings', {
      params: { category: 'troneras' },
    });
    return data || [];
  } catch (e) {
    console.warn('Error buscando con categoría, intentando sin categoría:', e);
    return [];
  }
};

const fetchAllConstants = async (): Promise<Setting[]> => {
  const { data: allSettings } = await axios.get<Setting[]>('/api/admin/settings');
  return (allSettings || []).filter(
    (s) =>
      s.key === 'TRONERA_DEPTH' ||
      s.key === 'MIN_ANGLE_FOR_TRONERA' ||
      s.key === 'MAX_ANGLE_FOR_TRONERA'
  );
};

const buildInitialValues = (constants: Setting[]): { [key: string]: number } => {
  const initialValues: { [key: string]: number } = {};
  constants.forEach((s) => {
    const numValue = typeof s.value === 'number' ? s.value : Number(s.value);
    initialValues[s.key] = isNaN(numValue) ? 0 : numValue;
  });

  if (!initialValues['TRONERA_DEPTH']) initialValues['TRONERA_DEPTH'] = 0;
  if (!initialValues['MIN_ANGLE_FOR_TRONERA']) initialValues['MIN_ANGLE_FOR_TRONERA'] = 0;
  if (!initialValues['MAX_ANGLE_FOR_TRONERA']) initialValues['MAX_ANGLE_FOR_TRONERA'] = 0;

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
  values: { [key: string]: number };
  settings: Setting[];
  editing: boolean;
  setNum: (k: string, v: string) => void;
  getValue: (key: string) => number;
}> = ({ editing, setNum, getValue }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Input
      label="Profundidad tronera (m)"
      type="number"
      step="0.1"
      value={getValue('TRONERA_DEPTH')}
      onChange={(e) => setNum('TRONERA_DEPTH', e.target.value)}
      disabled={!editing}
    />
    <Input
      label="Ángulo mínimo (°)"
      type="number"
      step="1"
      value={getValue('MIN_ANGLE_FOR_TRONERA')}
      onChange={(e) => setNum('MIN_ANGLE_FOR_TRONERA', e.target.value)}
      disabled={!editing}
    />
    <Input
      label="Ángulo máximo (°)"
      type="number"
      step="1"
      value={getValue('MAX_ANGLE_FOR_TRONERA')}
      onChange={(e) => setNum('MAX_ANGLE_FOR_TRONERA', e.target.value)}
      disabled={!editing}
    />
  </div>
);

const StatusMessage: React.FC<{ saved: null | 'ok' | 'err' }> = ({ saved }) => {
  if (saved === 'ok') {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-400">
          Constantes guardadas correctamente
        </p>
      </div>
    );
  }
  if (saved === 'err') {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-400">Error guardando constantes</p>
      </div>
    );
  }
  return null;
};

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
  const [saved, setSaved] = useState<null | 'ok' | 'err'>(null);
  const [values, setValues] = useState<{ [key: string]: number }>({});

  return {
    settings,
    setSettings,
    editing,
    setEditing,
    saving,
    setSaving,
    loading,
    setLoading,
    saved,
    setSaved,
    values,
    setValues,
  };
};

const useConstantsData = (
  setSettings: React.Dispatch<React.SetStateAction<Setting[]>>,
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  setLoading: (loading: boolean) => void,
  setSaved: (saved: null | 'ok' | 'err') => void
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
      setSaved('err');
    } finally {
      setLoading(false);
    }
  }, [setSettings, setValues, setLoading, setSaved]);

  useEffect(() => {
    void fetchConstants();
  }, [fetchConstants]);

  return { fetchConstants };
};

const createUpdatePromises = (
  values: { [key: string]: number },
  settings: Setting[]
): Promise<unknown>[] =>
  Object.keys(values)
    .map((key) => {
      const setting = settings.find((s) => s.key === key);
      if (!setting) return null;
      const settingValue = Reflect.get(values, key);
      return axios.put(`/api/admin/settings/${setting._id}`, {
        value: settingValue,
        key: setting.key,
        category: setting.category || 'troneras',
      });
    })
    .filter(Boolean) as Promise<unknown>[];

const useSaveConstants = (
  values: { [key: string]: number },
  settings: Setting[],
  setSaving: (saving: boolean) => void,
  setSaved: (saved: null | 'ok' | 'err') => void,
  setEditing: (editing: boolean) => void,
  fetchConstants: () => Promise<void>
) => {
  const save = useCallback(async () => {
    setSaving(true);
    setSaved(null);
    try {
      const updates = createUpdatePromises(values, settings);
      await Promise.all(updates);
      setSaved('ok');
      setEditing(false);
      setTimeout(() => {
        setSaved(null);
        void fetchConstants();
      }, 2500);
    } catch (e) {
      console.error('Error guardando constantes:', e);
      setSaved('err');
      setTimeout(() => setSaved(null), 3000);
    } finally {
      setSaving(false);
    }
  }, [values, settings, setSaving, setSaved, setEditing, fetchConstants]);

  return { save };
};

const createSetNum = (
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
) => {
  return (k: string, v: string) => {
    setValues((prev: Record<string, number>) => ({ ...prev, [k]: Number(v) || 0 }));
  };
};

const createGetValue = (values: { [key: string]: number }, settings: Setting[]) => {
  return (key: string): number => {
    const value = Reflect.get(values, key);
    if (value !== undefined) {
      return value;
    }
    const setting = settings.find((s) => s.key === key);
    if (setting) {
      const numValue = typeof setting.value === 'number' ? setting.value : Number(setting.value);
      return isNaN(numValue) ? 0 : numValue;
    }
    return 0;
  };
};

const ConstantesTronerasPage: React.FC = () => {
  const { user } = useAuth();
  const state = useConstantsState();
  const isSuperAdmin = user?.isSuperAdmin === true;

  const { fetchConstants } = useConstantsData(
    state.setSettings,
    state.setValues,
    state.setLoading,
    state.setSaved
  );

  const { save } = useSaveConstants(
    state.values,
    state.settings,
    state.setSaving,
    state.setSaved,
    state.setEditing,
    fetchConstants
  );

  const setNum = createSetNum(state.setValues);
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
          />
          <StatusMessage saved={state.saved} />
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
