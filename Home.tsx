import React from 'react';

interface HomeProps {
  onNavigate: (tab: 'form' | 'history' | 'sales' | 'quoteForm' | 'quoteHistory') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-xl w-full md:w-96 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none";

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-lg shadow-xl">
      <div className="flex flex-col items-center gap-8 w-full">
        <button onClick={() => onNavigate('form')} className={buttonStyle}>
          NUEVO PEDIDO
        </button>
        <button onClick={() => onNavigate('history')} className={buttonStyle}>
          HISTORIAL DE PEDIDOS
        </button>
        <button onClick={() => onNavigate('sales')} className={buttonStyle}>
          INFORME DE VENTAS
        </button>
        <button onClick={() => onNavigate('quoteForm')} className={buttonStyle}>
          NUEVA COTIZACIÓN
        </button>
        <button onClick={() => onNavigate('quoteHistory')} className={buttonStyle}>
          HISTORIAL DE COTIZACIONES
        </button>
      </div>
    </div>
  );
};