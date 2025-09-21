

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
    // Fields for multi-currency support in tour business
    kip?: number;
    baht?: number;
    usd?: number;
    cny?: number;
    businessType?: 'agriculture' | 'tour' | 'documents';
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

export type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

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
  kip: number;
  baht: number;
  usd: number;
  cny: number;
  createdAt: Date;
}

export interface TourIncomeItem {
  id: string;
  programId: string;
  date: Date | null;
  detail: string;
  kip: number;
  baht: number;
  usd: number;
  cny: number;
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

// --- Component Prop Types ---
export type Accommodation = { id: string; name: string; type: 'hotel' | 'guesthouse'; checkInDate?: Date; rooms: Room[]; };
export type Room = { id: string; type: string; numRooms: number; numNights: number; price: number; currency: Currency; };
export type Trip = { id: string; location: string; route: string; vehicleType: string; numVehicles: number; numDays: number; pricePerVehicle: number; currency: Currency; };
export type Flight = { id: string; from: string; to: string; departureDate?: Date; departureTime: string; pricePerPerson: number; numPeople: number; currency: Currency; };
export type TrainTicket = { id: string; from: string; to: string; departureDate?: Date; departureTime: string; ticketClass: string; numTickets: number; pricePerTicket: number; currency: Currency; };
export type EntranceFee = { id: string; locationName: string; pax: number; numLocations: number; price: number; currency: Currency; };
export type MealCost = { id: string; name: string; pax: number; breakfast: number; lunch: number; dinner: number; pricePerMeal: number; currency: Currency; };
export type GuideFee = { id: string; guideName: string; numGuides: number; numDays: number; pricePerDay: number; currency: Currency; };
export type DocumentFee = { id: string; documentName: string; pax: number; price: number; currency: Currency; };

export interface TourInfo {
    mouContact: string;
    groupCode: string;
    destinationCountry: string;
    program: string;
    startDate?: Date;
    endDate?: Date;
    numDays: number;
    numNights: number;
    numPeople: number;
    travelerInfo: string;
}

export interface TourCosts {
    accommodations: Accommodation[];
    trips: Trip[];
    flights: Flight[];
    trainTickets: TrainTicket[];
    entranceFees: EntranceFee[];
    meals: MealCost[];
    guides: GuideFee[];
    documents: DocumentFee[];
}

export interface CalculationSnapshot {
    id: string;
    savedAt: Date;
    note: string;
    tourInfo: TourInfo;
    allCosts: TourCosts;
}

export interface SavedCalculation {
    id: string;
    savedAt: Date;
    tourInfo: TourInfo;
    allCosts: TourCosts;
    history: CalculationSnapshot[];
}

export interface DocumentAccountSummary extends TourAccountSummary {}
