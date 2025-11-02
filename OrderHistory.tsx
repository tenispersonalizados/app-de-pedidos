import React from 'react';
import { Order } from '../types';
import { SIZES_CONFIG } from '../config';

interface OrderHistoryProps {
    orders: Order[];
    onUpdateOrder: (orderId: number, updatedFields: Partial<Order>) => void;
    onDeleteOrder: (orderId: number) => void;
    onEditOrder: (orderId: number) => void;
    onCopyOrder: (orderId: number) => void;
    onReorderOrder: (orderId: number, direction: 'up' | 'down') => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' });
    const year = date.getUTCFullYear();
    return `${day} / ${month} / ${year}`;
};

// Helper function to determine cell colors based on status
const getStatusColorClasses = (status: string): string => {
    switch (status) {
        // Red for pending actions
        case 'ELEGIR OPCION':
        case 'PENDIENTE':
        case 'POR PAGAR':
            return 'bg-red-100 text-red-800';
        
        // Yellow for in-progress states
        case 'EN PRODUCCIÓN':
        case 'ANTICIPO':
        case 'ADEUDO':
        case 'SI PENDIENTE':
            return 'bg-yellow-100 text-yellow-800';

        // Purple for specific stage
        case 'POR EMPACAR':
            return 'bg-purple-100 text-purple-800';

        // Green for completed states
        case 'ENTREGADO':
        case 'PAGADO':
        case 'FACTURADO':
            return 'bg-green-100 text-green-800';

        // Gray for neutral or void states
        case 'CANCELADO':
        case 'N/A':
        case 'SIN FACTURA':
        case 'SIN IVA':
            return 'bg-gray-200 text-gray-800';
            
        default:
            return 'bg-white text-gray-900';
    }
};

const TABLE_HEADERS = [
    { name: 'STATUS', width: 'min-w-[150px]' },
    { name: '$', width: 'min-w-[150px]' },
    { name: 'FACTURA', width: 'min-w-[150px]' },
    { name: 'FECHA (INICIO)', width: 'min-w-[160px]' },
    { name: 'FECHA (FINAL)', width: 'min-w-[120px]' },
    { name: 'TIPO', width: 'min-w-[100px]' },
    { name: 'MOD', width: 'w-12' },
    { name: 'PER', width: 'w-12' },
    { name: 'CLIENTE/MARCA', width: 'min-w-[200px]' },
    ...SIZES_CONFIG.map(size => ({ name: size, width: 'w-14 text-center' })),
    { name: 'PARES', width: 'w-16 text-center' },
    { name: '$ UNIT.', width: 'min-w-[90px]' },
    { name: 'CAJAS', width: 'w-16 text-center' },
    { name: '$ ENVÍO', width: 'min-w-[90px]' },
    { name: 'SUBTOTAL', width: 'min-w-[120px]' },
    { name: 'IVA', width: 'min-w-[120px]' },
    { name: 'TOTAL', width: 'min-w-[120px]' },
    { name: 'ANTICIPO', width: 'min-w-[140px]' },
    { name: 'COMENTARIOS', width: 'min-w-[250px]' },
    { name: 'ACCIONES', width: 'min-w-[250px]' }
];


export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onUpdateOrder, onDeleteOrder, onEditOrder, onCopyOrder, onReorderOrder }) => {
    
    if (orders.length === 0) {
        return (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">No hay pedidos guardados.</h2>
          </div>
        );
    }
  
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full text-sm whitespace-nowrap">
                <thead className="bg-black text-white uppercase">
                    <tr>
                        {TABLE_HEADERS.map(header => (
                            <th key={header.name} className={`p-3 text-left font-bold tracking-wider ${header.width}`}>{header.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {orders.map((order, index) => {
                        const statusColor = getStatusColorClasses(order.status);
                        const paymentColor = getStatusColorClasses(order.paymentStatus);
                        const invoiceColor = getStatusColorClasses(order.invoiceStatus);

                        return (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className={`p-2 ${statusColor}`}>
                                    <select 
                                        value={order.status}
                                        onChange={(e) => onUpdateOrder(order.id, { status: e.target.value })}
                                        className={`bg-transparent font-semibold p-1 w-full focus:outline-none focus:ring-0 border-none ${statusColor}`}
                                    >
                                        <option value="PENDIENTE">PENDIENTE</option>
                                        <option value="EN PRODUCCIÓN">EN PRODUCCIÓN</option>
                                        <option value="POR EMPACAR">POR EMPACAR</option>
                                        <option value="ENTREGADO">ENTREGADO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </td>
                                <td className={`p-2 ${paymentColor}`}>
                                    <select 
                                        value={order.paymentStatus}
                                        onChange={(e) => onUpdateOrder(order.id, { paymentStatus: e.target.value })}
                                        className={`bg-transparent font-semibold p-1 w-full focus:outline-none focus:ring-0 border-none ${paymentColor}`}
                                    >
                                        <option value="ELEGIR OPCION">ELEGIR OPCION</option>
                                        <option value="POR PAGAR">POR PAGAR</option>
                                        <option value="ANTICIPO">ANTICIPO</option>
                                        <option value="ADEUDO">ADEUDO</option>
                                        <option value="PAGADO">PAGADO</option>
                                        <option value="N/A">N/A</option>
                                    </select>
                                </td>
                                <td className={`p-2 ${invoiceColor}`}>
                                    <select 
                                        value={order.invoiceStatus}
                                        onChange={(e) => onUpdateOrder(order.id, { invoiceStatus: e.target.value })}
                                        className={`bg-transparent font-semibold p-1 w-full focus:outline-none focus:ring-0 border-none ${invoiceColor}`}
                                    >
                                        <option value="ELEGIR OPCION">ELEGIR OPCION</option>
                                        <option value="SIN FACTURA">SIN FACTURA</option>
                                        <option value="SI PENDIENTE">SI PENDIENTE</option>
                                        <option value="FACTURADO">FACTURADO</option>
                                        <option value="SIN IVA">SIN IVA</option>
                                        <option value="N/A">N/A</option>
                                    </select>
                                </td>
                                <td className="p-3">{formatDate(order.startDate)}</td>
                                <td className="p-3">{formatDate(order.endDate)}</td>
                                <td className="p-3">{order.orderType}</td>
                                <td className="p-3">{order.model}</td>
                                <td className="p-3">{order.profile}</td>
                                <td className="p-3 font-semibold">{order.clientName}</td>
                                {SIZES_CONFIG.map(size => (
                                    <td key={size} className="p-3 text-center">{order.sizes[size] || ''}</td>
                                ))}
                                <td className="p-3 text-center font-bold">{order.totalPairs}</td>
                                <td className="p-3">{formatCurrency(order.pricePerPair)}</td>
                                <td className="p-3 text-center">{order.totalBoxes}</td>
                                <td className="p-3">{formatCurrency(order.totalShippingCost)}</td>
                                <td className="p-3">{formatCurrency(order.subtotal)}</td>
                                <td className="p-3">{formatCurrency(order.iva)}</td>
                                <td className="p-3 font-bold">{formatCurrency(order.total)}</td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        defaultValue={typeof order.deposit === 'number' ? formatCurrency(order.deposit) : formatCurrency(0)}
                                        onBlur={(e) => {
                                            const value = parseFloat(e.target.value.replace(/[$,]/g, ''));
                                            if (!isNaN(value)) {
                                                onUpdateOrder(order.id, { deposit: value });
                                            }
                                        }}
                                        className="bg-gray-100 p-1 w-full rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="$0.00"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={order.comments}
                                        onChange={(e) => onUpdateOrder(order.id, { comments: e.target.value })}
                                        className="bg-gray-100 p-1 w-full rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Añadir comentario..."
                                    />
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <button 
                                                onClick={() => onReorderOrder(order.id, 'up')}
                                                disabled={index === 0}
                                                className="text-gray-500 hover:text-gray-800 disabled:opacity-25 disabled:cursor-not-allowed"
                                                aria-label="Mover arriba"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => onReorderOrder(order.id, 'down')}
                                                disabled={index === orders.length - 1}
                                                className="text-gray-500 hover:text-gray-800 disabled:opacity-25 disabled:cursor-not-allowed"
                                                aria-label="Mover abajo"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="h-8 w-px bg-gray-300"></div>
                                        
                                        <button onClick={() => onEditOrder(order.id)} className="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>
                                        <button onClick={() => onCopyOrder(order.id)} className="text-green-600 hover:text-green-800 font-semibold">Copiar</button>
                                        <button onClick={() => onDeleteOrder(order.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
