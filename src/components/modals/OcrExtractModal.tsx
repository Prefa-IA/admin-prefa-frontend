import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { formatDate } from '../../utils/formatDate';

interface Props {
  onClose: () => void;
  onSubmit: (payload: {
    startPage: number;
    endPage: number;
    version?: string;
    file?: File;
  }) => void;
  defaultStart?: number;
  defaultEnd?: number;
}

const isValidRange = (start: number, end: number, version: string): boolean =>
  Number.isFinite(start) &&
  Number.isFinite(end) &&
  start > 0 &&
  end >= start &&
  version.trim() !== '';

const FileUploadArea: React.FC<{
  file: File | null;
  isDragActive: boolean;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  onRemove: () => void;
  onOpen: () => void;
}> = ({ file, isDragActive, getRootProps, getInputProps, onRemove, onOpen }) => {
  if (file) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-md mt-1 flex items-center justify-between bg-white dark:bg-gray-800">
        <span className="text-sm text-gray-900 dark:text-gray-100">{file.name}</span>
        <button
          type="button"
          className="btn-secondary ml-4"
          onClick={() => {
            onRemove();
            setTimeout(onOpen, 0);
          }}
        >
          Cambiar PDF
        </button>
      </div>
    );
  }
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-md text-center cursor-pointer mt-1 text-gray-700 dark:text-gray-300 ${isDragActive ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
    >
      <input {...getInputProps()} />
      Arrastra un PDF o haz clic para seleccionar
    </div>
  );
};

const FormFields: React.FC<{
  startPage: number;
  endPage: number;
  versionIso: string;
  onStartPageChange: (value: number) => void;
  onEndPageChange: (value: number) => void;
  onVersionChange: (value: string) => void;
  file: File | null;
  isDragActive: boolean;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  onRemove: () => void;
  onOpen: () => void;
}> = ({
  startPage,
  endPage,
  versionIso,
  onStartPageChange,
  onEndPageChange,
  onVersionChange,
  file,
  isDragActive,
  getRootProps,
  getInputProps,
  onRemove,
  onOpen,
}) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Página inicial
      <input
        type="number"
        className="input-field w-full"
        value={startPage}
        min={1}
        onChange={(e) => onStartPageChange(Number(e.target.value))}
      />
    </label>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Página final
      <input
        type="number"
        className="input-field w-full"
        value={endPage}
        min={1}
        onChange={(e) => onEndPageChange(Number(e.target.value))}
      />
    </label>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Versión del documento (requerida)
      <input
        type="date"
        className="input-field w-full"
        value={versionIso}
        onChange={(e) => onVersionChange(e.target.value)}
      />
    </label>
    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      <label htmlFor="pdf-upload" className="block mb-2">
        Archivo PDF
      </label>
      <FileUploadArea
        file={file}
        isDragActive={isDragActive}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        onRemove={onRemove}
        onOpen={onOpen}
      />
    </div>
  </div>
);

const OcrExtractModal: React.FC<Props> = ({
  onClose,
  onSubmit,
  defaultStart = 136,
  defaultEnd = 186,
}) => {
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
      if (accepted.length) {
        const selectedFile = accepted[0];
        if (selectedFile) {
          setFile(selectedFile);
        }
      }
    },
  });

  const handleSubmit = () => {
    if (!isValidRange(startPage, endPage, versionIso) || !file) return;
    const formatted = formatDate(versionIso);
    onSubmit({ startPage, endPage, version: formatted, file });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Procesar PDF – Código Urbanístico
        </h3>
        <FormFields
          startPage={startPage}
          endPage={endPage}
          versionIso={versionIso}
          onStartPageChange={setStartPage}
          onEndPageChange={setEndPage}
          onVersionChange={setVersionIso}
          file={file}
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          onRemove={() => setFile(null)}
          onOpen={open}
        />
        <div className="flex justify-end space-x-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`btn-primary ${!isValidRange(startPage, endPage, versionIso) || !file ? 'opacity-50 pointer-events-none' : ''}`}
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
