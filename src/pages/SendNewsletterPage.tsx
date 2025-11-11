import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PageHeader, Card, Input, Select, Button, Table, TableHeader, TableRow, TableHead, TableCell, TableBody, Modal, Checkbox } from '../components/ui';
import ConfirmModal from '../components/ConfirmModal';
import { Plan } from '../types/planes';
import { Usuario } from '../types/usuarios';
import { TemplateKey } from '../types/emails';

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
  const [confirmOpen,setConfirmOpen]=useState(false);

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
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Enviar newsletter / aviso"
        description="Crea y envía newsletters o avisos a los usuarios"
      />

      <Card title="Configuración del email" className="mb-6">
      <div className="space-y-6">
          <Select
            label="Plantilla"
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateKey)}
            options={Object.entries(TEMPLATES).map(([k, v]) => ({ value: k, label: v.label }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES[template].variables.map(k => (
              <Input
                key={k}
                label={k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={variables[k] || ''}
                onChange={(e) => handleVarChange(k, e.target.value)}
              />
            ))}
        </div>

        <div>
            <label className="block text-sm font-medium mb-3">Destinatarios</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {[['all', 'Todos'], ['plan', 'Plan'], ['emails', 'Email']].map(([opt, label]) => (
                <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value={opt}
                    checked={recipientMode === opt}
                    onChange={() => setRecipientMode(opt as any)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>{label}</span>
            </label>
          ))}
            </div>

            {recipientMode === 'plan' && (
              <Select
                label="Seleccionar plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                options={[
                  { value: '', label: '-- seleccionar plan --' },
                  ...plans.map(p => ({ value: p.name, label: p.name }))
                ]}
              />
          )}

            {recipientMode === 'emails' && (
              <Card className="mt-4">
                <Input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Buscar usuarios..."
                  className="mb-4"
                />
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"> </TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(u => u.email.toLowerCase().includes(searchUser.toLowerCase())).map(u => {
                        const checked = selectedUserIds.includes(u._id);
                    return (
                          <TableRow key={u._id}>
                            <TableCell>
                              <Checkbox
                                checked={checked}
                                onChange={() => {
                                  setSelectedUserIds(prev => checked ? prev.filter(id => id !== u._id) : [...prev, u._id]);
                                }}
                              />
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                          </TableRow>
                    );
                  })}
                    </TableBody>
                  </Table>
            </div>
              </Card>
          )}
        </div>

          <Input
            label="Programar envío (opcional)"
            type="datetime-local"
            value={sendAt}
            onChange={(e) => setSendAt(e.target.value)}
          />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePreview}>
              Preview
            </Button>
            <Button variant="primary" onClick={handleSend}>
              Enviar
            </Button>
        </div>
        </div>
      </Card>

        {/* Modal Preview */}
        {previewHtml && (
        <Modal
          show={true}
          title="Vista previa del email"
          onClose={() => setPreviewHtml('')}
          size="xl"
        >
              <iframe title="preview" className="w-full h-[70vh] border rounded" srcDoc={previewHtml} />
        </Modal>
        )}
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
