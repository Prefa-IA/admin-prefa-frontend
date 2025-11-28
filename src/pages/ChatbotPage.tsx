import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import NewItemButton from '../components/NewItemButton';
import {
  Button,
  Card,
  Checkbox,
  FilterBar,
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

interface ChatbotQuestion {
  _id?: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'consultas', label: 'Consultas' },
  { value: 'creditos', label: 'Créditos' },
  { value: 'planes', label: 'Planes' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'otros', label: 'Otros' },
];

const defaultQuestion: ChatbotQuestion = {
  question: '',
  answer: '',
  order: 0,
  isActive: true,
  category: 'general',
};

const useChatbotQuestions = () => {
  const [items, setItems] = useState<ChatbotQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/chatbot/questions');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Error al cargar las preguntas';
        toast.error(message);
      } else {
        toast.error('Error al cargar las preguntas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { items, loading, refetch: load };
};

const useChatbotQuestionModal = () => {
  const [selected, setSelected] = useState<ChatbotQuestion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const openModal = (question?: ChatbotQuestion) => {
    setSelected(question ? { ...question } : { ...defaultQuestion });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const save = async (onSuccess: () => void) => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = { ...selected };
      if (payload._id) {
        await axios.put(`/admin/chatbot/questions/${payload._id}`, payload);
        toast.success('Pregunta actualizada correctamente');
      } else {
        await axios.post('/admin/chatbot/questions', payload);
        toast.success('Pregunta creada correctamente');
      }
      onSuccess();
      closeModal();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Error al guardar la pregunta';
        toast.error(message);
      } else {
        toast.error('Error al guardar la pregunta');
      }
    } finally {
      setSaving(false);
    }
  };

  return { selected, showModal, saving, openModal, closeModal, setSelected, save };
};

const useChatbotQuestionDelete = (onSuccess: () => void) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | undefined>();

  const askDelete = (id?: string) => {
    if (!id) return;
    setPendingDelete(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    try {
      await axios.delete(`/admin/chatbot/questions/${pendingDelete}`);
      toast.success('Pregunta eliminada correctamente');
      setPendingDelete(undefined);
      setConfirmOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Error al eliminar la pregunta';
        toast.error(message);
      } else {
        toast.error('Error al eliminar la pregunta');
      }
    }
  };

  return { confirmOpen, pendingDelete, askDelete, doDelete, setConfirmOpen };
};

const QuestionsTable: React.FC<{
  questions: ChatbotQuestion[];
  onEdit: (q: ChatbotQuestion) => void;
  onDelete: (id?: string) => void;
}> = ({ questions, onEdit, onDelete }) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Orden</TableHead>
          <TableHead>Pregunta</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay preguntas registradas
            </TableCell>
          </TableRow>
        ) : (
          questions.map((q) => (
            <TableRow key={q._id}>
              <TableCell>{q.order}</TableCell>
              <TableCell className="font-medium">{q.question}</TableCell>
              <TableCell>{q.category}</TableCell>
              <TableCell>
                {q.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Activo
                  </span>
                ) : (
                  <span className="text-gray-400">Inactivo</span>
                )}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-1">
                  <EditIconButton onClick={() => onEdit(q)} />
                  <DeleteIconButton onClick={() => onDelete(q._id)} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

const QuestionForm: React.FC<{
  question: ChatbotQuestion;
  onQuestionChange: (q: ChatbotQuestion) => void;
}> = ({ question, onQuestionChange }) => (
  <div className="space-y-4">
    <Input
      label="Pregunta"
      value={question.question}
      onChange={(e) => onQuestionChange({ ...question, question: e.target.value })}
      placeholder="Ej: ¿Cómo hago una consulta?"
      maxLength={200}
    />
    <div>
      <label
        htmlFor="answer-textarea"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        Respuesta
      </label>
      <textarea
        id="answer-textarea"
        value={question.answer}
        onChange={(e) => onQuestionChange({ ...question, answer: e.target.value })}
        placeholder="Escribe la respuesta aquí..."
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
      />
    </div>
    <Input
      label="Orden"
      type="number"
      value={question.order.toString()}
      onChange={(e) =>
        onQuestionChange({ ...question, order: Number.parseInt(e.target.value, 10) || 0 })
      }
      placeholder="0"
    />
    <Select
      label="Categoría"
      value={question.category}
      onChange={(e) => onQuestionChange({ ...question, category: e.target.value })}
      options={CATEGORY_OPTIONS}
    />
    <Checkbox
      label="Activo"
      checked={!!question.isActive}
      onChange={(e) => onQuestionChange({ ...question, isActive: e.target.checked })}
    />
  </div>
);

const QuestionEditor: React.FC<{
  question: ChatbotQuestion;
  onQuestionChange: (q: ChatbotQuestion) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}> = ({ question, onQuestionChange, saving, onSave, onClose }) => (
  <Modal
    show={true}
    title={question._id ? 'Editar Pregunta' : 'Nueva Pregunta'}
    onClose={onClose}
    size="lg"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
          Guardar
        </Button>
      </>
    }
  >
    <QuestionForm question={question} onQuestionChange={onQuestionChange} />
  </Modal>
);

const ChatbotPage: React.FC = () => {
  const { items, loading, refetch } = useChatbotQuestions();
  const { selected, showModal, saving, openModal, closeModal, setSelected, save } =
    useChatbotQuestionModal();
  const handleRefetch = () => {
    void refetch();
  };
  const { confirmOpen, askDelete, doDelete, setConfirmOpen } =
    useChatbotQuestionDelete(handleRefetch);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(needle) ||
        item.answer.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle)
    );
  }, [items, q]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Chatbot - Preguntas y Respuestas"
        actions={<NewItemButton label="Nueva Pregunta" onClick={() => openModal()} />}
      />
      <FilterBar searchValue={q} onSearchChange={setQ} searchPlaceholder="Buscar preguntas..." />
      <div className="mt-6">
        <QuestionsTable questions={filtered} onEdit={openModal} onDelete={askDelete} />
      </div>

      {showModal && selected && (
        <QuestionEditor
          question={selected}
          onQuestionChange={setSelected}
          saving={saving}
          onSave={() => {
            void save(handleRefetch);
          }}
          onClose={closeModal}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar Pregunta"
        message="¿Estás seguro de que deseas eliminar esta pregunta?"
        onConfirm={() => {
          void doDelete();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ChatbotPage;
