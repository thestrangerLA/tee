
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Search, Leaf, DollarSign, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { StockItem } from "@/lib/types"
import { StatCard } from "@/components/stat-card"
import { StockTable } from "@/components/stock-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { listenToStockItems, addStockItem, updateStockItem, deleteStockItem } from "@/services/stockService"

export default function Home() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

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

  const totalValue = stockItems.reduce((acc, item) => {
    return acc + item.currentStock * item.costPrice;
  }, 0);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const categories = [...new Set(stockItems.map(item => item.category))];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">ผู้จัดการสต็อกสินค้าเกษตร</h1>
        </div>
        <div className="ml-4 flex items-center gap-2">
            <Select defaultValue={new Date().getFullYear().toString()}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue={(new Date().getMonth()).toString()}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="ค้นหาสินค้า..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard 
                title="มูลค่าสต็อกทั้งหมด"
                value={new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code' }).format(totalValue)}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="มูลค่าโดยประมาณของสินค้าทั้งหมด"
            />
             <StatCard 
                title="สินค้าทั้งหมด"
                value={stockItems.length.toString()}
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
                description="จำนวนรายการสินค้าในสต็อก"
            />
        </div>
        <div className="flex-1 overflow-auto">
            <StockTable 
              data={stockItems} 
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
