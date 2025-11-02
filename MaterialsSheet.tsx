import React from 'react';
import { SIZES_CONFIG } from '../config';

interface MaterialsSheetProps {
  totalPairs: number;
  attachedImageUrl: string | null;
}

// Helper components for repeated structures
const SizeHeader = () => (
    <div className="grid grid-cols-12">
        <div className="col-span-3"></div>
        <div className="col-span-9 grid grid-cols-9 text-center bg-black text-white font-bold text-xs">
            {SIZES_CONFIG.map(s => <div key={s} className="py-1 border-l border-gray-600"><p>TALLA</p><p>{s}</p></div>)}
        </div>
    </div>
);

const MaterialRow = ({ label }: { label: string }) => (
    <div className="grid grid-cols-12 items-stretch border-t-0 border border-black">
        <div className="col-span-3 bg-gray-100 flex items-center justify-center p-1 border-r border-black">
            <p className="font-bold text-center text-xs uppercase">{label}</p>
        </div>
        <div className="col-span-9 grid grid-cols-9">
            {SIZES_CONFIG.map(s => 
                <div key={s} className="border-l border-black h-8 flex items-center justify-center text-lg font-bold bg-white">0</div>
            )}
        </div>
    </div>
);

const GroupHeader = ({ label, sizes }: { label: string, sizes: string }) => (
    <div className="bg-black text-white text-center py-1 border-l border-gray-600">
        <p className="font-bold text-xs">{label}</p>
        <p className="font-bold text-xs">{sizes}</p>
    </div>
);

const GroupedMaterialRow = ({ label, cols }: { label: string, cols: number }) => (
    <div className="grid grid-cols-12 items-stretch border-t-0 border-l border-r border-black bg-white">
        <div className="col-span-3 bg-gray-100 flex items-center justify-center p-1 border-r border-black">
            <p className="font-bold text-center text-xs uppercase">{label}</p>
        </div>
        <div className={`col-span-9 grid grid-cols-${cols}`}>
            {Array(cols).fill(0).map((_, i) => 
                <div key={i} className="border-l border-black h-8 flex items-center justify-center text-lg font-bold bg-white">0</div>
            )}
        </div>
    </div>
);

export const MaterialsSheet: React.FC<MaterialsSheetProps> = ({ totalPairs, attachedImageUrl }) => {
  return (
    <div className="bg-white p-8 font-sans" style={{ width: '816px', height: '1056px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-5xl font-extrabold" style={{ color: '#000000' }}>MATERIALES</h1>
        <div className="text-center">
          <div className="bg-black text-white p-1 px-4"><p className="font-bold text-xs">TOTAL PARES</p></div>
          <div className="bg-[#C9F5F8] border-2 border-black p-2 text-4xl font-bold h-16 w-32 flex items-center justify-center">{totalPairs}</div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Column */}
        <div className="w-8/12 space-y-4">
          {/* Individual Sizes Table */}
          <div>
            <SizeHeader />
            <MaterialRow label="SUELAS" />
            <MaterialRow label="FORRO PUNTAS" />
            <MaterialRow label="FORRO CHALECOS" />
            <MaterialRow label="PLANTAS" />
          </div>

          {/* Grouped Sizes Header */}
          <div className="grid grid-cols-12">
            <div className="col-span-3"></div>
            <div className="col-span-9 grid grid-cols-4 text-center border-l border-r border-t border-black">
                <GroupHeader label="CH" sizes="#2 #3 #4" />
                <GroupHeader label="MED" sizes="#5 #6" />
                <GroupHeader label="GDE" sizes="#7 #8 #9" />
                <GroupHeader label="XGDE" sizes="#10" />
            </div>
          </div>
          <div className="border-b border-black -mt-4">
              <GroupedMaterialRow label="ESPUMA LENGUAS" cols={4} />
          </div>

           {/* Grouped Sizes Table 2 - a bit different */}
           <div className="border-b border-black">
              <div className="grid grid-cols-12 items-stretch border-l border-r border-black bg-white">
                  <div className="col-span-3 bg-gray-100 flex items-center justify-center p-1 border-r border-black">
                      <p className="font-bold text-center text-xs uppercase">ESPUMA BIGOTES</p>
                  </div>
                  <div className="col-span-9 grid grid-cols-2">
                       <div className="border-l border-black h-8 flex items-center justify-center text-lg font-bold bg-white">0</div>
                       <div className="border-l border-black h-8 flex items-center justify-center text-lg font-bold bg-white">0</div>
                  </div>
              </div>
          </div>
          
           {/* Grouped Sizes Table 3 */}
          <div className="border-b border-black">
              <div className="grid grid-cols-12">
                <div className="col-span-3"></div>
                <div className="col-span-9 grid grid-cols-4 text-center border-l border-r border-t border-black">
                    <GroupHeader label="CH" sizes="#2 #3 #4" />
                    <GroupHeader label="MED" sizes="#5 #6" />
                    <GroupHeader label="GDE" sizes="#7 #8 #9" />
                    <GroupHeader label="XGDE" sizes="#10" />
                </div>
              </div>
              <div className="-mt-4">
                <GroupedMaterialRow label="CASQUILLO" cols={4} />
                <GroupedMaterialRow label="CONTRA FUERTE" cols={4} />
              </div>
          </div>

           {/* Single Value Row */}
           <div className="grid grid-cols-12 items-stretch border border-black">
                <div className="col-span-3 bg-gray-100 flex items-center justify-center p-1 border-r border-black">
                    <p className="font-bold text-center text-xs uppercase">AGUJETAS</p>
                </div>
                <div className="col-span-3">
                     <div className="h-8 flex items-center justify-center text-lg font-bold bg-white border-r border-black">0</div>
                </div>
           </div>
        </div>

        {/* Right Column */}
        <div className="w-4/12">
            <div className="border-2 border-black w-full flex items-center justify-center" style={{ height: '300px' }}>
                {attachedImageUrl ? (
                    <img src={attachedImageUrl} alt="Imagen adjunta" className="w-full h-full object-contain p-2" />
                ) : (
                    <p className="text-xl text-gray-500 tracking-wider">IMAGEN ADJUNTA</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
