import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader, Card, Input, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface Setting {
  _id: string;
  key: string;
  value: number;
  category?: string;
}

const ConstantesTronerasPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<null | 'ok' | 'err'>(null);
  const [values, setValues] = useState<{ [key: string]: number }>({});

  const isSuperAdmin = user?.email === 'prefaia@admin.com';

  const fetchConstants = async () => {
    setLoading(true);
    try {
      let constants: Setting[] = [];
      try {
        const { data } = await axios.get<Setting[]>('/api/admin/settings', {
          params: { category: 'troneras' }
        });
        constants = data || [];
      } catch (e) {
        console.warn('Error buscando con categoría, intentando sin categoría:', e);
      }
      
      if (!constants || constants.length === 0) {
        const { data: allSettings } = await axios.get<Setting[]>('/api/admin/settings');
        constants = (allSettings || []).filter(s => 
          s.key === 'TRONERA_DEPTH' || 
          s.key === 'MIN_ANGLE_FOR_TRONERA' || 
          s.key === 'MAX_ANGLE_FOR_TRONERA'
        );
      }
      
      setSettings(constants);
      const initialValues: { [key: string]: number } = {};
      constants.forEach(s => {
        const numValue = typeof s.value === 'number' ? s.value : Number(s.value);
        initialValues[s.key] = isNaN(numValue) ? 0 : numValue;
      });
      
      if (!initialValues['TRONERA_DEPTH']) initialValues['TRONERA_DEPTH'] = 0;
      if (!initialValues['MIN_ANGLE_FOR_TRONERA']) initialValues['MIN_ANGLE_FOR_TRONERA'] = 0;
      if (!initialValues['MAX_ANGLE_FOR_TRONERA']) initialValues['MAX_ANGLE_FOR_TRONERA'] = 0;
      
      setValues(initialValues);
    } catch (err: any) {
      console.error('Error al cargar constantes:', err);
      setSaved('err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConstants();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(null);
    try {
      const updates = Object.keys(values).map(key => {
        const setting = settings.find(s => s.key === key);
        if (!setting) return null;
        return axios.put(`/api/admin/settings/${setting._id}`, {
          value: values[key],
          key: setting.key,
          category: setting.category || 'troneras'
        });
      }).filter(Boolean);

      await Promise.all(updates);
      setSaved('ok');
      setEditing(false);
      setTimeout(() => {
        setSaved(null);
        fetchConstants();
      }, 2500);
    } catch (e) {
      console.error('Error guardando constantes:', e);
      setSaved('err');
      setTimeout(() => setSaved(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const setNum = (k: string, v: string) => {
    setValues((prev: any) => ({ ...prev, [k]: Number(v) || 0 }));
  };

  const getValue = (key: string): number => {
    if (values[key] !== undefined) {
      return values[key];
    }
    const setting = settings.find(s => s.key === key);
    if (setting) {
      const numValue = typeof setting.value === 'number' ? setting.value : Number(setting.value);
      return isNaN(numValue) ? 0 : numValue;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando constantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Constantes de Troneras / LFI-LIB"
        description="Configura las constantes para el cálculo de troneras y LFI-LIB"
        actions={
          isSuperAdmin && !editing ? (
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
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

          {saved === 'ok' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">Constantes guardadas correctamente</p>
            </div>
          )}
          {saved === 'err' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">Error guardando constantes</p>
            </div>
          )}

          {editing && (
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  fetchConstants();
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={save} disabled={saving} isLoading={saving}>
                Guardar
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ConstantesTronerasPage;


