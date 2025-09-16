import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import NewItemButton from '../components/NewItemButton';
import NewCodigoModal from '../components/modals/NewCodigoModal';
import NewPrecioModal from '../components/modals/NewPrecioModal';
import axios from 'axios';

interface Codigo { _id: string; codigo: string; descripcion: string }
interface Precio { _id: string; barrio: string; valor: number }

const ContenidoPage: React.FC = () => {
  const [tab, setTab] = useState<'codigos' | 'precios'>('codigos');
  const [codigos, setCodigos] = useState<Codigo[]>([]);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [showPrecioModal, setShowPrecioModal] = useState(false);

  const reload = async () => {
    if (tab === 'codigos') {
      const res = await axios.get('/api/admin/content/codigos');
      setCodigos(res.data);
    } else {
      const res = await axios.get('/api/admin/content/precios');
      setPrecios(res.data);
    }
  };

  useEffect(() => {
    reload();
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <button className={`btn-primary ${tab === 'codigos' ? '' : 'opacity-50'}`} onClick={() => setTab('codigos')}>Códigos</button>
        <button className={`btn-primary ${tab === 'precios' ? '' : 'opacity-50'}`} onClick={() => setTab('precios')}>Precios m²</button>
      </div>

      {tab === 'codigos' && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Códigos Urbanísticos</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {codigos.map(c => (
                <tr key={c._id}>
                  <td className="px-4 py-2">{c.codigo}</td>
                  <td className="px-4 py-2">{c.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <NewItemButton label="+ Nuevo código" onClick={() => setShowCodigoModal(true)} />
          </div>
        </Card>
      )}

      {tab === 'precios' && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Precios por m²</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Barrio</th>
                <th className="px-4 py-2 text-left">Valor USD</th>
              </tr>
            </thead>
            <tbody>
              {precios.map(p => (
                <tr key={p._id}>
                  <td className="px-4 py-2">{p.barrio}</td>
                  <td className="px-4 py-2">{p.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <NewItemButton label="+ Nuevo precio" onClick={() => setShowPrecioModal(true)} />
          </div>
        </Card>
      )}

      {showCodigoModal && (
        <NewCodigoModal
          onClose={() => setShowCodigoModal(false)}
          onSave={async (payload: any) => {
            await axios.post('/api/admin/content/codigos', payload);
            setShowCodigoModal(false);
            reload();
          }}
        />
      )}

      {showPrecioModal && (
        <NewPrecioModal
          onClose={() => setShowPrecioModal(false)}
          onSave={async (payload: any) => {
            await axios.post('/api/admin/content/precios', payload);
            setShowPrecioModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default ContenidoPage; 