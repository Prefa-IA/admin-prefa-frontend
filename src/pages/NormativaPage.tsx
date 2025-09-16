import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import NewItemButton from '../components/NewItemButton';
import NewTipologiaModal from '../components/modals/NewTipologiaModal';
import NewZonificacionModal from '../components/modals/NewZonificacionModal';
import axios from 'axios';

interface Tipologia { _id:string; etiqueta:string; alturaMin:number; alturaMax:number }
interface Zonificacion { _id:string; codigo:string; nombre:string; alturaMax:number }

const NormativaPage: React.FC = () => {
  const [tab,setTab]=useState<'tipologias'|'zonificaciones'>('tipologias');
  const [tipos,setTipos]=useState<Tipologia[]>([]);
  const [zonis,setZonis]=useState<Zonificacion[]>([]);
  const [showTipModal,setShowTipModal]=useState(false);
  const [showZoniModal,setShowZoniModal]=useState(false);

  const reload = async () => {
    if (tab === 'tipologias') {
      const res = await axios.get('/api/admin/parametros/tipologias');
      setTipos(res.data);
    } else {
      const res = await axios.get('/api/admin/parametros/zonificaciones');
      setZonis(res.data);
    }
  };

  useEffect(()=>{ reload(); },[tab]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <button className={`btn-primary ${tab==='tipologias'?'':'opacity-50'}`} onClick={()=>setTab('tipologias')}>Tipologías</button>
        <button className={`btn-primary ${tab==='zonificaciones'?'':'opacity-50'}`} onClick={()=>setTab('zonificaciones')}>Zonificaciones</button>
      </div>

      {tab==='tipologias' && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Tipologías</h3>
          <table className="min-w-full text-sm">
            <thead><tr><th className="px-4 py-2 text-left">Etiqueta</th><th className="px-4 py-2 text-left">Altura (m)</th></tr></thead>
            <tbody>
              {tipos.map(t=>(
                <tr key={t._id}><td className="px-4 py-2">{t.etiqueta}</td><td className="px-4 py-2">{t.alturaMin} – {t.alturaMax}</td></tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <NewItemButton label="+ Nueva tipología" onClick={() => setShowTipModal(true)} />
          </div>
        </Card>
      )}

      {tab==='zonificaciones' && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Zonificaciones</h3>
          <table className="min-w-full text-sm"><thead><tr><th className="px-4 py-2 text-left">Código</th><th className="px-4 py-2 text-left">Nombre</th><th className="px-4 py-2 text-left">Altura Máx</th></tr></thead>
            <tbody>
              {zonis.map(z=>(
                <tr key={z._id}><td className="px-4 py-2">{z.codigo}</td><td className="px-4 py-2">{z.nombre}</td><td className="px-4 py-2">{z.alturaMax}</td></tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <NewItemButton label="+ Nueva zonificación" onClick={() => setShowZoniModal(true)} />
          </div>
        </Card>
      )}

      {showTipModal && (
        <NewTipologiaModal
          onClose={() => setShowTipModal(false)}
          onSave={async (payload: any) => {
            await axios.post('/api/admin/parametros/tipologias', payload);
            setShowTipModal(false);
            reload();
          }}
        />
      )}

      {showZoniModal && (
        <NewZonificacionModal
          onClose={() => setShowZoniModal(false)}
          onSave={async (payload: any) => {
            await axios.post('/api/admin/parametros/zonificaciones', payload);
            setShowZoniModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default NormativaPage; 