import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { RuleSelectorRule } from '../../types/components';

interface Props {
  onClose: () => void;
  onSelect: (rule: RuleSelectorRule) => void;
}

const useRuleSelectorData = (search: string) => {
  const [rules, setRules] = useState<RuleSelectorRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRules = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get<RuleSelectorRule[]>(
        `/api/reglas?search=${encodeURIComponent(search)}`
      );
      setRules(data);
    } catch (err) {
      console.error(err);
      setError('Error obteniendo reglas');
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return { rules, loading, error };
};

const RulesTable: React.FC<{
  rules: RuleSelectorRule[];
  onSelect: (rule: RuleSelectorRule) => void;
}> = ({ rules, onSelect }) => (
  <div className="h-80 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
        <tr>
          <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">ID</th>
          <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Título</th>
          <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Categoría</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule) => (
          <tr
            key={rule._id}
            className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => {
              onSelect(rule);
            }}
          >
            <td className="px-4 py-2 font-mono text-blue-700 dark:text-blue-400">
              {rule.id_regla}
            </td>
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{rule.titulo_regla}</td>
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{rule.categoria || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RuleSelectorContent: React.FC<{
  loading: boolean;
  error: string;
  rules: RuleSelectorRule[];
  onSelect: (rule: RuleSelectorRule) => void;
}> = ({ loading, error, rules, onSelect }) => {
  if (loading) {
    return <p className="py-4 text-center text-gray-700 dark:text-gray-300">Cargando…</p>;
  }
  if (error) {
    return <p className="py-4 text-center text-red-600 dark:text-red-400">{error}</p>;
  }
  return <RulesTable rules={rules} onSelect={onSelect} />;
};

const RuleSelectorModal: React.FC<Props> = ({ onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const { rules, loading, error } = useRuleSelectorData(search);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Seleccionar Regla
        </h3>
        <input
          className="input-field w-full"
          placeholder="Buscar por título o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <RuleSelectorContent loading={loading} error={error} rules={rules} onSelect={onSelect} />
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleSelectorModal;
