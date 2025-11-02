
export interface SizeQuantities {
  [key: string]: number;
}

export interface Order {
  id: number;
  status: string;
  paymentStatus: string;
  invoiceStatus: string;
  startDate: string;
  endDate: string;
  orderType: string;
  model: string;
  profile: string;
  clientName: string;
  sizes: SizeQuantities;
  totalPairs: number;
  pricePerPair: number;
  totalBoxes: number;
  shippingPerBox: number;
  totalShippingCost: number;
  subtotal: number;
  iva: number;
  total: number;
  deposit: number;
  comments: string;
}

export interface Quote {
  id: number;
  date: string;
  clientName: string;
  profile: string;
  pairs: number;
  pricePerPair: number;
  shippingCostPerBox: number;
  productionTime: string;
  attachedImageUrl?: string | null;
  // Calculated fields
  boxes: number;
  totalShipping: number;
  subtotal: number;
  iva: number;
  total: number;
}