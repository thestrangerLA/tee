
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
  cost: number;
  sellingPrice: number;
  isPaid: boolean;
  createdAt: Date;
}
