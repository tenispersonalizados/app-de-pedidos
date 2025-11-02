import React from 'react';
import { SizeQuantities } from '../types';
import { Terms } from './Terms';
import { SIZES_CONFIG, PRODUCTION_TIME_OPTIONS } from '../config';

interface OrderFormProps {
  clientName: string;
  setClientName: (value: string) => void;
  orderType: string;
  setOrderType: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  profile: string;
  setProfile: (value: string) => void;
  orderDate: string;
  setOrderDate: (value: string) => void;
  productionTime: string;
  setProductionTime: (value: string) => void;
  pricePerPair: string;
  setPricePerPair: (value: string) => void;
  shippingPerBox: string;
  setShippingPerBox: (value: string) => void;
  iva: number;
  attachedImageUrl: string | null;
  handleAttachedImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sizes: SizeQuantities;
  handleSizeChange: (size: string, quantity: string) => void;
  totalPairs: number;
  totalBoxes: number;
  totalShippingCost: number;
  subtotal: number;
  total: number;
  deposit: number;
}

// Constants are moved outside the component to prevent re-declaration on every render.
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
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

const ORDER_TYPE_OPTIONS = ['PEDIDO', 'MUESTRA KIT', 'MUESTRA PIE', 'MUESTRA PAR', 'MUESTRA INTERNA'];
const MODEL_OPTIONS = ['CASUAL', 'URBAN', 'SANDALIA'];
const PROFILE_OPTIONS = ['DS', 'CF', 'RT', 'INT'];


export const OrderForm: React.FC<OrderFormProps> = (props) => {
  return (
    <div className="bg-white w-full font-sans text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="grid grid-cols-12 gap-2 items-start border-b-4 border-black pb-2">
        <div className="col-span-12">
          <h1 className="text-2xl font-extrabold" style={{ color: '#231F20' }}>
            ORDEN DE COMPRA / TENIS PERSONALIZADOS
          </h1>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {/* Client Name */}
        <div className="grid grid-cols-12 gap-x-2">
            <div className="col-span-4 bg-[#F5EFE1] p-2 flex items-center justify-center">
                <p className="font-bold text-center">NOMBRE DEL CLIENTE</p>
            </div>
            <div className="col-span-8">
                <input 
                    type="text" 
                    value={props.clientName} 
                    onChange={e => props.setClientName(e.target.value)} 
                    className="border border-gray-300 px-3 py-2 w-full text-xl font-bold placeholder:font-bold bg-white"
                    placeholder="Ingrese el nombre del cliente"
                />
            </div>
        </div>

        {/* Top Row: Type, Date, Production Time */}
        <div className="grid grid-cols-12 gap-x-2 gap-y-1">
          {/* Headers */}
          <div className="col-span-6 grid grid-cols-6 gap-1">
            <div className="bg-[#F5EFE1] p-2 flex flex-col justify-center col-span-3">
                <p className="font-bold text-center">TIPO</p>
            </div>
            <div className="bg-[#F5EFE1] p-2 flex flex-col justify-center col-span-2">
                <p className="font-bold text-center">MODELO</p>
            </div>
            <div className="bg-[#F5EFE1] p-2 flex flex-col justify-center col-span-1">
                <p className="font-bold text-center">PERFIL</p>
            </div>
          </div>
          <div className="col-span-2 bg-[#F5EFE1] p-2 flex flex-col justify-center">
            <p className="font-bold text-center">FECHA DE PEDIDO</p>
          </div>
          <div className="col-span-4 bg-[#F5EFE1] p-2 flex flex-col text-xs justify-center">
            <p className="font-bold text-center">TIEMPO DE FABRICACIÓN</p>
            <p className="text-center">A PARTIR DEL PAGO</p>
          </div>

          {/* Inputs */}
          <div className="col-span-6 grid grid-cols-6 gap-1">
            <select value={props.orderType} onChange={e => props.setOrderType(e.target.value)} className="border border-gray-300 px-3 py-2 w-full text-xl text-left bg-white col-span-3" required>
                <option value="" disabled>- Selecciona -</option>
                {ORDER_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select value={props.model} onChange={e => props.setModel(e.target.value)} className="border border-gray-300 px-3 py-2 w-full text-xl text-left bg-white col-span-2" required>
                <option value="" disabled>- Selecciona -</option>
                {MODEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select value={props.profile} onChange={e => props.setProfile(e.target.value)} className="border border-gray-300 px-3 py-2 w-full text-xl text-left bg-white col-span-1" required>
                <option value="" disabled>- Selecciona -</option>
                {PROFILE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <input type="date" value={props.orderDate} onChange={e => props.setOrderDate(e.target.value)} className="border border-gray-300 px-3 py-2 w-full text-xl bg-white"/>
          </div>
          <div className="col-span-4">
            <select value={props.productionTime} onChange={e => props.setProductionTime(e.target.value)} className="border border-gray-300 px-3 py-2 w-full text-xl text-center bg-white" required>
                <option value="" disabled>- Selecciona una opción -</option>
                {PRODUCTION_TIME_OPTIONS.map(opt => <option key={opt} value={`${opt} días naturales`}>{`${opt} días naturales`}</option>)}
            </select>
          </div>
        </div>

        {/* Bottom Row: Pricing, Shipping, and Totals */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-2 mt-4 items-start">
          {/* Pricing & Shipping Inputs */}
          <div className="col-span-5 space-y-2">
            <div className="grid grid-cols-3 gap-1">
              <div className="bg-[#F5EFE1] p-2 text-center flex flex-col justify-center">
                <p className="font-bold">PRECIO POR PAR</p>
              </div>
              <div className="bg-[#F5EFE1] p-2 text-center flex flex-col justify-center">
                <p className="font-bold text-xs">PRECIO DE ENVIO POR CADA CAJA</p>
              </div>
              <div className="bg-[#F5EFE1] p-2 text-center flex flex-col justify-center">
                <p className="font-bold text-xs">COSTO TOTAL DEL ENVIO</p>
                <p className="text-xs font-normal">(TODAS LAS CAJAS)</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <input type="text" value={props.pricePerPair} onChange={e => handleCurrencyChange(e, props.setPricePerPair)} className="border border-gray-300 px-2 py-2 w-full text-xl text-center bg-white" placeholder="$0.00"/>
              <input type="text" value={props.shippingPerBox} onChange={e => handleCurrencyChange(e, props.setShippingPerBox)} className="border border-gray-300 px-2 py-2 w-full text-xl text-center bg-white" placeholder="$0.00"/>
              <div className="border border-gray-300 px-2 py-2 text-center flex items-center justify-center text-xl">
                  {formatCurrency(props.totalShippingCost)}
              </div>
            </div>
          </div>
          
          {/* Equals Sign */}
          <div className="flex col-span-1 items-center justify-center text-3xl font-bold h-full">
            =
          </div>

          {/* Totals Summary */}
          <div className="col-span-6 space-y-1">
            <div className="grid grid-cols-3 items-center">
                <p className="font-bold col-span-1">SUBTOTAL</p>
                <p className="col-span-2 text-right text-xl">{formatCurrency(props.subtotal)}</p>
            </div>
            <div className="grid grid-cols-3 items-center">
                <p className="font-bold col-span-1">I.V.A. (16%)</p>
                <div className="col-span-2 px-2 py-3 text-right w-full flex items-center justify-end text-xl">
                  {formatCurrency(props.iva)}
                </div>
            </div>
            <div className="bg-[#C9F5F8] text-black p-2 flex justify-between items-center font-bold">
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl">TOTAL</p>
                    <p className="text-2xl font-normal">(IVA INCLUIDO)</p>
                </div>
                <p className="text-right text-2xl">{formatCurrency(props.total)}</p>
            </div>
            <div className="text-black p-2 grid grid-cols-2 items-center font-bold" style={{backgroundColor: '#92D050'}}>
                <p className="text-2xl">ANTICIPO 50%</p>
                <p className="text-right text-2xl">{formatCurrency(props.deposit)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sizes Grid */}
      <div className="mt-4">
        <div className="grid grid-cols-11 text-center">
            {SIZES_CONFIG.map(size => (
                <div key={size} className="bg-[#231F20] text-white p-2 border-r border-gray-500">
                    <p className="text-xs">TALLA</p>
                    <p className="font-bold text-xl">{size}</p>
                </div>
            ))}
            <div className="bg-gray-700 text-white p-2 flex flex-col justify-center border-r border-gray-500 col-span-1">
                <p className="font-bold">TOTAL DE PARES</p>
            </div>
            <div className="bg-gray-700 text-white p-2 flex flex-col justify-center col-span-1">
                <p className="font-bold">TOTAL DE CAJAS</p>
            </div>

            {SIZES_CONFIG.map(size => (
                 <input key={size} type="number" min="0" value={props.sizes[size] || ''} onChange={e => props.handleSizeChange(size, e.target.value)} className="border border-gray-300 px-2 py-2 w-full text-3xl font-bold text-center bg-white"/>
            ))}
            <div className="bg-[#C9F5F8] flex items-center justify-center text-2xl font-bold">{props.totalPairs}</div>
            <div className="bg-[#C9F5F8] flex items-center justify-center text-2xl font-bold">{props.totalBoxes}</div>
        </div>
      </div>

      {/* Attached Image Section */}
      <div className="mt-8 image-export-container">
          <input 
            type="file" 
            id="attached-image-upload" 
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
              <label htmlFor="attached-image-upload" className="cursor-pointer text-gray-600 hover:text-blue-600 font-semibold text-xs transition-colors underline">
                  {props.attachedImageUrl ? 'CAMBIAR IMAGEN' : 'ADJUNTAR IMAGEN'}
              </label>
          </div>
      </div>
      
      <div className="mt-8">
        <Terms />
      </div>
    </div>
  );
};
