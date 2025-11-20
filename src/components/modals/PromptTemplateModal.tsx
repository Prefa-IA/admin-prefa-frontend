import React, { useRef, useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

import RuleSelectorModal from './RuleSelectorModal';

interface Props {
  initialData?:
    | {
        nombre?: string;
        name?: string;
        version?: string;
        contenido_prompt?: string;
        template?: string;
        isActive?: boolean;
        activo?: boolean;
      }
    | undefined;
  onClose: () => void;
  onSave: (payload: {
    nombre?: string;
    name?: string;
    version: string;
    contenido_prompt?: string;
    template?: string;
    isActive?: boolean;
    activo?: boolean;
  }) => void;
}

const insertTextAtCursor = (
  textarea: HTMLTextAreaElement,
  content: string,
  insertion: string
): string => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = content.slice(0, start);
  const after = content.slice(end);
  const newContent = before + insertion + after;
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
    textarea.focus();
  }, 0);
  return newContent;
};

const FormHeader: React.FC<{
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
  onInsertRule: () => void;
}> = ({ isActive, onActiveChange, onInsertRule }) => (
  <div className="flex justify-between items-center">
    <label className="flex items-center gap-2 text-sm select-none">
      <input
        type="checkbox"
        className="accent-blue-600"
        checked={isActive}
        onChange={(e) => onActiveChange(e.target.checked)}
      />
      Activa
    </label>
    <button
      className="btn-primary flex items-center gap-1 text-sm"
      type="button"
      onClick={onInsertRule}
    >
      <PlusCircleIcon className="h-5 w-5" /> Insertar Regla
    </button>
  </div>
);

const FormBody: React.FC<{
  nombre: string;
  version: string;
  contenido: string;
  isActive: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onNombreChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onContenidoChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
  onInsertRule: () => void;
}> = ({
  nombre,
  version,
  contenido,
  isActive,
  textareaRef,
  onNombreChange,
  onVersionChange,
  onContenidoChange,
  onActiveChange,
  onInsertRule,
}) => (
  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
    <FormHeader isActive={isActive} onActiveChange={onActiveChange} onInsertRule={onInsertRule} />
    <label className="block text-sm font-medium">
      Nombre
      <input
        className="input-field w-full"
        value={nombre}
        onChange={(e) => onNombreChange(e.target.value)}
      />
    </label>
    <label className="block text-sm font-medium">
      Versión
      <input
        className="input-field w-full"
        value={version}
        onChange={(e) => onVersionChange(e.target.value)}
      />
    </label>
    <label className="block text-sm font-medium">
      Contenido del Prompt
      <textarea
        ref={textareaRef}
        className="input-field w-full h-96 whitespace-pre-wrap overflow-y-auto resize-vertical"
        value={contenido}
        onChange={(e) => onContenidoChange(e.target.value)}
      />
    </label>
  </div>
);

const PromptTemplateModal: React.FC<Props> = ({ initialData, onClose, onSave }) => {
  const [nombre, setNombre] = useState(initialData?.nombre || initialData?.name || '');
  const [version, setVersion] = useState(initialData?.version || '1.0.0');
  const [contenido, setContenido] = useState(
    initialData?.contenido_prompt || initialData?.template || ''
  );
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.activo ?? initialData?.isActive ?? false
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertRule = (ruleId: string) => {
    if (!textareaRef.current) return;
    const insertion = `SELECTOR:{${ruleId}}`;
    const newContent = insertTextAtCursor(textareaRef.current, contenido, insertion);
    setContenido(newContent);
  };

  const handleSubmit = () => {
    if (!nombre.trim() || !version.trim() || !contenido.trim()) return;
    onSave({
      nombre: nombre.trim(),
      name: nombre.trim(),
      version: version.trim(),
      contenido_prompt: contenido,
      template: contenido,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">{initialData ? 'Editar' : 'Nueva'} Plantilla</h3>
        <FormBody
          nombre={nombre}
          version={version}
          contenido={contenido}
          isActive={isActive}
          textareaRef={textareaRef}
          onNombreChange={setNombre}
          onVersionChange={setVersion}
          onContenidoChange={setContenido}
          onActiveChange={setIsActive}
          onInsertRule={() => setShowRuleModal(true)}
        />
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            {initialData ? 'Guardar' : 'Crear'}
          </button>
        </div>
        {showRuleModal && (
          <RuleSelectorModal
            onClose={() => setShowRuleModal(false)}
            onSelect={(rule) => {
              insertRule(rule.id_regla);
              setShowRuleModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PromptTemplateModal;
