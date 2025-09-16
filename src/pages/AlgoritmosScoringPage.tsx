import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import SettingModal, { Setting } from '../components/modals/SettingModal';

const CATEGORY = 'scoring';

const AlgoritmosScoringPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Setting | undefined>();

  const fetchAll = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/settings', { params: { category: CATEGORY } });
    setSettings(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async (data: Setting) => {
    if (data._id) {
      await axios.put(`/api/admin/settings/${data._id}`, data);
    } else {
      await axios.post('/api/admin/settings', data);
    }
    setShowModal(false);
    setEditing(undefined);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar peso?')) return;
    await axios.delete(`/api/admin/settings/${id}`);
    fetchAll();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Algoritmos y Scoring de Datos</h1>
        <button className="btn-primary" onClick={() => { setEditing(undefined); setShowModal(true); }}>Nuevo</button>
      </div>
      <Card>
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Clave</th>
                <th className="px-4 py-2 text-left">Valor</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s._id} className="odd:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{s.key}</td>
                  <td className="px-4 py-2">{JSON.stringify(s.value)}</td>
                  <td className="px-4 py-2">{s.description}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button className="text-blue-600 text-xs" onClick={() => { setEditing(s); setShowModal(true); }}>Editar</button>
                    <button className="text-red-600 text-xs" onClick={() => handleDelete(s._id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <SettingModal
          initial={editing}
          category={CATEGORY}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AlgoritmosScoringPage; 