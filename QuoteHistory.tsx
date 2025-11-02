import React from 'react';
import { Quote } from '../types';

interface QuoteHistoryProps {
    quotes: Quote[];
    onEdit: (quoteId: number) => void;
    onDelete: (quoteId: number) => void;
    onCopy: (quoteId: number) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString + 'T00:00:00Z'); // Treat as UTC
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    } catch {
        return dateString;
    }
};

export const QuoteHistory: React.FC<QuoteHistoryProps> = ({ quotes, onEdit, onDelete, onCopy }) => {
    if (quotes.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">No hay cotizaciones guardadas.</h2>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full text-sm whitespace-nowrap">
                <thead className="bg-black text-white uppercase">
                    <tr>
                        <th className="p-3 text-left font-bold tracking-wider">Fecha</th>
                        <th className="p-3 text-left font-bold tracking-wider">Cliente</th>
                        <th className="p-3 text-center font-bold tracking-wider">Pares</th>
                        <th className="p-3 text-left font-bold tracking-wider">Total</th>
                        <th className="p-3 text-center font-bold tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {quotes.map(quote => (
                        <tr key={quote.id} className="hover:bg-gray-50">
                            <td className="p-3">{formatDate(quote.date)}</td>
                            <td className="p-3 font-semibold">{quote.clientName}</td>
                            <td className="p-3 text-center">{quote.pairs}</td>
                            <td className="p-3 font-bold">{formatCurrency(quote.total)}</td>
                            <td className="p-3">
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={() => onEdit(quote.id)} className="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>
                                    <button onClick={() => onCopy(quote.id)} className="text-green-600 hover:text-green-800 font-semibold">Copiar</button>
                                    <button onClick={() => onDelete(quote.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};