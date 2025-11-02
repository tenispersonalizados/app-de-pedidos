import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="bg-[#E1F8F6] p-4" style={{ color: '#005E59' }}>
      <h3 className="font-bold uppercase mb-3">TERMINOS Y CONDICIONES DEL CONTRATO:</h3>
      <div className="space-y-3">
          <strong>Aceptación del Pedido:</strong> Al realizar el pedido (mediante pago, email, mensaje o factura), el cliente acepta las cantidades, tallas, costos y diseños especificados. 
          <strong>Variaciones del Producto:</strong> El diseño adjunto es una representación. Al ser calzado artesanal, el cliente acepta posibles variaciones en colores, texturas y en la posición/tamaño de los gráficos del producto final.
          <strong>Tiempos de Fabricación y Envío:</strong> El tiempo de fabricación (en días naturales) inicia al confirmar el pago. Los días de envío por paquetería son adicionales.
          <strong>Propiedad Intelectual e Indemnización:</strong> El cliente garantiza poseer los derechos de propiedad intelectual/industrial de los diseños solicitados. El cliente se compromete a indemnizar y liberar al fabricante y vendedor de cualquier reclamación, costo o daño derivado del uso no autorizado de dichos derechos.
      </div>
    </div>
  );
};
