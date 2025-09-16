import React, { useEffect, useState, useCallback } from 'react';

const ConstantesTronerasPage: React.FC = () => {
  const [values, setValues] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<null | 'ok' | 'err'>(null);
  // Usar gateway como frontdoor y enrutar a mapdata-ms
  const gwBase = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/$/, '');
  const base = `${gwBase}/mapdata`;

  const authHeaders = (): Record<string, string> => {
    // El AuthContext guarda { token } en localStorage bajo 'adminUser'
    try {
      const raw = localStorage.getItem('adminUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return { Authorization: `Bearer ${parsed.token}` };
      }
    } catch {}
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchConstants = useCallback(async () => {
    const res = await fetch(`${base}/config/constants`, { headers: { ...authHeaders() } });
    const data = await res.json();
    setValues(data || {});
  }, [base]);

  useEffect(() => { fetchConstants(); }, [fetchConstants]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${base}/config/constants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setValues(data);
      setSaved('ok');
      setTimeout(()=>setSaved(null), 2500);
    } catch (e) {
      setSaved('err');
      setTimeout(()=>setSaved(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const setNum = (k: string, v: string) => setValues((prev: any) => ({ ...prev, [k]: Number(v) }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Constantes de Troneras / LFI-LIB</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium">Profundidad tronera (m)</label>
          <input className="input-field w-full" type="number" step="0.1"
            value={values.TRONERA_DEPTH ?? ''}
            onChange={e=>setNum('TRONERA_DEPTH', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Ángulo mínimo (°)</label>
          <input className="input-field w-full" type="number" step="1"
            value={values.MIN_ANGLE_FOR_TRONERA ?? ''}
            onChange={e=>setNum('MIN_ANGLE_FOR_TRONERA', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Ángulo máximo (°)</label>
          <input className="input-field w-full" type="number" step="1"
            value={values.MAX_ANGLE_FOR_TRONERA ?? ''}
            onChange={e=>setNum('MAX_ANGLE_FOR_TRONERA', e.target.value)} />
        </div>
      </div>
      {saved === 'ok' && (
        <div className="text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2 inline-block">Constantes guardadas</div>
      )}
      {saved === 'err' && (
        <div className="text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2 inline-block">Error guardando constantes</div>
      )}
      <div className="pt-2">
        <button className="btn-primary px-6 py-2" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default ConstantesTronerasPage;


