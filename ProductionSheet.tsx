import React from 'react';
import { SizeQuantities } from '../types';
import { SIZES_CONFIG } from '../config';

interface ProductionSheetProps {
  sizes: SizeQuantities;
  totalPairs: number;
  attachedImageUrl: string | null;
}

export const ProductionSheet: React.FC<ProductionSheetProps> = ({ sizes, totalPairs, attachedImageUrl }) => {
  return (
    <div className="bg-white p-8 font-sans" style={{ width: '816px', height: '1056px', fontFamily: 'Arial, sans-serif' }}>
      <h1 className="text-5xl font-extrabold text-center mb-10" style={{ color: '#000000' }}>
        HOJA DE PRODUCCIÓN
      </h1>
      
      <div className="grid grid-cols-10 text-center">
        {/* Headers */}
        {SIZES_CONFIG.map(size => (
          <div key={size} className="bg-black text-white py-1 border-r border-gray-500">
            <p className="text-sm font-semibold">TALLA</p>
            <p className="font-bold text-2xl">{size}</p>
          </div>
        ))}
        <div className="bg-black text-white py-1 flex items-center justify-center">
          <p className="font-bold text-sm">TOTAL PARES</p>
        </div>

        {/* Quantities */}
        {SIZES_CONFIG.map(size => (
          <div key={`${size}-val`} className="bg-[#EBF8FF] border border-gray-400 flex items-center justify-center text-4xl font-bold h-20">
            {sizes[size] || '0'}
          </div>
        ))}
        <div className="bg-[#C9F5F8] border border-gray-400 flex items-center justify-center text-4xl font-bold h-20">
          {totalPairs}
        </div>
      </div>

      <div className="border border-black w-full mt-12 flex items-center justify-center" style={{height: '600px'}}>
        {attachedImageUrl ? (
          <img src={attachedImageUrl} alt="Imagen adjunta" className="w-full h-full object-contain p-4" />
        ) : (
          <p className="text-4xl text-gray-500 tracking-wider">IMAGEN ADJUNTA</p>
        )}
      </div>
    </div>
  );
};
