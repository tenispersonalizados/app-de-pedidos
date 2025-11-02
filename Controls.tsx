
import React from 'react';

interface ControlsProps {
  onDownloadJpg: () => void;
  onDownloadPdf: () => void;
  onSaveOrder: () => void;
  onDownloadOrder: () => void;
  isEditing: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onDownloadJpg, onDownloadPdf, onSaveOrder, onDownloadOrder, isEditing }) => {
  return (
    <div className="mt-8 flex justify-center items-center gap-4 flex-wrap p-6 border-t-2 border-gray-100 ignore-on-export" aria-label="Area de controles">
      <button
        onClick={onSaveOrder}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        {isEditing ? 'Actualizar Pedido' : 'Guardar Pedido'}
      </button>
      <button
        onClick={onDownloadOrder}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        Imprimir Pedido
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
