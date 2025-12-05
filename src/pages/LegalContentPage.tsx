import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { toast } from 'react-toastify';
import axios from 'axios';
import Prism from 'prismjs';

import 'prismjs/components/prism-markup';

import { Button, Card, PageHeader } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

import 'prismjs/themes/prism-tomorrow.css';

interface LegalContent {
  _id?: string;
  type: 'terms' | 'privacy';
  content: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

const useLegalContent = () => {
  const [terms, setTerms] = useState<LegalContent | null>(null);
  const [privacy, setPrivacy] = useState<LegalContent | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [termsRes, privacyRes] = await Promise.all([
        axios.get('/admin/legal-content/terms').catch(() => ({ data: null })),
        axios.get('/admin/legal-content/privacy').catch(() => ({ data: null })),
      ]);
      setTerms(termsRes.data);
      setPrivacy(privacyRes.data);
    } catch (error) {
      console.error('Error cargando contenido legal:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Error al cargar el contenido legal';
        toast.error(message);
      } else {
        toast.error('Error al cargar el contenido legal');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { terms, privacy, loading, refetch: load };
};

const HtmlEditor: React.FC<{
  value: string;
  onChange: (code: string) => void;
}> = ({ value, onChange }) => (
  <div>
    <label
      htmlFor="html-editor"
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      Contenido (HTML)
    </label>
    <div className="border rounded-lg overflow-hidden dark:border-gray-600">
      <Editor
        id="html-editor"
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
        padding={12}
        className="w-full font-mono text-sm dark:bg-gray-900"
        style={{
          minHeight: '400px',
          background: '#1e293b',
          color: '#e2e8f0',
          overflow: 'auto',
        }}
      />
    </div>
  </div>
);

const LegalContentEditor: React.FC<{
  content: LegalContent | null;
  type: 'terms' | 'privacy';
  onSave: () => void;
}> = ({ content, type, onSave }) => {
  const [editedContent, setEditedContent] = useState(content?.content || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditedContent(content?.content || '');
  }, [content]);

  const handleSave = async () => {
    if (!editedContent || editedContent.trim() === '') {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    setSaving(true);
    try {
      if (content?._id) {
        await axios.put(`/admin/legal-content/${type}`, { content: editedContent });
        toast.success(
          type === 'terms'
            ? 'Términos y condiciones actualizados correctamente'
            : 'Política de privacidad actualizada correctamente'
        );
      } else {
        await axios.post('/admin/legal-content', { type, content: editedContent });
        toast.success(
          type === 'terms'
            ? 'Términos y condiciones creados correctamente'
            : 'Política de privacidad creada correctamente'
        );
      }
      onSave();
    } catch (error) {
      console.error('Error guardando contenido:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Error al guardar el contenido';
        toast.error(message);
      } else {
        toast.error('Error al guardar el contenido');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <HtmlEditor value={editedContent} onChange={setEditedContent} />
      <div className="flex justify-end">
        <Button
          onClick={() => {
            void handleSave();
          }}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
      {content?.version && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Versión: {content.version} | Última actualización:{' '}
          {content.updatedAt ? new Date(content.updatedAt).toLocaleString() : 'N/A'}
        </p>
      )}
    </div>
  );
};

const LegalContentPage: React.FC = () => {
  const { user } = useAuth();
  const { terms, privacy, loading, refetch } = useLegalContent();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  useEffect(() => {
    if (!user?.isSuperAdmin) {
      toast.error('Solo los super administradores pueden editar el contenido legal');
    }
  }, [user]);

  if (!user?.isSuperAdmin) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Solo los super administradores pueden editar el contenido legal.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Contenido Legal" />
      <Card className="mt-6">
        <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'terms'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('terms')}
          >
            Términos y Condiciones
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'privacy'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('privacy')}
          >
            Políticas de Privacidad
          </button>
        </div>
        <div className="mt-6">
          {activeTab === 'terms' && (
            <LegalContentEditor
              content={terms}
              type="terms"
              onSave={() => {
                void refetch();
              }}
            />
          )}
          {activeTab === 'privacy' && (
            <LegalContentEditor
              content={privacy}
              type="privacy"
              onSave={() => {
                void refetch();
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default LegalContentPage;
