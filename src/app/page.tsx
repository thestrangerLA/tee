
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Search, Leaf, DollarSign, Package, Tags } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { StockItem } from "@/lib/types"
import { StatCard } from "@/components/stat-card"
import { StockTable } from "@/components/stock-table"
import { useState, useEffect } from "react"
import { listenToStockItems, addStockItem, updateStockItem, deleteStockItem } from "@/services/stockService"

export default function Home() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = listenToStockItems(setStockItems);
    return () => unsubscribe();
  }, []);

  const handleAddItem = async (newItem: Omit<StockItem, 'id'>) => {
    await addStockItem(newItem);
  };

  const handleUpdateItem = async (id: string, updatedFields: Partial<StockItem>) => {
    await updateStockItem(id, updatedFields);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteStockItem(id);
  };

  const totalValueKip = stockItems.reduce((acc, item) => {
    return acc + item.currentStock * item.costPrice;
  }, 0);

  const categories = [...new Set(stockItems.map(item => item.category))];

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const valuePerCategory = stockItems.reduce((acc, item) => {
    const value = item.currentStock * item.costPrice;
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += value;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (value: number, currency: 'Kip' | 'Baht') => {
    const currencySymbol = currency === 'Kip' ? ' กีบ' : ' บาท';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value) + currencySymbol;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">ผู้จัดการสต็อกสินค้าเกษตร</h1>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหาสินค้า..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard 
                title="มูลค่าสต็อกทั้งหมด (กีบ)"
                value={formatCurrency(totalValueKip, 'Kip')}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="มูลค่าโดยประมาณของสินค้าทั้งหมด"
            />
             <StatCard 
                title="สินค้าทั้งหมด"
                value={stockItems.length.toString()}
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
                description="จำนวนรายการสินค้าในสต็อก"
            />
             <StatCard 
                title="หมวดหมู่ทั้งหมด"
                value={categories.length.toString()}
                icon={<Tags className="h-4 w-4 text-muted-foreground" />}
                description="จำนวนหมวดหมู่สินค้าทั้งหมด"
            />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>มูลค่าตามหมวดหมู่ (กีบ)</CardTitle>
                <CardDescription>มูลค่ารวมของสินค้าในแต่ละหมวดหมู่</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(valuePerCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, value]) => (
                    <StatCard
                        key={category}
                        title={category}
                        value={formatCurrency(value, 'Kip')}
                        icon={<Tags className="h-4 w-4 text-muted-foreground" />}
                        description={`มูลค่ารวมในหมวดหมู่ ${category}`}
                    />
                ))}
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 overflow-auto">
            <StockTable 
              data={filteredStockItems} 
              categories={categories}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
        </div>
      </main>
    </div>
  )
}
