import React, { useState, useEffect, RefObject } from 'react';

interface MobileZoomControlProps {
  targetRef: RefObject<HTMLElement>;
}

export const MobileZoomControl: React.FC<MobileZoomControlProps> = ({ targetRef }) => {
  const [isZoomedOut, setIsZoomedOut] = useState(true);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const applyZoom = () => {
      // Use requestAnimationFrame to ensure calculations happen after layout
      requestAnimationFrame(() => {
        if (!target) return;
        const parent = target.parentElement;
        if (!parent) return;

        if (isZoomedOut) {
          const scale = parent.offsetWidth / target.offsetWidth;
          target.style.transform = `scale(${scale})`;
          target.style.transformOrigin = 'top left';
          parent.style.height = `${target.offsetHeight * scale}px`;
        } else {
          target.style.transform = 'scale(1)';
          target.style.transformOrigin = 'top left';
          parent.style.height = `${target.offsetHeight}px`;
        }
      });
    };

    // Apply zoom on state change and on resize
    applyZoom();
    
    const handleResize = () => {
      applyZoom();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [isZoomedOut, targetRef]);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-gray-800 text-white p-2 w-full flex justify-center shadow-lg">
      <button
        onClick={() => setIsZoomedOut(!isZoomedOut)}
        className="bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-md transition-colors"
      >
        {isZoomedOut ? 'Ver a Tamaño Real' : 'Ajustar a Pantalla'}
      </button>
    </div>
  );
};
