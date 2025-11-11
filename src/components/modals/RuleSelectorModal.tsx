import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RuleSelectorRule } from '../../types/components';

interface Props {
  onClose: () => void;
  onSelect: (rule: RuleSelectorRule) => void;
}

const RuleSelectorModal: React.FC<Props> = ({ onClose, onSelect }) => {
  const [rules, setRules] = useState<RuleSelectorRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchRules = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get<RuleSelectorRule[]>(`/api/reglas?search=${encodeURIComponent(search)}`);
      setRules(data);
    } catch (err) {
      console.error(err);
      setError('Error obteniendo reglas');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-4">
        <h3 className="text-xl font-semibold">Seleccionar Regla</h3>
        <input
          className="input-field w-full"
          placeholder="Buscar por título o ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="py-4 text-center">Cargando…</p>
        ) : error ? (
          <p className="py-4 text-center text-red-600">{error}</p>
        ) : (
          <div className="h-80 overflow-y-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Título</th>
                  <th className="px-4 py-2 text-left">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr
                    key={rule._id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => { onSelect(rule); }}
                  >
                    <td className="px-4 py-2 font-mono text-blue-700">{rule.id_regla}</td>
                    <td className="px-4 py-2">{rule.titulo_regla}</td>
                    <td className="px-4 py-2">{rule.categoria || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default RuleSelectorModal; 