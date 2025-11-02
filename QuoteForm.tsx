import React from 'react';
import { PRODUCTION_TIME_OPTIONS, QUOTE_PROFILE_OPTIONS } from '../config';

interface QuoteFormProps {
    clientName: string;
    setClientName: (value: string) => void;
    profile: string;
    setProfile: (value: string) => void;
    pairs: string;
    setPairs: (value:string) => void;
    pricePerPair: string;
    setPricePerPair: (value: string) => void;
    productionTime: string;
    setProductionTime: (value: string) => void;
    shippingCostPerBox: string;
    setShippingCostPerBox: (value: string) => void;
    boxes: string;
    setBoxes: (value: string) => void;
    totalShipping: number;
    subtotal: number;
    iva: number;
    total: number;
    attachedImageUrl: string | null;
    handleAttachedImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    setter(value);
};

const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value;
    // Extract digits and a single decimal point
    const digitsOnly = value.replace(/[^\d.]/g, '');
    const parts = digitsOnly.split('.');
    const sanitizedValue = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : digitsOnly;
    
    if (sanitizedValue) {
        setter(`$${sanitizedValue}`);
    } else {
        setter('');
    }
};

export const QuoteForm: React.FC<QuoteFormProps> = (props) => {
  return (
    <div className="bg-white p-10 font-sans" style={{ width: '816px', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4">
            <h1 className="text-5xl font-bold">COTIZACIÓN</h1>
            <div className="text-right">
                <h2 className="text-3xl font-bold">Fábrica de Tenis Personalizados</h2>
                <p className="text-gray-600">www.tenispersonalizados.com</p>
            </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-4 gap-4 mt-6">
            <input type="text" placeholder="CLIENTE" value={props.clientName} onChange={e => props.setClientName(e.target.value)} className="col-span-2 bg-gray-100 p-2 border border-gray-300 text-center font-bold" />
            <select 
                value={props.profile} 
                onChange={e => props.setProfile(e.target.value)} 
                className="col-span-1 bg-gray-100 p-2 border border-gray-300 text-center font-bold"
                style={!props.profile ? { fontSize: '115%' } : {}}
            >
                <option value="">- SELECCIONA -</option>
                {QUOTE_PROFILE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input type="text" placeholder="FECHA" defaultValue={new Date().toLocaleDateString('es-MX')} className="col-span-1 bg-gray-100 p-2 border border-gray-300 text-center" />
        </div>

        {/* Main calculation grid */}
        <div className="grid grid-cols-3 gap-6 mt-6 text-center">
            <div>
                <div className="bg-black text-white font-bold p-2 text-sm">CANTIDAD</div>
                <div className="bg-[#C9F5F8] text-black w-full p-4 border-2 border-black flex items-center justify-center">
                    <input type="text" value={props.pairs} onChange={e => handleNumericChange(e, props.setPairs)} className="bg-transparent text-black w-1/2 text-5xl font-bold focus:outline-none text-center" placeholder="0" />
                    <span className="text-3xl font-bold ml-2">PARES</span>
                </div>
            </div>
            <div>
                <div className="bg-black text-white font-bold p-2 text-sm flex flex-col justify-center items-center h-[42px]">
                    <span>PRECIO POR PAR</span>
                    <span className="font-normal text-xs">más IVA</span>
                </div>
                <div className="border-2 border-black bg-[#C9F5F8] flex items-center justify-center">
                    <input type="text" value={props.pricePerPair} onChange={e => handleCurrencyChange(e, props.setPricePerPair)} className="bg-transparent text-black w-full p-4 text-4xl font-bold focus:outline-none text-center" placeholder="$0.00" />
                </div>
            </div>
            <div>
                <div className="bg-black text-white font-bold p-2 text-sm flex flex-col justify-center items-center h-[42px]">
                    <span>TIEMPO DE FABRICACIÓN</span>
                    <span className="font-normal text-xs">a partir de anticipo</span>
                </div>
                <div className="bg-[#C9F5F8] text-black w-full p-2 border-2 border-black flex flex-col justify-center h-[76px]">
                     <select value={props.productionTime} onChange={e => props.setProductionTime(e.target.value)} className="bg-transparent text-black w-full text-xl font-bold focus:outline-none text-center" required>
                        <option value="" disabled>- Selecciona -</option>
                        {PRODUCTION_TIME_OPTIONS.map(opt => <option key={opt} value={`${opt} días naturales`}>{`${opt} días naturales`}</option>)}
                     </select>
                     <p className="text-[10px]">+ 2 a 5 días de envío por paquetería</p>
                </div>
            </div>
        </div>

        {/* Shipping and Totals */}
        <div className="grid grid-cols-3 gap-6 mt-6 text-center">
            <div>
                <div className="bg-black text-white font-bold p-2 text-sm">COSTO DE ENVÍO POR CADA CAJA <span className="font-normal text-xs">(a cada caja le caben 20 pares)</span></div>
                <div className="border-2 border-black bg-gray-100 flex items-center justify-center text-4xl">
                    <input type="text" value={props.shippingCostPerBox} onChange={e => handleCurrencyChange(e, props.setShippingCostPerBox)} className="bg-transparent w-full p-4 font-bold focus:outline-none text-center" placeholder="$0.00"/>
                </div>
            </div>
            <div>
                <div className="bg-black text-white font-bold p-2 text-sm">CANTIDAD DE CAJAS</div>
                <input type="text" value={props.boxes} onChange={e => handleNumericChange(e, props.setBoxes)} className="bg-gray-100 text-black w-full p-4 text-4xl font-bold border-2 border-black text-center" placeholder="0" />
            </div>
            <div>
                <div className="bg-black text-white font-bold p-2 text-sm">COSTO TOTAL DEL ENVÍO</div>
                <div className="bg-gray-100 text-black w-full p-4 text-2xl font-bold border-2 border-black h-[76px] flex items-center justify-center">
                    {formatCurrency(props.totalShipping)}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 mt-4">
            <div></div>
            <div className="space-y-2">
                <div className="flex justify-between items-center font-bold">
                    <p className="text-xl">SUBTOTAL</p>
                    <p className="text-2xl">{formatCurrency(props.subtotal)}</p>
                </div>
                 <div className="flex justify-between items-center font-bold">
                    <p className="text-xl">I.V.A.</p>
                    <p className="text-2xl">{formatCurrency(props.iva)}</p>
                </div>
                <div className="flex justify-between items-center font-bold text-3xl bg-[#C9F5F8] p-3">
                    <p>TOTAL</p>
                    <p>{formatCurrency(props.total)}</p>
                </div>
            </div>
        </div>
        
        {/* Attached Image Section */}
        <div className="mt-8 image-export-container">
            <input 
                type="file" 
                id="quote-image-upload" 
                className="hidden" 
                onChange={props.handleAttachedImageUpload} 
                accept="image/*" 
            />
            {props.attachedImageUrl && (
                <div className="w-full border border-gray-300 p-2 mb-4">
                    <img src={props.attachedImageUrl} alt="Imagen adjunta" className="w-full object-contain max-h-[48rem]" />
                </div>
            )}
            <div className="text-center">
                <label htmlFor="quote-image-upload" className="cursor-pointer text-gray-600 hover:text-blue-600 font-semibold text-xs transition-colors underline">
                    {props.attachedImageUrl ? 'CAMBIAR IMAGEN' : 'ADJUNTAR IMAGEN'}
                </label>
            </div>
        </div>


        {/* Terms */}
        <div className="mt-10 text-xl">
            <ul className="list-disc list-inside space-y-2">
                <li>Tallas del #22 al #30</li>
                <li>Debe ser el mismo diseño por cada pedido.</li>
                <li>Se pueden mezclar diferentes tallas en el mismo pedido.</li>
                <li>Forma de pago: 50% anticipo y 50% antes de embarque.</li>
                <li className="mt-2">
                    Los tenis son fabricados por completo desde cero para cada cliente. Agradecemos tu comprensión del tiempo necesario para fabricarlos. <span className="font-bold">Favor de considerarlo para colocar el pedido con anticipación.</span>
                </li>
            </ul>
        </div>
    </div>
  );
};
