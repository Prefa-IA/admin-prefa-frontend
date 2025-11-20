import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

import { Button, Card, Input, PageHeader } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

interface CreditConfig {
  _id?: string;
  simple: number;
  completa: number;
  compuesta: number;
  basicSearch: number;
  freeSignupCredits: number;
  maxDailyLimit: number;
  maxMonthlyLimit: number;
  maxBalanceLimit: number;
}

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando configuración de créditos...</p>
    </div>
  </div>
);

const CreditCostsInputs: React.FC<{
  config: CreditConfig;
  editing: boolean;
  onChange: (field: keyof CreditConfig, value: number) => void;
}> = ({ config, editing, onChange }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
      Costos de Créditos
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Prefa Simple"
        type="number"
        min="0"
        step="1"
        value={config.simple}
        onChange={(e) => onChange('simple', Number(e.target.value) || 0)}
        disabled={!editing}
      />
      <Input
        label="Prefa Completa"
        type="number"
        min="0"
        step="1"
        value={config.completa}
        onChange={(e) => onChange('completa', Number(e.target.value) || 0)}
        disabled={!editing}
      />
      <Input
        label="Prefa Compuesta"
        type="number"
        min="0"
        step="1"
        value={config.compuesta}
        onChange={(e) => onChange('compuesta', Number(e.target.value) || 0)}
        disabled={!editing}
      />
      <Input
        label="Búsqueda de Dirección"
        type="number"
        min="0"
        step="1"
        value={config.basicSearch}
        onChange={(e) => onChange('basicSearch', Number(e.target.value) || 0)}
        disabled={!editing}
      />
      <Input
        label="Créditos Iniciales (Registro)"
        type="number"
        min="0"
        step="1"
        value={config.freeSignupCredits}
        onChange={(e) => onChange('freeSignupCredits', Number(e.target.value) || 0)}
        disabled={!editing}
      />
    </div>
  </div>
);

const CreditLimitsInputs: React.FC<{
  config: CreditConfig;
  editing: boolean;
  onChange: (field: keyof CreditConfig, value: number) => void;
}> = ({ config, editing, onChange }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Límites</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Input
        label="Límite Diario"
        type="number"
        min="0"
        step="1"
        value={config.maxDailyLimit}
        onChange={(e) => onChange('maxDailyLimit', Number(e.target.value) || 0)}
        disabled={!editing}
      />
      <Input
        label="Límite Mensual"
        type="number"
        min="0"
        step="1"
        value={config.maxMonthlyLimit}
        onChange={(e) => onChange('maxMonthlyLimit', Number(e.target.value) || 0)}
        disabled={!editing}
      />
      <Input
        label="Límite de Balance"
        type="number"
        min="0"
        step="1"
        value={config.maxBalanceLimit}
        onChange={(e) => onChange('maxBalanceLimit', Number(e.target.value) || 0)}
        disabled={!editing}
      />
    </div>
  </div>
);

const CreditInputs: React.FC<{
  config: CreditConfig;
  editing: boolean;
  onChange: (field: keyof CreditConfig, value: number) => void;
}> = ({ config, editing, onChange }) => (
  <div className="space-y-8">
    <CreditCostsInputs config={config} editing={editing} onChange={onChange} />
    <CreditLimitsInputs config={config} editing={editing} onChange={onChange} />
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

const useCreditsConfig = () => {
  const [config, setConfig] = useState<CreditConfig>({
    simple: 100,
    completa: 200,
    compuesta: 300,
    basicSearch: 5,
    freeSignupCredits: 50,
    maxDailyLimit: 5000,
    maxMonthlyLimit: 150_000,
    maxBalanceLimit: 5000,
  });
  const [originalConfig, setOriginalConfig] = useState<CreditConfig>(config);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<CreditConfig>('/api/admin/billing/creditos');
      setConfig(data);
      setOriginalConfig(data);
    } catch (error) {
      console.error('Error cargando configuración de créditos:', error);
      toast.error('Error cargando configuración de créditos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const handleChange = (field: keyof CreditConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { data } = await axios.put<CreditConfig>('/api/admin/billing/creditos', config);
      setConfig(data);
      setOriginalConfig(data);
      setEditing(false);
      toast.success('Configuración de créditos guardada correctamente');
    } catch (error) {
      console.error('Error guardando configuración de créditos:', error);
      toast.error('Error guardando configuración de créditos');
    } finally {
      setSaving(false);
    }
  }, [config]);

  const handleSaveClick = useCallback(() => {
    void handleSave();
  }, [handleSave]);

  const handleCancel = () => {
    setConfig(originalConfig);
    setEditing(false);
  };

  const startEditing = () => {
    setEditing(true);
  };

  return {
    config,
    originalConfig,
    editing,
    saving,
    loading,
    handleChange,
    handleCancel,
    handleSaveClick,
    startEditing,
  };
};

const CreditsConfigPageContent: React.FC<{
  config: CreditConfig;
  editing: boolean;
  saving: boolean;
  isSuperAdmin: boolean;
  onChange: (field: keyof CreditConfig, value: number) => void;
  onCancel: () => void;
  onSave: () => void;
  onStartEditing: () => void;
}> = ({ config, editing, saving, isSuperAdmin, onChange, onCancel, onSave, onStartEditing }) => (
  <div>
    <PageHeader
      title="Configuración de Créditos"
      description="Configura los valores de créditos para prefas simples, completas, compuestas, búsquedas, créditos iniciales de registro y límites diarios/mensuales"
      actions={
        isSuperAdmin && !editing ? (
          <Button variant="secondary" onClick={onStartEditing} className="flex items-center gap-2">
            <PencilSquareIcon className="h-5 w-5" />
            Editar
          </Button>
        ) : null
      }
    />

    <Card>
      <div className="space-y-6">
        <CreditInputs config={config} editing={editing} onChange={onChange} />
        <EditActions editing={editing} saving={saving} onCancel={onCancel} onSave={onSave} />
      </div>
    </Card>
  </div>
);

const CreditsConfigPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;
  const {
    config,
    editing,
    saving,
    loading,
    handleChange,
    handleCancel,
    handleSaveClick,
    startEditing,
  } = useCreditsConfig();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <CreditsConfigPageContent
      config={config}
      editing={editing}
      saving={saving}
      isSuperAdmin={isSuperAdmin}
      onChange={handleChange}
      onCancel={handleCancel}
      onSave={handleSaveClick}
      onStartEditing={startEditing}
    />
  );
};

export default CreditsConfigPage;
