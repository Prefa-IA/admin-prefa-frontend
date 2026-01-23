import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import {
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { TemplateKey } from '../types/emails';
import { Plan } from '../types/planes';
import { Usuario } from '../types/usuarios';

const TEMPLATES = {
  'info-prefas': {
    label: 'Informativo',
    variables: [
      'announcement_title',
      'main_message',
      'effective_date',
      'details_summary',
      'cta_url',
      'cta_text',
    ],
  },
  'marketing-newsletter': {
    label: 'Marketing',
    variables: [
      'campaign_title',
      'main_message',
      'main_feature_title',
      'main_feature_description',
      'cta_url',
      'cta_text',
    ],
  },
};

interface Recipients {
  mode: string;
  plan?: string[];
  emails?: string[];
}

interface NewsletterPayload {
  template: string;
  variables: Record<string, string>;
  recipients: Recipients;
  sendAt?: string;
}

const useNewsletterData = (recipientMode: 'all' | 'plan' | 'emails') => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await axios.get<Plan[]>('/api/admin/billing/planes');
        setPlans(Array.isArray(res.data) ? res.data : []);
      } catch {
        // Silently handle error
      }
    };

    const loadUsers = async () => {
      try {
        const res = await axios.get<{ usuarios?: Usuario[] }>('/api/admin/usuarios', {
          params: { page: 1, limit: 100 },
        });
        setUsers(Array.isArray(res.data?.usuarios) ? res.data.usuarios : []);
      } catch {
        // Silently handle error
      }
    };

    if (recipientMode === 'plan' && plans.length === 0) {
      void loadPlans();
    }
    if (recipientMode === 'emails' && users.length === 0) {
      void loadUsers();
    }
  }, [recipientMode, plans.length, users.length]);

  return { plans, users };
};

const getVariableLabel = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const applyTextReplacement = (
  textarea: HTMLTextAreaElement,
  value: string,
  replacement: string,
  selectFrom: number,
  selectTo: number
) => {
  const before = value.slice(0, selectFrom);
  const after = value.slice(selectTo);
  const nextValue = `${before}${replacement}${after}`;
  const cursor = selectFrom + replacement.length;
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  }, 0);
  return nextValue;
};

const RichTextInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (openTag: string, closeTag: string, placeholder = 'Texto') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const replacement = `${openTag}${selected}${closeTag}`;
    onChange(applyTextReplacement(textarea, value, replacement, selectionStart, selectionEnd));
  };

  const insertList = (tag: 'ul' | 'ol') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd).trim();
    const lines = selected ? selected.split(/\r?\n/).filter(Boolean) : ['Item'];
    const items = lines.map((line) => `  <li>${line}</li>`).join('\n');
    const replacement = `<${tag}>\n${items}\n</${tag}>`;
    onChange(applyTextReplacement(textarea, value, replacement, selectionStart, selectionEnd));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        <Button variant="secondary" size="sm" type="button" onClick={() => wrapSelection('<b>', '</b>')}>
          B
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => wrapSelection('<u>', '</u>')}
        >
          U
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => wrapSelection('<i>', '</i>')}
        >
          I
        </Button>
        <Button variant="secondary" size="sm" type="button" onClick={() => insertList('ul')}>
          UL
        </Button>
        <Button variant="secondary" size="sm" type="button" onClick={() => insertList('ol')}>
          OL
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
        placeholder="Escribe el detalle aquí..."
      />
    </div>
  );
};

const TemplateVariablesSection: React.FC<{
  template: TemplateKey;
  variables: Record<string, string>;
  onVarChange: (key: string, val: string) => void;
}> = ({ template, variables, onVarChange }) => {
  const templateData = Reflect.get(TEMPLATES, template);
  if (!templateData) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templateData.variables.map((k) => {
        const varValue = Reflect.get(variables, k);
        if (k === 'details_summary') {
          return (
            <div key={k} className="md:col-span-2">
              <RichTextInput
                label={getVariableLabel(k)}
                value={varValue || ''}
                onChange={(val) => onVarChange(k, val)}
              />
            </div>
          );
        }
        return (
          <Input
            key={k}
            label={getVariableLabel(k)}
            type={k === 'effective_date' ? 'date' : 'text'}
            value={varValue || ''}
            onChange={(e) => onVarChange(k, e.target.value)}
          />
        );
      })}
    </div>
  );
};

const RecipientModeSelector: React.FC<{
  recipientMode: 'all' | 'plan' | 'emails';
  onModeChange: (m: 'all' | 'plan' | 'emails') => void;
}> = ({ recipientMode, onModeChange }) => (
  <div>
    <label htmlFor="recipient-mode" className="block text-sm font-medium mb-3">
      Destinatarios
    </label>
    <div id="recipient-mode" className="flex flex-wrap gap-4 mb-4">
      {[
        ['all', 'Todos'],
        ['plan', 'Plan'],
        ['emails', 'Email'],
      ].map(([opt, label]) => (
        <label key={opt} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value={opt}
            checked={recipientMode === opt}
            onChange={() => onModeChange(opt as 'all' | 'plan' | 'emails')}
            className="text-primary-600 focus:ring-primary-500"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  </div>
);

const PlanSelector: React.FC<{
  plans: Plan[];
  selectedPlan: string;
  onPlanChange: (p: string) => void;
}> = ({ plans, selectedPlan, onPlanChange }) => (
  <Select
    label="Seleccionar plan"
    value={selectedPlan}
    onChange={(e) => onPlanChange(e.target.value)}
    options={[
      { value: '', label: '-- seleccionar plan --' },
      ...plans.map((p) => ({ value: p.id, label: p.name })),
    ]}
  />
);

const UsersSelector: React.FC<{
  users: Usuario[];
  searchUser: string;
  onSearchChange: (s: string) => void;
  selectedUserIds: string[];
  onUserToggle: (id: string) => void;
}> = ({ users, searchUser, onSearchChange, selectedUserIds, onUserToggle }) => {
  const usersSafe = Array.isArray(users) ? users : [];
  const search = searchUser.toLowerCase();
  const filteredUsers = usersSafe.filter(
    (u) =>
      u.email?.toLowerCase().includes(search) ||
      u.nombre?.toLowerCase().includes(search)
  );

  return (
    <Card className="mt-4">
      <Input
        value={searchUser}
        onChange={(e) => onSearchChange(e.target.value)}
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-sm text-gray-500 py-6">
                  No hay usuarios que coincidan
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const checked = selectedUserIds.includes(u._id);
                return (
                  <TableRow key={u._id}>
                    <TableCell>
                      <Checkbox
                        checked={checked}
                        onChange={() => {
                          onUserToggle(u._id);
                        }}
                      />
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

const RecipientsSection: React.FC<{
  recipientMode: 'all' | 'plan' | 'emails';
  onModeChange: (m: 'all' | 'plan' | 'emails') => void;
  plans: Plan[];
  selectedPlan: string;
  onPlanChange: (p: string) => void;
  users: Usuario[];
  searchUser: string;
  onSearchChange: (s: string) => void;
  selectedUserIds: string[];
  onUserToggle: (id: string) => void;
}> = ({
  recipientMode,
  onModeChange,
  plans,
  selectedPlan,
  onPlanChange,
  users,
  searchUser,
  onSearchChange,
  selectedUserIds,
  onUserToggle,
}) => (
  <div>
    <RecipientModeSelector recipientMode={recipientMode} onModeChange={onModeChange} />
    {recipientMode === 'plan' && (
      <PlanSelector plans={plans} selectedPlan={selectedPlan} onPlanChange={onPlanChange} />
    )}
    {recipientMode === 'emails' && (
      <UsersSelector
        users={users}
        searchUser={searchUser}
        onSearchChange={onSearchChange}
        selectedUserIds={selectedUserIds}
        onUserToggle={onUserToggle}
      />
    )}
  </div>
);

const PreviewModal: React.FC<{
  previewHtml: string;
  onClose: () => void;
}> = ({ previewHtml, onClose }) => (
  <Modal show={true} title="Vista previa del email" onClose={onClose} size="xl">
    <iframe title="preview" className="w-full h-[70vh] border rounded" srcDoc={previewHtml} />
  </Modal>
);

const NewsletterActions: React.FC<{
  onPreview: () => void;
  onSend: () => void;
}> = ({ onPreview, onSend }) => (
  <div className="flex gap-3">
    <Button variant="secondary" onClick={() => void onPreview()}>
      Preview
    </Button>
    <Button variant="primary" onClick={onSend}>
      Enviar
    </Button>
  </div>
);

const NewsletterForm: React.FC<{
  template: TemplateKey;
  onTemplateChange: (t: TemplateKey) => void;
  variables: Record<string, string>;
  onVarChange: (key: string, val: string) => void;
  recipientMode: 'all' | 'plan' | 'emails';
  onRecipientModeChange: (m: 'all' | 'plan' | 'emails') => void;
  plans: Plan[];
  selectedPlan: string;
  onPlanChange: (p: string) => void;
  users: Usuario[];
  searchUser: string;
  onSearchChange: (s: string) => void;
  selectedUserIds: string[];
  onUserToggle: (id: string) => void;
  sendAt: string;
  onSendAtChange: (s: string) => void;
  onPreview: () => void;
  onSend: () => void;
}> = ({
  template,
  onTemplateChange,
  variables,
  onVarChange,
  recipientMode,
  onRecipientModeChange,
  plans,
  selectedPlan,
  onPlanChange,
  users,
  searchUser,
  onSearchChange,
  selectedUserIds,
  onUserToggle,
  sendAt,
  onSendAtChange,
  onPreview,
  onSend,
}) => (
  <Card title="Configuración del email" className="mb-6">
    <div className="space-y-6">
      <Select
        label="Plantilla"
        value={template}
        onChange={(e) => onTemplateChange(e.target.value as TemplateKey)}
        options={Object.entries(TEMPLATES).map(([k, v]) => ({ value: k, label: v.label }))}
      />
      <TemplateVariablesSection
        template={template}
        variables={variables}
        onVarChange={onVarChange}
      />
      <RecipientsSection
        recipientMode={recipientMode}
        onModeChange={onRecipientModeChange}
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={onPlanChange}
        users={users}
        searchUser={searchUser}
        onSearchChange={onSearchChange}
        selectedUserIds={selectedUserIds}
        onUserToggle={onUserToggle}
      />
      <Input
        label="Programar envío (opcional)"
        type="datetime-local"
        value={sendAt}
        onChange={(e) => onSendAtChange(e.target.value)}
      />
      <NewsletterActions onPreview={onPreview} onSend={onSend} />
    </div>
  </Card>
);

const useNewsletterHandlers = (
  template: TemplateKey,
  variables: Record<string, string>,
  recipientMode: 'all' | 'plan' | 'emails',
  selectedPlan: string,
  selectedUserIds: string[],
  users: Usuario[],
  sendAt: string
) => {
  const [previewHtml, setPreviewHtml] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handlePreview = async () => {
    try {
      const { data } = await axios.post('/emails/render-preview', { template, variables });
      setPreviewHtml(data.html);
    } catch (e) {
      console.error(e);
      toast.error('Error generando preview');
    }
  };

  const buildPayload = (): NewsletterPayload => {
    const recipients: Recipients = { mode: recipientMode };
    if (recipientMode === 'plan' && selectedPlan) recipients.plan = [selectedPlan];
    if (recipientMode === 'emails')
      recipients.emails = users.filter((u) => selectedUserIds.includes(u._id)).map((u) => u.email);
    const payload: NewsletterPayload = { template, variables, recipients };
    if (sendAt) payload.sendAt = sendAt;
    return payload;
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      await axios.post('/emails/send-newsletter', buildPayload());
      toast.success('Envío encolado');
    } catch (e) {
      console.error(e);
      toast.error('Error enviando email');
    }
  };

  return {
    previewHtml,
    setPreviewHtml,
    confirmOpen,
    setConfirmOpen,
    handlePreview,
    handleConfirm,
  };
};

const SendNewsletterPage: React.FC = () => {
  const [template, setTemplate] = useState<TemplateKey>('info-prefas');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [recipientMode, setRecipientMode] = useState<'all' | 'plan' | 'emails'>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendAt, setSendAt] = useState('');
  const { plans, users } = useNewsletterData(recipientMode);

  const { previewHtml, setPreviewHtml, confirmOpen, setConfirmOpen, handlePreview, handleConfirm } =
    useNewsletterHandlers(
      template,
      variables,
      recipientMode,
      selectedPlan,
      selectedUserIds,
      users,
      sendAt
    );

  const handleVarChange = (key: string, val: string) => {
    setVariables((v) => ({ ...v, [key]: val }));
  };

  const handleUserToggle = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Enviar newsletter / aviso"
        description="Crea y envía newsletters o avisos a los usuarios"
      />
      <NewsletterForm
        template={template}
        onTemplateChange={setTemplate}
        variables={variables}
        onVarChange={handleVarChange}
        recipientMode={recipientMode}
        onRecipientModeChange={setRecipientMode}
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        users={users}
        searchUser={searchUser}
        onSearchChange={setSearchUser}
        selectedUserIds={selectedUserIds}
        onUserToggle={handleUserToggle}
        sendAt={sendAt}
        onSendAtChange={setSendAt}
        onPreview={() => {
          void handlePreview();
        }}
        onSend={() => setConfirmOpen(true)}
      />
      {previewHtml && <PreviewModal previewHtml={previewHtml} onClose={() => setPreviewHtml('')} />}
      <ConfirmModal
        open={confirmOpen}
        message="¿Enviar este email?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void handleConfirm();
        }}
      />
    </div>
  );
};

export default SendNewsletterPage;
