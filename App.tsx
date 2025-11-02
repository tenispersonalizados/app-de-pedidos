
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import ReactCrop, { type Crop, centerCrop } from 'react-image-crop';
import { OrderForm } from './components/OrderForm';
import { Controls } from './components/Controls';
import { OrderHistory } from './components/OrderHistory';
import { Home } from './components/Home';
import { TallasSheet } from './components/TallasSheet';
import { ProductionSheet } from './components/ProductionSheet';
import { MaterialsSheet } from './components/MaterialsSheet';
import { QuoteForm } from './components/QuoteForm';
import { QuoteControls } from './components/QuoteControls';
import { QuoteHistory } from './components/QuoteHistory';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SizeQuantities, Order, Quote } from './types';
import { SIZES_CONFIG } from './config';
import { MobileZoomControl } from './components/MobileZoomControl';

// This is to inform TypeScript about the global variables from the CDN
declare const html2canvas: any;
declare const jspdf: any;

// =================================================================
// Sales History Components
// =================================================================
interface SalesHistoryProps {
    orders: Order[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
};

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <div className="flex items-center">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const SizeDistributionChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
    // FIX: Cast Object.values(data) to number[] to satisfy Math.max which expects numbers.
    const maxQuantity = Math.max(...(Object.values(data) as number[]), 1); // Avoid division by zero

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Distribución de Tallas (Todos los Pedidos)</h3>
            <div className="flex justify-around items-end h-64 border-b-2 border-gray-300 pb-4 gap-2">
                {/* FIX: Use Object.keys and access data[size] to ensure 'quantity' is a number and avoid type errors. */}
                {Object.keys(data).map((size) => {
                    const quantity = data[size];
                    return (
                        <div key={size} className="flex flex-col items-center justify-end h-full w-full text-center group" title={`${size}: ${quantity} pares`}>
                            <div className="text-sm font-semibold text-gray-700 mb-1">{quantity > 0 ? quantity : ''}</div>
                            <div 
                                className="w-10/12 bg-blue-500 group-hover:bg-blue-600 transition-colors rounded-t-md"
                                style={{ height: `${(quantity / maxQuantity) * 100}%` }}
                            ></div>
                            <div className="mt-2 font-bold text-gray-800 text-xs sm:text-sm">{size}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MonthlySalesChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
    const sortedMonths = Object.keys(data).sort();
    const chartData = sortedMonths.map(key => ({
        key,
        value: data[key],
        // Use a UTC-based date to prevent timezone from shifting month, then format
        label: new Date(`${key}-02T00:00:00Z`).toLocaleString('es-ES', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    }));
    
    const maxSales = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Pares Vendidos por Mes</h3>
            <div className="flex justify-around items-end h-64 border-b-2 border-gray-300 pb-4 gap-2">
                {chartData.map(({ key, value, label }) => (
                    <div key={key} className="flex flex-col items-center justify-end h-full w-full text-center group" title={`${label}: ${value} pares`}>
                        <div className="text-sm font-semibold text-gray-700 mb-1">{value > 0 ? value : ''}</div>
                        <div
                            className="w-10/12 bg-green-500 group-hover:bg-green-600 transition-colors rounded-t-md"
                            style={{ height: `${(value / maxSales) * 100}%` }}
                        ></div>
                        <div className="mt-2 font-bold text-gray-800 text-xs sm:text-sm capitalize">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryDistributionCard: React.FC<{ title: string; data: { [key: string]: number } }> = ({ title, data }) => {
    // FIX: Explicitly cast the result of Object.entries to [string, number][] to ensure
    // TypeScript correctly infers the types for sorting and mapping, fixing multiple type errors.
    const sortedEntries = (Object.entries(data) as [string, number][]).sort(([, a], [, b]) => b - a);

    if (sortedEntries.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <ul className="space-y-2">
                {sortedEntries.map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">{key}</span>
                        <span className="font-bold bg-gray-200 px-2 py-1 rounded-md text-sm">{formatNumber(value)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const SalesHistory: React.FC<SalesHistoryProps> = ({ orders }) => {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    const availableYears = useMemo(() => {
        if (!orders) return [];
        const years = new Set(orders.map(o => {
            try {
                return new Date(o.startDate).getUTCFullYear().toString();
            } catch {
                return null;
            }
        }).filter(Boolean));
        // @ts-ignore
        return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(order => {
            try {
                const date = new Date(order.startDate);
                if (isNaN(date.getTime())) return false; // Skip invalid dates
                const yearMatches = selectedYear === 'all' || date.getUTCFullYear().toString() === selectedYear;
                const monthMatches = selectedMonth === 'all' || (date.getUTCMonth() + 1).toString() === selectedMonth;
                return yearMatches && monthMatches;
            } catch {
                return false;
            }
        });
    }, [orders, selectedYear, selectedMonth]);

    const stats = useMemo(() => {
        if (!filteredOrders || filteredOrders.length === 0) {
            return { totalOrders: 0, totalPairs: 0, totalRevenue: 0, totalIVA: 0, totalShipping: 0, totalDeposit: 0, totalBoxes: 0 };
        }
        return filteredOrders.reduce((acc, order) => {
            acc.totalOrders += 1;
            acc.totalPairs += order.totalPairs || 0;
            acc.totalRevenue += order.total || 0;
            acc.totalIVA += order.iva || 0;
            acc.totalShipping += order.totalShippingCost || 0;
            acc.totalDeposit += order.deposit || 0;
            acc.totalBoxes += order.totalBoxes || 0;
            return acc;
        }, { totalOrders: 0, totalPairs: 0, totalRevenue: 0, totalIVA: 0, totalShipping: 0, totalDeposit: 0, totalBoxes: 0 });
    }, [filteredOrders]);

    const sizeDistribution = useMemo(() => {
        const totals = SIZES_CONFIG.reduce((acc, size) => ({ ...acc, [size]: 0 }), {} as { [key: string]: number });
        if (!filteredOrders) return totals;
        for (const order of filteredOrders) {
            for (const size of SIZES_CONFIG) {
                totals[size] += order.sizes[size] || 0;
            }
        }
        return totals;
    }, [filteredOrders]);

    const monthlySales = useMemo(() => {
        const sales: { [key: string]: number } = {};
        if (!filteredOrders) return sales;
        for (const order of filteredOrders) {
            try {
                if (order.startDate && !isNaN(new Date(order.startDate).getTime())) {
                    const date = new Date(order.startDate);
                    const monthKey = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                    sales[monthKey] = (sales[monthKey] || 0) + order.totalPairs;
                }
            } catch (e) {
                console.error(`Invalid date found for order ${order.id}: ${order.startDate}`, e);
            }
        }
        return sales;
    }, [filteredOrders]);

    const categoryDistributions = useMemo(() => {
        const distributions = { orderType: {}, model: {}, profile: {} };
        if (!filteredOrders) return distributions;
        for (const order of filteredOrders) {
            // @ts-ignore
            if (order.orderType) distributions.orderType[order.orderType] = (distributions.orderType[order.orderType] || 0) + 1;
            // @ts-ignore
            if (order.model) distributions.model[order.model] = (distributions.model[order.model] || 0) + 1;
            // @ts-ignore
            if (order.profile) distributions.profile[order.profile] = (distributions.profile[order.profile] || 0) + 1;
        }
        return distributions;
    }, [filteredOrders]);

    const totalPairsSold = useMemo(() => (Object.values(sizeDistribution) as number[]).reduce((a, b) => a + b, 0), [sizeDistribution]);

    if (orders.length === 0) {
        return (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">No hay pedidos para mostrar.</h2>
          </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 bg-gray-50 rounded-lg space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Resumen General de Ventas</h2>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-white p-4 rounded-lg shadow-md">
                <div className="w-full sm:w-auto">
                    <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">Año:</label>
                    <select id="year-filter" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        {availableYears.map(year => <option key={year} value={year}>{year === 'all' ? 'Todos los Años' : year}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-auto">
                    <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">Mes:</label>
                    <select id="month-filter" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option value="all">Todos los Meses</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center p-8 bg-gray-100 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-700">No se encontraron pedidos para el período seleccionado.</h2>
                </div>
            ) : (
                <>
                    {totalPairsSold > 0 && <SizeDistributionChart data={sizeDistribution} />}
                    {Object.keys(monthlySales).length > 0 && 
                        <div className="mt-8">
                            <MonthlySalesChart data={monthlySales} />
                        </div>
                    }

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <StatCard title="Pedidos Totales" value={formatNumber(stats.totalOrders)} color="border-blue-500" />
                        <StatCard title="Pares Vendidos" value={formatNumber(stats.totalPairs)} color="border-green-500" />
                        <StatCard title="Cajas Totales" value={formatNumber(stats.totalBoxes)} color="border-teal-500" />
                        <StatCard title="Ingresos Totales (Venta)" value={formatCurrency(stats.totalRevenue)} color="border-yellow-500" />
                        <StatCard title="Anticipos Recibidos" value={formatCurrency(stats.totalDeposit)} color="border-purple-500" />
                        <StatCard title="IVA Total" value={formatCurrency(stats.totalIVA)} color="border-red-500" />
                        <StatCard title="Costo de Envío Total" value={formatCurrency(stats.totalShipping)} color="border-indigo-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CategoryDistributionCard title="Distribución por Tipo" data={categoryDistributions.orderType} />
                        <CategoryDistributionCard title="Distribución por Modelo" data={categoryDistributions.model} />
                        <CategoryDistributionCard title="Distribución por Perfil" data={categoryDistributions.profile} />
                    </div>
                </>
            )}
        </div>
    );
};


// =================================================================
// Image Cropper Modal Component and Helpers
// =================================================================

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const targetWidth = crop.width;
    const targetHeight = crop.height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Could not get canvas context'));
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = targetWidth * pixelRatio;
    canvas.height = targetHeight * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        targetWidth,
        targetHeight
    );

    return new Promise((resolve) => {
        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleConfirmCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
        onCropComplete(croppedImageUrl);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop({ unit: '%', width: 80, height: 80 }, width, height);
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Recortar Imagen</h2>
        <div className="flex justify-center items-center flex-grow mb-4">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img 
                ref={imgRef} 
                src={imageSrc} 
                onLoad={onImageLoad} 
                style={{ maxHeight: '65vh', objectFit: 'contain' }} 
                alt="Imagen para recortar" 
              />
            </ReactCrop>
        </div>
        <div className="mt-auto flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmCrop}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!completedCrop?.width || !completedCrop?.height}
          >
            Confirmar Recorte
          </button>
        </div>
      </div>
    </div>
  );
};


const initialSizes = SIZES_CONFIG.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
}, {} as SizeQuantities);


const withStaticInputs = async (formElement: HTMLElement, callback: () => Promise<void> | void) => {
    const inputsAndSelects = formElement.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[type="text"], input[type="date"], input[type="number"], select');
    const replacements: { original: HTMLElement, replacement: HTMLElement }[] = [];

    inputsAndSelects.forEach(el => {
        const replacement = document.createElement('div');
        replacement.className = el.className; 
        
        replacement.style.display = 'flex';
        replacement.style.alignItems = 'center';
        replacement.style.height = `${el.offsetHeight}px`;
        replacement.style.width = `${el.offsetWidth}px`;
        replacement.style.boxSizing = 'border-box';
        replacement.style.whiteSpace = 'nowrap'; 
        replacement.style.overflow = 'hidden'; 

        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.textAlign === 'center') {
            replacement.style.justifyContent = 'center';
        } else if (computedStyle.textAlign === 'right') {
            replacement.style.justifyContent = 'flex-end';
        } else {
            replacement.style.justifyContent = 'flex-start';
        }
        
        let valueToDisplay = '';
        if (el.tagName.toLowerCase() === 'select') {
            const select = el as HTMLSelectElement;
            if (select.selectedIndex >= 0) {
                valueToDisplay = select.options[select.selectedIndex].text;
            }
        } else {
            valueToDisplay = (el as HTMLInputElement).value;
        }
        
        replacement.textContent = valueToDisplay;
        
        el.style.display = 'none';
        el.parentNode?.insertBefore(replacement, el);
        replacements.push({ original: el, replacement });
    });

    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await callback();
    } finally {
        replacements.forEach(({ original, replacement }) => {
            original.style.display = ''; 
            replacement.remove();
        });
    }
};

const App: React.FC = () => {
  // =================================================================
  // State Management
  // =================================================================
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('home');
  const [deletionTarget, setDeletionTarget] = useState<{ type: 'order' | 'quote', id: number } | null>(null);

  // State for Order form
  const [clientName, setClientName] = useState('');
  const [orderType, setOrderType] = useState('');
  const [model, setModel] = useState('');
  const [profile, setProfile] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionTime, setProductionTime] = useState('');
  const [pricePerPair, setPricePerPair] = useState('');
  const [shippingPerBox, setShippingPerBox] = useState('');
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [sizes, setSizes] = useState<SizeQuantities>(initialSizes);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // State for Order history
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

  // State for Quote form
  const [quoteClientName, setQuoteClientName] = useState('');
  const [quoteProfile, setQuoteProfile] = useState('');
  const [quotePairs, setQuotePairs] = useState('');
  const [quotePricePerPair, setQuotePricePerPair] = useState('');
  const [quoteProductionTime, setQuoteProductionTime] = useState('');
  const [quoteShippingCost, setQuoteShippingCost] = useState('');
  const [quoteAttachedImageUrl, setQuoteAttachedImageUrl] = useState<string | null>(null);
  const [quoteBoxes, setQuoteBoxes] = useState('');

  // State for Quote history
  const [quoteHistory, setQuoteHistory] = useState<Quote[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);

  const orderFormWrapperRef = useRef<HTMLDivElement>(null);
  const quoteFormWrapperRef = useRef<HTMLDivElement>(null);

  // =================================================================
  // Data Persistence (localStorage)
  // =================================================================

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('orderHistory');
      if (savedHistory) setOrderHistory(JSON.parse(savedHistory));
      
      const savedQuoteHistory = localStorage.getItem('quoteHistory');
      if (savedQuoteHistory) setQuoteHistory(JSON.parse(savedQuoteHistory));
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
    }
  }, []);
  
  // =================================================================
  // Event Handlers: Common
  // =================================================================
  
  const handleAttachedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImageToCrop(reader.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
    if (event.target) event.target.value = '';
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setAttachedImageUrl(croppedImageUrl);
    setImageToCrop(null);
  };
  
  const handleQuoteAttachedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImageToCrop(reader.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
    if (event.target) event.target.value = '';
  };

  const handleQuoteCropComplete = (croppedImageUrl: string) => {
    setQuoteAttachedImageUrl(croppedImageUrl);
    setImageToCrop(null);
  };

  const handleCloseCropper = () => setImageToCrop(null);

  // =================================================================
  // Calculated Values: Order Form
  // =================================================================

  const handleSizeChange = (size: string, quantity: string) => {
    const numQuantity = parseInt(quantity, 10);
    setSizes(prevSizes => ({
      ...prevSizes,
      [size]: isNaN(numQuantity) || numQuantity < 0 ? 0 : numQuantity,
    }));
  };

  const pricePerPairNum = useMemo(() => parseFloat(pricePerPair.replace(/[$,]/g, '')) || 0, [pricePerPair]);
  const shippingPerBoxNum = useMemo(() => parseFloat(shippingPerBox.replace(/[$,]/g, '')) || 0, [shippingPerBox]);

  const totalPairs = useMemo(() => (Object.values(sizes) as number[]).reduce((acc, val) => acc + (val || 0), 0), [sizes]);
  const totalBoxes = useMemo(() => totalPairs > 0 ? Math.ceil(totalPairs / 20) : 0, [totalPairs]);
  const totalShippingCost = useMemo(() => totalBoxes * shippingPerBoxNum, [totalBoxes, shippingPerBoxNum]);
  const subtotal = useMemo(() => (totalPairs * pricePerPairNum) + totalShippingCost, [totalPairs, pricePerPairNum, totalShippingCost]);
  const iva = useMemo(() => subtotal * 0.16, [subtotal]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);
  const deposit = useMemo(() => total / 2, [total]);

  // =================================================================
  // Calculated Values: Quote Form
  // =================================================================
  const quotePairsNum = useMemo(() => parseInt(quotePairs, 10) || 0, [quotePairs]);
  const quotePricePerPairNum = useMemo(() => parseFloat(quotePricePerPair.replace(/[$,]/g, '')) || 0, [quotePricePerPair]);
  const quoteShippingCostNum = useMemo(() => parseFloat(quoteShippingCost.replace(/[$,]/g, '')) || 0, [quoteShippingCost]);

  useEffect(() => {
    const calculatedBoxes = quotePairsNum > 0 ? Math.ceil(quotePairsNum / 20) : 0;
    setQuoteBoxes(String(calculatedBoxes));
  }, [quotePairsNum]);

  const quoteBoxesNum = useMemo(() => parseInt(quoteBoxes, 10) || 0, [quoteBoxes]);
  const quoteTotalShipping = useMemo(() => quoteBoxesNum * quoteShippingCostNum, [quoteBoxesNum, quoteShippingCostNum]);
  const quoteSubtotal = useMemo(() => (quotePairsNum * quotePricePerPairNum), [quotePairsNum, quotePricePerPairNum]);
  const quoteIva = useMemo(() => (quoteSubtotal + quoteTotalShipping) * 0.16, [quoteSubtotal, quoteTotalShipping]);
  const quoteTotal = useMemo(() => quoteSubtotal + quoteTotalShipping + quoteIva, [quoteSubtotal, quoteTotalShipping, quoteIva]);
  
  // =================================================================
  // Download Handlers
  // =================================================================

  const createDownload = async (element: HTMLElement, fileName: string, format: 'jpg' | 'pdf', hasImage: boolean) => {
      if (!element) return;

      const imageContainer = element.querySelector('.image-export-container') as HTMLElement | null;
      const originalDisplay = imageContainer ? imageContainer.style.display : '';

      if (imageContainer && !hasImage) {
          imageContainer.style.display = 'none';
      }

      const controlsElements = element.querySelectorAll('.ignore-on-export');
      const controlsOriginalDisplays: {el: HTMLElement, display: string}[] = [];
      controlsElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        controlsOriginalDisplays.push({ el: htmlEl, display: htmlEl.style.display });
        htmlEl.style.display = 'none';
      });

      try {
          await withStaticInputs(element, async () => {
              const sourceCanvas = await html2canvas(element, {
                  scale: 3, // Higher scale for better quality
                  useCORS: true, 
                  backgroundColor: '#ffffff',
              });

              // Letter size in pixels at 300 DPI for high quality
              const letterWidthPx = 8.5 * 300;
              const letterHeightPx = 11 * 300;

              const targetCanvas = document.createElement('canvas');
              targetCanvas.width = letterWidthPx;
              targetCanvas.height = letterHeightPx;
              const ctx = targetCanvas.getContext('2d');

              if (!ctx) {
                  if (imageContainer && !hasImage) imageContainer.style.display = originalDisplay;
                  return;
              }

              // Fill background with white
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, letterWidthPx, letterHeightPx);

              // Calculate dimensions to fit the content to 100% of the page width, preserving aspect ratio.
              const sourceAspectRatio = sourceCanvas.width / sourceCanvas.height;
              const finalWidth = letterWidthPx; // Use full page width
              const finalHeight = finalWidth / sourceAspectRatio;

              // Position the content at the top-left corner.
              const xOffset = 0;
              const yOffset = 0;

              ctx.drawImage(sourceCanvas, xOffset, yOffset, finalWidth, finalHeight);

              if (format === 'jpg') {
                  const link = document.createElement('a');
                  link.download = `${fileName}.jpg`;
                  link.href = targetCanvas.toDataURL('image/jpeg', 0.95);
                  link.click();
              } else { // pdf
                  const { jsPDF } = jspdf;
                  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
                  const pdfWidthPt = pdf.internal.pageSize.getWidth();
                  const pdfHeightPt = pdf.internal.pageSize.getHeight();
                  
                  const imgData = targetCanvas.toDataURL('image/png');
                  
                  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthPt, pdfHeightPt);
                  pdf.save(`${fileName}.pdf`);
              }
          });
      } finally {
          if (imageContainer && !hasImage) {
              imageContainer.style.display = originalDisplay;
          }
          controlsOriginalDisplays.forEach(({ el, display }) => {
            el.style.display = display;
          });
      }
  };

  const handleDownloadOrderJpg = () => createDownload(orderFormWrapperRef.current!, 'orden_de_compra', 'jpg', !!attachedImageUrl);
  const handleDownloadOrderPdf = () => createDownload(orderFormWrapperRef.current!, 'orden_de_compra', 'pdf', !!attachedImageUrl);
  const handleDownloadQuoteJpg = () => createDownload(quoteFormWrapperRef.current!, 'cotizacion', 'jpg', !!quoteAttachedImageUrl);
  const handleDownloadQuotePdf = () => createDownload(quoteFormWrapperRef.current!, 'cotizacion', 'pdf', !!quoteAttachedImageUrl);
  
  const handleDownloadOrder = useCallback(async () => {
    const formElement = orderFormWrapperRef.current;
    if (!formElement) return;

    const captureComponent = async (element: React.ReactElement): Promise<HTMLCanvasElement> => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);
        const root = ReactDOM.createRoot(container);
        await new Promise<void>(resolve => { root.render(element); setTimeout(resolve, 500); });
        const canvas = await html2canvas(container.firstElementChild as HTMLElement, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
        root.unmount(); document.body.removeChild(container);
        return canvas;
    };

    let formCanvas: HTMLCanvasElement;
    
    const imageContainer = formElement.querySelector('.image-export-container') as HTMLElement | null;
    const originalDisplay = imageContainer ? imageContainer.style.display : '';
    if (imageContainer && !attachedImageUrl) {
        imageContainer.style.display = 'none';
    }

    const controlsElements = formElement.querySelectorAll('.ignore-on-export');
    const controlsOriginalDisplays: {el: HTMLElement, display: string}[] = [];
    controlsElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      controlsOriginalDisplays.push({ el: htmlEl, display: htmlEl.style.display });
      htmlEl.style.display = 'none';
    });

    try {
        await withStaticInputs(formElement, async () => {
            formCanvas = await html2canvas(formElement, { scale: 3, useCORS: true, backgroundColor: '#ffffff', width: formElement.scrollWidth, height: formElement.scrollHeight, windowWidth: formElement.scrollWidth, windowHeight: formElement.scrollHeight });
        });
    } finally {
         if (imageContainer && !attachedImageUrl) {
            imageContainer.style.display = originalDisplay;
        }
        controlsOriginalDisplays.forEach(({ el, display }) => {
          el.style.display = display;
        });
    }
    
    // @ts-ignore
    if (!formCanvas) return;

    const tallasCanvas = await captureComponent(<TallasSheet sizes={sizes} totalPairs={totalPairs} attachedImageUrl={attachedImageUrl} />);
    const productionCanvas = await captureComponent(<ProductionSheet sizes={sizes} totalPairs={totalPairs} attachedImageUrl={attachedImageUrl} />);
    const materialsCanvas = await captureComponent(<MaterialsSheet totalPairs={totalPairs} attachedImageUrl={attachedImageUrl} />);

    const { jsPDF } = jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const addImageToPdfPage = (canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    };
    
    addImageToPdfPage(formCanvas);
    pdf.addPage(); addImageToPdfPage(tallasCanvas);
    pdf.addPage(); addImageToPdfPage(productionCanvas);
    pdf.addPage(); addImageToPdfPage(materialsCanvas);
    pdf.save('pedido_completo.pdf');
  }, [sizes, totalPairs, attachedImageUrl]);

  // =================================================================
  // CRUD Operations: Orders
  // =================================================================
  
  const getEndDate = (startDate: string, productionDays: string): string => {
    const days = parseInt(productionDays.split(' ')[0], 10);
    if (isNaN(days) || !startDate) return startDate;
    const date = new Date(startDate + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
  };
  
  const resetOrderForm = useCallback(() => {
    setClientName(''); setOrderType(''); setModel(''); setProfile('');
    setOrderDate(new Date().toISOString().split('T')[0]); setProductionTime('');
    setPricePerPair(''); setShippingPerBox(''); setAttachedImageUrl(null);
    setSizes(initialSizes); setEditingOrderId(null); setSaveError(null);
  }, []);

  const handleSaveOrder = useCallback(() => {
    setSaveError(null);
    const orderData = {
      status: 'PENDIENTE', paymentStatus: 'ELEGIR OPCION', invoiceStatus: 'ELEGIR OPCION',
      startDate: orderDate, endDate: getEndDate(orderDate, productionTime), orderType, model, profile, clientName, sizes,
      totalPairs, pricePerPair: pricePerPairNum, totalBoxes, shippingPerBox: shippingPerBoxNum, totalShippingCost,
      subtotal, iva, total, deposit, comments: '',
    };

    try {
      let newHistory: Order[];
      if (editingOrderId !== null) {
        newHistory = orderHistory.map(o => o.id === editingOrderId ? { ...o, ...orderData, id: o.id, comments: o.comments, deposit: o.deposit, paymentStatus: o.paymentStatus, invoiceStatus: o.invoiceStatus } : o);
      } else {
        const newOrder: Order = { ...orderData, id: Date.now() };
        newHistory = [newOrder, ...orderHistory];
      }
      localStorage.setItem('orderHistory', JSON.stringify(newHistory));
      setOrderHistory(newHistory);
      resetOrderForm();
      setActiveTab('history');
    } catch (error) {
        console.error("Failed to save order:", error);
        const errorMessage = "Ocurrió un error al guardar el pedido. Por favor, inténtelo de nuevo.";
        setSaveError(errorMessage);
        alert(errorMessage);
    }
  }, [clientName, orderType, model, profile, orderDate, productionTime, pricePerPairNum, shippingPerBoxNum, sizes, totalPairs, totalBoxes, totalShippingCost, subtotal, iva, total, deposit, editingOrderId, resetOrderForm, orderHistory]);

  const handleUpdateOrderInHistory = useCallback((orderId: number, updatedFields: Partial<Order>) => {
    const newHistory = orderHistory.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, ...updatedFields };
        if (updatedFields.startDate && order.startDate && order.endDate) {
          try {
            const duration = new Date(order.endDate).getTime() - new Date(order.startDate).getTime();
            const newEndDate = new Date(new Date(updatedFields.startDate).getTime() + duration);
            updatedOrder.endDate = newEndDate.toISOString().split('T')[0];
          } catch (e) { console.error("Error calculating new end date", e); }
        }
        return updatedOrder;
      }
      return order;
    });

    try {
        localStorage.setItem('orderHistory', JSON.stringify(newHistory));
        setOrderHistory(newHistory);
    } catch(error) {
        console.error("Failed to update order in history:", error);
        alert("Ocurrió un error al actualizar el pedido. El cambio no fue guardado.");
    }
  }, [orderHistory]);

  const handleConfirmDeletion = () => {
    if (!deletionTarget) return;
    try {
        if (deletionTarget.type === 'order') {
            const newHistory = orderHistory.filter(o => o.id !== deletionTarget.id);
            localStorage.setItem('orderHistory', JSON.stringify(newHistory));
            setOrderHistory(newHistory);
        } else if (deletionTarget.type === 'quote') {
            const newHistory = quoteHistory.filter(q => q.id !== deletionTarget.id);
            localStorage.setItem('quoteHistory', JSON.stringify(newHistory));
            setQuoteHistory(newHistory);
        }
    } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Ocurrió un error al eliminar el elemento. La acción no se completó.");
    } finally {
        setDeletionTarget(null);
    }
  };

  const handleCancelDeletion = () => {
      setDeletionTarget(null);
  };

  const handleDeleteOrder = useCallback((orderId: number) => {
    setDeletionTarget({ type: 'order', id: orderId });
  }, []);

  const handleEditOrder = useCallback((orderId: number) => {
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
      setClientName(order.clientName); setOrderType(order.orderType); setModel(order.model);
      setProfile(order.profile); setOrderDate(order.startDate);
      const timeInDays = (new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / 86400000;
      setProductionTime(`${Math.round(timeInDays)} días naturales`);
      setPricePerPair(`$${order.pricePerPair}`); setShippingPerBox(`$${order.shippingPerBox}`);
      setSizes(order.sizes); setEditingOrderId(orderId); setActiveTab('form');
    }
  }, [orderHistory]);

  const handleCopyOrder = useCallback((orderId: number) => {
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
      setClientName(order.clientName);
      setOrderType(order.orderType);
      setModel(order.model);
      setProfile(order.profile);
      setOrderDate(new Date().toISOString().split('T')[0]); // Set to today's date
      const timeInDays = (new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / 86400000;
      setProductionTime(`${Math.round(timeInDays)} días naturales`);
      setPricePerPair(`$${order.pricePerPair}`);
      setShippingPerBox(`$${order.shippingPerBox}`);
      setSizes(order.sizes);
      setAttachedImageUrl(order.attachedImageUrl || null);
      setEditingOrderId(null); // Ensure it's a new order, not editing
      setActiveTab('form');
    }
  }, [orderHistory]);

  const handleReorderOrder = useCallback((orderId: number, direction: 'up' | 'down') => {
    const index = orderHistory.findIndex(o => o.id === orderId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderHistory.length) return;
    
    const newHistory = [...orderHistory];
    const [movedItem] = newHistory.splice(index, 1);
    newHistory.splice(newIndex, 0, movedItem);

    try {
        localStorage.setItem('orderHistory', JSON.stringify(newHistory));
        setOrderHistory(newHistory);
    } catch (error) {
        console.error("Failed to reorder:", error);
        alert("Ocurrió un error al reordenar el pedido. El cambio no fue guardado.");
    }
  }, [orderHistory]);

  // =================================================================
  // CRUD Operations: Quotes
  // =================================================================

  const resetQuoteForm = useCallback(() => {
    setQuoteClientName(''); setQuotePairs(''); setQuotePricePerPair('');
    setQuoteProductionTime(''); setQuoteShippingCost('');
    setQuoteProfile('');
    setQuoteAttachedImageUrl(null);
    setQuoteBoxes('');
    setEditingQuoteId(null);
  }, []);
  
  const handleSaveQuote = useCallback(() => {
      const quoteData = {
        date: new Date().toISOString().split('T')[0],
        clientName: quoteClientName,
        profile: quoteProfile,
        pairs: quotePairsNum,
        pricePerPair: quotePricePerPairNum,
        shippingCostPerBox: quoteShippingCostNum,
        productionTime: quoteProductionTime,
        attachedImageUrl: quoteAttachedImageUrl,
        boxes: quoteBoxesNum,
        totalShipping: quoteTotalShipping,
        subtotal: quoteSubtotal,
        iva: quoteIva,
        total: quoteTotal,
      };

    try {
      let newHistory: Quote[];
      if (editingQuoteId !== null) {
          newHistory = quoteHistory.map(q => q.id === editingQuoteId ? { ...q, ...quoteData, id: q.id } : q);
      } else {
          const newQuote: Quote = { ...quoteData, id: Date.now() };
          newHistory = [newQuote, ...quoteHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      localStorage.setItem('quoteHistory', JSON.stringify(newHistory));
      setQuoteHistory(newHistory);
      resetQuoteForm();
      setActiveTab('quoteHistory');
    } catch (error) {
        console.error("Failed to save quote:", error);
        alert("Ocurrió un error al guardar la cotización. Por favor, inténtelo de nuevo.");
    }
  }, [
    quoteClientName, quoteProfile, quotePairsNum, quotePricePerPairNum, 
    quoteShippingCostNum, quoteProductionTime, quoteAttachedImageUrl, 
    quoteBoxesNum, quoteTotalShipping, quoteSubtotal, quoteIva, quoteTotal, 
    editingQuoteId, resetQuoteForm, quoteHistory
  ]);

  const handleDeleteQuote = useCallback((quoteId: number) => {
    setDeletionTarget({ type: 'quote', id: quoteId });
  }, []);

  const handleEditQuote = useCallback((quoteId: number) => {
      const quote = quoteHistory.find(q => q.id === quoteId);
      if (quote) {
          setQuoteClientName(quote.clientName);
          setQuoteProfile(quote.profile);
          setQuotePairs(String(quote.pairs));
          setQuotePricePerPair(`$${quote.pricePerPair}`);
          setQuoteProductionTime(quote.productionTime);
          setQuoteShippingCost(`$${quote.shippingCostPerBox}`);
          setQuoteBoxes(String(quote.boxes));
          setQuoteAttachedImageUrl(quote.attachedImageUrl || null);
          setEditingQuoteId(quoteId);
          setActiveTab('quoteForm');
      }
  }, [quoteHistory]);

  const handleCopyQuote = useCallback((quoteId: number) => {
    const quote = quoteHistory.find(q => q.id === quoteId);
    if (quote) {
      setQuoteClientName(quote.clientName);
      setQuoteProfile(quote.profile);
      setQuotePairs(String(quote.pairs));
      setQuotePricePerPair(`$${quote.pricePerPair}`);
      setQuoteProductionTime(quote.productionTime);
      setQuoteShippingCost(`$${quote.shippingCostPerBox}`);
      setQuoteBoxes(String(quote.boxes));
      setQuoteAttachedImageUrl(quote.attachedImageUrl || null);
      setEditingQuoteId(null); // Ensure it's a new quote, not editing
      setActiveTab('quoteForm');
    }
  }, [quoteHistory]);

  // =================================================================
  // Main Render
  // =================================================================
  
  return (
    <div className="p-4 sm:p-8 flex flex-col items-center">
      <ConfirmationModal
        isOpen={!!deletionTarget}
        onClose={handleCancelDeletion}
        onConfirm={handleConfirmDeletion}
        title={`Confirmar Eliminación de ${deletionTarget?.type === 'order' ? 'Pedido' : 'Cotización'}`}
        message="¿Estás seguro? Esta acción no se puede deshacer."
      />

      {imageToCrop && (
        <ImageCropperModal 
          imageSrc={imageToCrop} 
          onClose={handleCloseCropper} 
          onCropComplete={activeTab === 'quoteForm' ? handleQuoteCropComplete : handleCropComplete} 
        />
      )}

      <div className="w-full max-w-7xl">
        <div className="flex border-b mb-4 flex-wrap">
           <button onClick={() => setActiveTab('home')} className={`py-2 px-4 font-semibold ${activeTab === 'home' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Inicio</button>
           <button onClick={() => setActiveTab('form')} className={`py-2 px-4 font-semibold ${activeTab === 'form' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Nuevo Pedido</button>
           <button onClick={() => setActiveTab('quoteForm')} className={`py-2 px-4 font-semibold ${activeTab === 'quoteForm' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Nueva Cotización</button>
           <button onClick={() => setActiveTab('history')} className={`py-2 px-4 font-semibold ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Historial de Pedidos</button>
           <button onClick={() => setActiveTab('quoteHistory')} className={`py-2 px-4 font-semibold ${activeTab === 'quoteHistory' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Historial de Cotizaciones</button>
           <button onClick={() => setActiveTab('sales')} className={`py-2 px-4 font-semibold ${activeTab === 'sales' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Informe de Ventas</button>
        </div>

        {activeTab === 'home' && <Home onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'form' && (
          <>
            <MobileZoomControl targetRef={orderFormWrapperRef} />
            <div className="overflow-x-auto py-4">
              <div ref={orderFormWrapperRef} className="min-w-[1200px] mx-auto bg-white rounded-lg shadow-lg p-6">
                <OrderForm clientName={clientName} setClientName={setClientName} orderType={orderType} setOrderType={setOrderType} model={model} setModel={setModel} profile={profile} setProfile={setProfile} orderDate={orderDate} setOrderDate={setOrderDate} productionTime={productionTime} setProductionTime={setProductionTime} pricePerPair={pricePerPair} setPricePerPair={setPricePerPair} shippingPerBox={shippingPerBox} setShippingPerBox={setShippingPerBox} iva={iva} attachedImageUrl={attachedImageUrl} handleAttachedImageUpload={handleAttachedImageUpload} sizes={sizes} handleSizeChange={handleSizeChange} totalPairs={totalPairs} totalBoxes={totalBoxes} totalShippingCost={totalShippingCost} subtotal={subtotal} total={total} deposit={deposit} />
                <Controls onDownloadJpg={handleDownloadOrderJpg} onDownloadPdf={handleDownloadOrderPdf} onSaveOrder={handleSaveOrder} onDownloadOrder={handleDownloadOrder} isEditing={editingOrderId !== null} />
                {saveError && <p className="text-red-600 font-semibold text-center mt-4 ignore-on-export">{saveError}</p>}
              </div>
            </div>
          </>
        )}
        {activeTab === 'history' && <OrderHistory orders={orderHistory} onUpdateOrder={handleUpdateOrderInHistory} onDeleteOrder={handleDeleteOrder} onEditOrder={handleEditOrder} onCopyOrder={handleCopyOrder} onReorderOrder={handleReorderOrder} />}
        {activeTab === 'sales' && <SalesHistory orders={orderHistory} />}
        {activeTab === 'quoteForm' && (
          <>
            <MobileZoomControl targetRef={quoteFormWrapperRef} />
            <div className="overflow-x-auto py-4">
                <div ref={quoteFormWrapperRef} className="min-w-[816px] max-w-[816px] mx-auto bg-white rounded-lg shadow-lg">
                    <QuoteForm 
                        clientName={quoteClientName} 
                        setClientName={setQuoteClientName}
                        profile={quoteProfile}
                        setProfile={setQuoteProfile}
                        pairs={quotePairs} 
                        setPairs={setQuotePairs} 
                        pricePerPair={quotePricePerPair} 
                        setPricePerPair={setQuotePricePerPair} 
                        productionTime={quoteProductionTime} 
                        setProductionTime={setProductionTime} 
                        shippingCostPerBox={quoteShippingCost} 
                        setShippingCostPerBox={setQuoteShippingCost} 
                        boxes={quoteBoxes} 
                        setBoxes={setQuoteBoxes}
                        totalShipping={quoteTotalShipping} 
                        subtotal={quoteSubtotal} 
                        iva={quoteIva} 
                        total={quoteTotal} 
                        attachedImageUrl={quoteAttachedImageUrl}
                        handleAttachedImageUpload={handleQuoteAttachedImageUpload}
                    />
                    <QuoteControls onDownloadJpg={handleDownloadQuoteJpg} onDownloadPdf={handleDownloadQuotePdf} onSave={handleSaveQuote} isEditing={editingQuoteId !== null} />
                </div>
            </div>
          </>
        )}
        {activeTab === 'quoteHistory' && <QuoteHistory quotes={quoteHistory} onEdit={handleEditQuote} onDelete={handleDeleteQuote} onCopy={handleCopyQuote} />}
      </div>
    </div>
  );
};

export default App;
