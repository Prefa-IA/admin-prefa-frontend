import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

interface Plan { _id:string; nombre?:string; name?:string; }
interface Usuario { _id:string; email:string; nombre?:string; }

const TEMPLATES = {
  'info-prefas': {
    label: 'Informativo',
    variables: ['announcement_title','main_message','effective_date','details_summary','cta_url','cta_text'],
  },
  'marketing-newsletter': {
    label: 'Marketing',
    variables: ['campaign_title','main_message','main_feature_title','main_feature_description','cta_url','cta_text'],
  },
};

type TemplateKey = keyof typeof TEMPLATES;

const SendNewsletterPage: React.FC = () => {
  const [template, setTemplate] = useState<TemplateKey>('info-prefas');
  const [variables, setVariables] = useState<Record<string,string>>({});
  const [recipientMode, setRecipientMode] = useState<'all'|'plan'|'emails'>('all');
  const [plans,setPlans]=useState<Plan[]>([]);
  const [selectedPlan,setSelectedPlan]=useState<string>('');
  const [users,setUsers]=useState<Usuario[]>([]);
  const [searchUser,setSearchUser]=useState('');
  const [selectedUserIds,setSelectedUserIds]=useState<string[]>([]);
  const [previewHtml,setPreviewHtml]=useState('');
  const [sendAt,setSendAt]=useState('');
  const [history,setHistory]=useState<any[]>([]);
  const [confirmOpen,setConfirmOpen]=useState(false);

  const loadHistory=async()=>{
    try{const {data}=await axios.get('/emails/history?limit=50');setHistory(data.items);}catch(e){console.error(e);}
  };

  useEffect(()=>{loadHistory();},[]);

  // Fetch plans when mode changes to plan
  useEffect(()=>{
    if(recipientMode==='plan' && plans.length===0){
      axios.get('/planes').then(res=>setPlans(res.data||[])).catch(()=>{});
    }
    if(recipientMode==='emails' && users.length===0){
      axios.get('/usuarios').then(res=>setUsers(res.data||[])).catch(()=>{});
    }
  },[recipientMode]);

  const handleVarChange=(key:string,val:string)=>{setVariables(v=>({...v,[key]:val}));};
  const buildPayload=()=>{
    const recipients: any = { mode: recipientMode };
    if(recipientMode==='plan' && selectedPlan) recipients.plan=[selectedPlan];
    if(recipientMode==='emails') recipients.emails=users.filter(u=>selectedUserIds.includes(u._id)).map(u=>u.email);
    const payload:any={ template, variables, recipients };
    if(sendAt) payload.sendAt = sendAt;
    return payload;
  };
  const handlePreview=async()=>{
    try{
      const { data } = await axios.post('/emails/render-preview', { template, variables });
      setPreviewHtml(data.html);
    }catch(e){console.error(e);toast.error('Error generando preview');}
  };
  const handleSend=async()=>{
    setConfirmOpen(true);
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enviar newsletter / aviso</h1>
      <div className="space-y-6">
        <div>
          <label className="font-medium">Plantilla</label>
          <select value={template} onChange={e=>setTemplate(e.target.value as TemplateKey)} className="border rounded ml-2">
            {Object.entries(TEMPLATES).map(([k,v])=>(
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES[template].variables.map(k=>(
            <div key={k}>
              <label className="block text-sm font-medium capitalize">{k.replace(/_/g,' ')}</label>
              <input type="text" value={variables[k]||''} onChange={e=>handleVarChange(k,e.target.value)} className="border rounded w-full p-2"/>
            </div>
          ))}
        </div>
        <div>
          <label className="font-medium mr-4">Destinatarios</label>
          {[['all','Todos'],['plan','Plan'],['emails','Email']].map(([opt,label])=>(
            <label key={opt} className="mr-4">
              <input type="radio" value={opt} checked={recipientMode===opt} onChange={()=>setRecipientMode(opt as any)} className="mr-1"/> {label}
            </label>
          ))}
          {recipientMode==='plan' && (
            <select value={selectedPlan} onChange={e=>setSelectedPlan(e.target.value)} className="border rounded p-2 ml-4 min-w-[200px]">
              <option value="">-- seleccionar plan --</option>
              {plans.map(p=>(<option key={p._id} value={p.name||p.nombre}>{p.name||p.nombre}</option>))}
            </select>
          )}
          {recipientMode==='emails' && (
            <div className="mt-4 border p-2 max-h-64 overflow-y-auto w-full md:w-2/3">
              <input value={searchUser} onChange={e=>setSearchUser(e.target.value)} placeholder="Buscar..." className="border rounded p-1 mb-2 w-full" />
              <table className="min-w-full text-sm">
                <tbody>
                  {users.filter(u=>u.email.toLowerCase().includes(searchUser.toLowerCase())).map(u=>{
                    const checked=selectedUserIds.includes(u._id);
                    return (
                      <tr key={u._id} className="border-t">
                        <td className="p-1">
                          <input type="checkbox" checked={checked} onChange={()=>{
                            setSelectedUserIds(prev=>checked?prev.filter(id=>id!==u._id):[...prev,u._id]);
                          }}/>
                        </td>
                        <td className="p-1">{u.email}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Programar envío <span className="text-gray-500">(opcional)</span></label>
          <input type="datetime-local" value={sendAt} onChange={e=>setSendAt(e.target.value)} className="border rounded p-2"/>
        </div>

        <div className="space-x-3">
          <button onClick={handlePreview} className="bg-gray-200 px-4 py-2 rounded">Preview</button>
          <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
        </div>
        {/* Modal Preview */}
        {previewHtml && (
          <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 overflow-y-auto" onClick={()=>setPreviewHtml('')}>
            <div className="bg-white w-full max-w-4xl mt-10 rounded shadow-lg p-4 relative" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setPreviewHtml('')} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
              <iframe title="preview" className="w-full h-[70vh] border rounded" srcDoc={previewHtml} />
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Historial reciente</h2>
          <button onClick={loadHistory} className="mb-2 text-sm underline">Refrescar</button>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Fecha</th>
                  <th className="p-2 border">Plantilla</th>
                  <th className="p-2 border">Modo</th>
                  <th className="p-2 border">Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((j:any)=>(
                  <tr key={j._id}>
                    <td className="border p-1">{new Date(j.createdAt).toLocaleString()}</td>
                    <td className="border p-1">{j.template}</td>
                    <td className="border p-1">{j.recipients?.mode}</td>
                    <td className="border p-1">{j.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        message="¿Enviar este email?"
        onCancel={()=>setConfirmOpen(false)}
        onConfirm={async()=>{
          setConfirmOpen(false);
          try{
            await axios.post('/emails/send-newsletter', buildPayload());
            toast.success('Envío encolado');
          }catch(e){console.error(e);toast.error('Error enviando email');}
        }}
      />
    </div>
  );
};

export default SendNewsletterPage;
