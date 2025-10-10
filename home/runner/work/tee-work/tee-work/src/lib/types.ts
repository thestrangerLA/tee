

export type StockItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  costPrice: number; // Cost in Kip
  costPriceBaht: number; // Cost in Baht
  wholesalePrice: number;
  sellingPrice: number;
};

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    date: Date; // Stored as Timestamp in Firestore, converted to Date on client
    amount: number;
    description: string;
    businessType?: 'agriculture' | 'tour' | 'documents' | 'meat-business';
}

export interface AccountSummary {
    id:string;
    cash: number;
    transfer: number;
    capital: number;
    workingCapital?: number;
}

export interface TransportEntry {
    id: string;
    type: 'ANS' | 'HAL' | 'MX';
    date: Date;
    detail: string;
    cost: number;
    amount: number;
    finished: boolean;
    createdAt: Date; 
}

export interface CashCalculatorState {
    id: string;
    counts: Record<string, number>;
}

export interface DebtorCreditorEntry {
  id: string;
  type: 'debtor' | 'creditor';
  date: Date;
  amount: number;
  description: string;
  isPaid: boolean;
  createdAt: Date;
}

export interface DrugCreditorEntry {
  id: string;
  date: Date;
  order: number;
  description: string;
  note?: string;
  cost: number;
  sellingPrice: number;
  isPaid: boolean;
  createdAt: Date;
}

export type Currency = 'LAK' | 'THB' | 'USD' | 'CNY';

export interface TourProgram {
  id: string;
  date: Date;
  tourDates: string;
  tourCode: string;
  programName: string;
  groupName: string;
  pax: number;
  destination: string;
  durationDays: number;
  price: number;
  priceCurrency: Currency;
  bankCharge: number;
  bankChargeCurrency: Currency;
  totalPrice: number;
  createdAt: Date;
}

export interface TourCostItem {
  id: string;
  programId: string;
  date: Date | null;
  detail: string;
  lak: number;
  thb: number;
  usd: number;
  cny: number;
  createdAt: Date;
}

export interface TourIncomeItem {
  id: string;
  programId: string;
  date: Date | null;
  detail: string;
  lak: number;
  thb: number;
  usd: number;
  cny: number;
  createdAt: Date;
}

export interface MeatStockItem {
  id: string;
  sku: string;
  name: string; 
  packageSize: number; 
  costPrice: number; 
  sellingPrice: number; 
  currentStock: number; 
  createdAt: Date;
  isFinished?: boolean; // Added for slaughter round status
}

export interface MeatStockLog {
  id: string;
  itemId: string;
  change: number;
  newStock: number;
  type: 'stock-in' | 'sale';
  detail: string;
  createdAt: Date;
}


export type CurrencyValues = {
    kip: number;
    baht: number;
    usd: number;
    cny: number;
};

export interface TourAccountSummary {
    id: string;
    capital: CurrencyValues;
    cash: CurrencyValues;
    transfer: CurrencyValues;
}

export interface DocumentAccountSummary extends TourAccountSummary {}
