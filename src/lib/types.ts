
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
    paymentMethod: 'cash' | 'transfer';
}

export interface AccountSummary {
    id:string;
    cash: number;
    transfer: number;
}

export interface TransportEntry {
    id: string;
    ans_date: string;
    ans_cost: number;
    ans_amount: number;
    ans_finished: boolean;
    hal_date: string;
    hal_cost: number;
    hal_amount: number;
    hal_finished: boolean;
    mx_date: string;
    mx_cost: number;
    mx_amount: number;
    mx_finished: boolean;
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
