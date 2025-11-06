import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewItemButton from '../components/NewItemButton';
import EditIconButton from '../components/EditIconButton';
import DeleteIconButton from '../components/DeleteIconButton';
import ConfirmModal from '../components/ConfirmModal';
import EditReglaLogicaModal from '../components/modals/EditReglaLogicaModal';

interface Regla { _id?:string; id_paso?:string; distrito_cpu:string; condicion_json:any; formula_json:any; id_cu_referencia?:string|string[]; descripcion?:string; activo?:boolean; }
interface Paso { _id:string; nombre_paso:string; }

const ReglasLogicasPage:React.FC = () => {
  const [reglas,setReglas]=useState<Regla[]>([]);
  const [pasos,setPasos]=useState<Paso[]>([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState<Set<string>>(new Set());
  const [showModal,setShowModal]=useState(false);
  const [editing,setEditing]=useState<Regla|null>(null);
  const [toDelete,setToDelete]=useState<Regla|null>(null);

  const fetchAll=async()=>{
    setLoading(true);
    try{
      const [{data:reglasData},{data:pasosData}] = await Promise.all([
        axios.get<Regla[]>('/admin/reglas-logicas'), axios.get<Paso[]>('/admin/calculo-pasos')
      ]);
      setReglas(reglasData); setPasos(pasosData);
    }catch(e){console.error(e);} setLoading(false);
  };
  useEffect(()=>{fetchAll();},[]);

  const handleSave=async(r:Regla)=>{
    try{
      if(editing&&editing._id) await axios.put(`/admin/reglas-logicas/${editing._id}`,r);
      else await axios.post('/admin/reglas-logicas',r);
      setShowModal(false); setEditing(null); fetchAll();
    }catch(e){console.error(e); alert('Error');}
  };
  const handleDelete=async()=>{
    if(!toDelete?._id) return; try{await axios.delete(`/admin/reglas-logicas/${toDelete._id}`); setToDelete(null); fetchAll();}catch(e){console.error(e);} };

  const pasoNombre=(id?:string)=>pasos.find(p=>p._id===id)?.nombre_paso||'';

  const toggleSel=(id:string)=>setSelected(prev=>{const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s;});
  const allChecked=reglas.length>0 && selected.size===reglas.length;
  const toggleAll=()=>{ if(allChecked) setSelected(new Set()); else setSelected(new Set(reglas.map(r=>r._id!))); };
  const batch=async(accion:'aceptar'|'rechazar')=>{
    try{await axios.post('/admin/reglas-logicas/batch',{ids:Array.from(selected),accion}); setSelected(new Set()); fetchAll();}catch(e){alert('Error');}
  };

  return(<div className="p-6 space-y-4">
    <div className="flex gap-4">
      <button className="btn-primary" disabled={!selected.size} onClick={()=>batch('aceptar')}>Aceptar seleccionadas</button>
      <button className="btn-danger" disabled={!selected.size} onClick={()=>batch('rechazar')}>Rechazar seleccionadas</button>
    </div>
    <div className="flex justify-between items-center"><h1 className="text-2xl font-semibold">Reglas Lógicas</h1><NewItemButton label="Nueva" onClick={()=>setShowModal(true)} /></div>{loading? <p>Cargando…</p> :(<div className="overflow-x-auto"><table className="min-w-full border bg-white shadow"><thead className="bg-gray-100"><tr><th className="px-2"><input type="checkbox" checked={allChecked} onChange={toggleAll}/></th><th className="px-4 py-2">Paso</th><th className="px-4 py-2">Distrito</th><th className="px-4 py-2">Ref CU</th><th className="px-4 py-2">Activo</th><th className="px-4 py-2">Acciones</th></tr></thead><tbody>{reglas.map(r=> (<tr key={r._id} className="border-t"><td className="px-2 text-center"><input type="checkbox" checked={selected.has(r._id!)} onChange={()=>toggleSel(r._id!)}/></td><td className="px-4 py-2">{pasoNombre(r.id_paso)}</td><td className="px-4 py-2">{r.distrito_cpu}</td><td className="px-4 py-2">{(Array.isArray(r.id_cu_referencia)? r.id_cu_referencia : (r.id_cu_referencia? [r.id_cu_referencia]:[])).join(', ')}</td><td className="px-4 py-2 text-center">{r.activo?'✓':'—'}</td><td className="px-4 py-2 flex gap-2 justify-center"><EditIconButton onClick={()=>{setEditing(r);setShowModal(true);}}/><DeleteIconButton onClick={()=>setToDelete(r)} /></td></tr>))}</tbody></table></div>)}{showModal&& (<EditReglaLogicaModal show={showModal} onClose={()=>{setShowModal(false);setEditing(null);}} onSave={handleSave} editing={editing as any} pasos={pasos} />)}{toDelete&& (<ConfirmModal open={true} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} title="Eliminar" message="¿Eliminar regla?"/>)} </div>);
};
export default ReglasLogicasPage;
