import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ConfirmModal from '../components/ConfirmModal';
import DeleteIconButton from '../components/DeleteIconButton';
import EditIconButton from '../components/EditIconButton';
import EditReglaLogicaModal from '../components/modals/EditReglaLogicaModal';
import NewItemButton from '../components/NewItemButton';
import {
  Card,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import { Paso } from '../types/pasos';
import { ReglaLogica } from '../types/reglas';

const ReglasLogicasPage: React.FC = () => {
  const [reglas, setReglas] = useState<ReglaLogica[]>([]);
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ReglaLogica | null>(null);
  const [toDelete, setToDelete] = useState<ReglaLogica | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: reglasData }, { data: pasosData }] = await Promise.all([
        axios.get<ReglaLogica[]>('/admin/reglas-logicas'),
        axios.get<Paso[]>('/admin/calculo-pasos'),
      ]);
      setReglas(reglasData);
      setPasos(pasosData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const handleSave = async (r: ReglaLogica) => {
    try {
      if (editing && editing._id) {
        await axios.put(`/admin/reglas-logicas/${editing._id}`, r);
      } else {
        await axios.post('/admin/reglas-logicas', r);
      }
      setShowModal(false);
      setEditing(null);
      void fetchAll();
    } catch (e) {
      console.error(e);
      alert('Error guardando regla');
    }
  };

  const handleDelete = async () => {
    if (!toDelete?._id) return;
    try {
      await axios.delete(`/admin/reglas-logicas/${toDelete._id}`);
      setToDelete(null);
      void fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const pasoNombre = (id?: string) => pasos.find((p) => p._id === id)?.nombre_paso || '';
  const pasosSafe = pasos.filter((p): p is Paso & { _id: string } => !!p._id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando reglas lógicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reglas Lógicas"
        description="Gestiona las reglas lógicas del sistema"
        actions={<NewItemButton label="Nueva regla" onClick={() => setShowModal(true)} />}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paso</TableHead>
              <TableHead>Distrito</TableHead>
              <TableHead>Ref CU</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reglas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No hay reglas lógicas registradas
                </TableCell>
              </TableRow>
            ) : (
              reglas.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{pasoNombre(r.id_paso)}</TableCell>
                  <TableCell>{r.distrito_cpu}</TableCell>
                  <TableCell>
                    {(Array.isArray(r.id_cu_referencia)
                      ? r.id_cu_referencia
                      : r.id_cu_referencia
                        ? [r.id_cu_referencia]
                        : []
                    ).join(', ')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.activo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {r.activo ? 'Sí' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <EditIconButton
                        onClick={() => {
                          setEditing(r);
                          setShowModal(true);
                        }}
                      />
                      <DeleteIconButton onClick={() => setToDelete(r)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {showModal && (
        <EditReglaLogicaModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={(r) => {
            void handleSave(r);
          }}
          editing={editing}
          pasos={pasosSafe}
        />
      )}

      {toDelete && (
        <ConfirmModal
          open={true}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            void handleDelete();
          }}
          title="Eliminar regla"
          message="¿Estás seguro de que deseas eliminar esta regla lógica?"
        />
      )}
    </div>
  );
};

export default ReglasLogicasPage;
