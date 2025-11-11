import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatDate } from '../../utils/formatDate';

interface Props {
  onClose: () => void;
  onSubmit: (payload: { startPage: number; endPage: number; version?: string; file?: File }) => void;
  defaultStart?: number;
  defaultEnd?: number;
}

const OcrExtractModal: React.FC<Props> = ({ onClose, onSubmit, defaultStart = 136, defaultEnd = 186 }) => {
  const [startPage, setStartPage] = useState<number>(defaultStart);
  const [endPage, setEndPage] = useState<number>(defaultEnd);
  const [versionIso, setVersionIso] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    noClick: true,
    noDrag: !!file,
    onDrop: (accepted) => {
      if (accepted.length) setFile(accepted[0]);
    },
  });

  const isValidRange = () => Number.isFinite(startPage) && Number.isFinite(endPage) && startPage > 0 && endPage >= startPage && versionIso.trim() !== '';

  const handleSubmit = () => {
    if (!isValidRange() || !file) return;
    const formatted = formatDate(versionIso);
    onSubmit({ startPage, endPage, version: formatted, file });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">Procesar PDF – Código Urbanístico</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Página inicial
            <input
              type="number"
              className="input-field w-full"
              value={startPage}
              min={1}
              onChange={(e) => setStartPage(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium">
            Página final
            <input
              type="number"
              className="input-field w-full"
              value={endPage}
              min={1}
              onChange={(e) => setEndPage(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium">Versión del documento (requerida)
            <input
              type="date"
              className="input-field w-full"
              value={versionIso}
              onChange={(e) => setVersionIso(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">Archivo PDF
            {file ? (
              <div className="border p-4 rounded-md mt-1 flex items-center justify-between">
                <span className="text-sm">{file.name}</span>
                <button type="button" className="btn-secondary ml-4" onClick={() => { setFile(null); setTimeout(open, 0); }}>Cambiar PDF</button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-4 rounded-md text-center cursor-pointer mt-1 ${isDragActive ? 'bg-blue-50' : ''}`}
              >
                <input {...getInputProps()} />
                Arrastra un PDF o haz clic para seleccionar
              </div>
            )}
          </label>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`btn-primary ${(!isValidRange() || !file) ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleSubmit}
          >
            Procesar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OcrExtractModal; 