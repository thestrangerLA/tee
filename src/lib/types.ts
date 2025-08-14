
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
