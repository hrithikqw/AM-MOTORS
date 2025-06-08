export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  miles: number;
  purchasePrice: number;
  bookValue: number;
  sellingPrice?: number;
  sold: boolean;
  soldDate?: string;
  notes?: string;
  imageUri?: string;
  pdfInvoiceUri?: string;
  createdAt: string;
  expenses: Expense[];
  color?: string;
}

export interface CarStats {
  totalCars: number;
  soldCars: number;
  inventoryCars: number;
  totalInvestment: number;
  totalRevenue: number;
  totalProfit: number;
  averageProfit: number;
  totalBookValue: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}