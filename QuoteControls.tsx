
import React from 'react';

interface QuoteControlsProps {
  onDownloadJpg: () => void;
  onDownloadPdf: () => void;
  onSave: () => void;
  isEditing: boolean;
}

export const QuoteControls: React.FC<QuoteControlsProps> = ({ onDownloadJpg, onDownloadPdf, onSave, isEditing }) => {
  return (
    <div className="mt-8 flex justify-center items-center gap-4 flex-wrap p-6 border-t-2 border-gray-100 ignore-on-export" aria-label="Area de controles de cotización">
      <button
        onClick={onSave}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        {isEditing ? 'Actualizar Cotización' : 'Guardar Cotización'}
      </button>
      <button
        onClick={onDownloadJpg}
        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        Descargar JPG
      </button>
      <button
        onClick={onDownloadPdf}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        Descargar PDF
      </button>
    </div>
  );
};
