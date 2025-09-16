import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import SettingModal, { Setting } from '../components/modals/SettingModal';

const CATEGORY = 'edificabilidad';

const ParametrosEdificabilidadPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Setting | undefined>();

  const fetchSettings = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/settings', { params: { category: CATEGORY } });
    setSettings(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (data: Setting) => {
    if (data._id) {
      await axios.put(`/api/admin/settings/${data._id}`, data);
    } else {
      await axios.post('/api/admin/settings', data);
    }
    setShowModal(false);
    setEditing(undefined);
    fetchSettings();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar parámetro?')) return;
    await axios.delete(`/api/admin/settings/${id}`);
    fetchSettings();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Parámetros de Edificabilidad</h1>
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
                  <td className="px-4 py-2 truncate max-w-xs">{JSON.stringify(s.value)}</td>
                  <td className="px-4 py-2">{s.description}</td>
                  <td className="px-4 py-2 space-x-2 text-right">
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

export default ParametrosEdificabilidadPage; 