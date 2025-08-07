
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
import { useState } from "react"

const initialStockItems: StockItem[] = [
    { id: 'PROD001', name: 'ปุ๋ยตรากระต่าย สูตร 16-16-16', category: 'ปุ๋ย', openingStock: 100, currentStock: 100, costPrice: 450, wholesalePrice: 500, sellingPrice: 550 },
    { id: 'PROD002', name: 'เมล็ดพันธุ์ผักกาดขาว', category: 'เมล็ดพันธุ์', openingStock: 500, currentStock: 500, costPrice: 10, wholesalePrice: 15, sellingPrice: 20 },
    { id: 'PROD003', name: 'ยาฆ่าแมลง (ไซเปอร์เมทริน)', category: 'ยา', openingStock: 50, currentStock: 50, costPrice: 120, wholesalePrice: 140, sellingPrice: 160 },
    { id: 'PROD004', name: 'จอบ', category: 'อุปกรณ์', openingStock: 80, currentStock: 80, costPrice: 80, wholesalePrice: 95, sellingPrice: 120 },
    { id: 'PROD005', name: 'ปุ๋ยยูเรีย 46-0-0', category: 'ปุ๋ย', openingStock: 120, currentStock: 120, costPrice: 550, wholesalePrice: 600, sellingPrice: 680 },
    { id: 'PROD006', name: 'เมล็ดข้าวโพด', category: 'เมล็ดพันธุ์', openingStock: 1000, currentStock: 1000, costPrice: 5, wholesalePrice: 8, sellingPrice: 12 },
    { id: 'PROD007', name: 'บัวรดน้ำ', category: 'อุปกรณ์', openingStock: 150, currentStock: 150, costPrice: 45, wholesalePrice: 55, sellingPrice: 70 },
    { id: 'PROD008', name: 'ยาคุมหญ้า (ไกลโฟเซต)', category: 'ยา', openingStock: 60, currentStock: 60, costPrice: 150, wholesalePrice: 170, sellingPrice: 200 },
    { id: 'PROD009', name: 'ข้าวหอมมะลิ', category: 'ข้าว', openingStock: 200, currentStock: 200, costPrice: 35, wholesalePrice: 40, sellingPrice: 45 },
    { id: 'PROD010', name: 'หัวอาหารไก่', category: 'หัวอาหาร', openingStock: 300, currentStock: 300, costPrice: 250, wholesalePrice: 280, sellingPrice: 320 },
    { id: 'PROD011', name: 'วิตามินรวมสำหรับพืช', category: 'วิตามิน', openingStock: 100, currentStock: 100, costPrice: 80, wholesalePrice: 90, sellingPrice: 110 },
];

export default function Home() {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);

  const totalValue = stockItems.reduce((acc, item) => {
    return acc + item.currentStock * item.costPrice;
  }, 0);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const categories = [...new Set(initialStockItems.map(item => item.category))];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
        <div className="overflow-y-auto">
            <StockTable data={stockItems} setData={setStockItems} categories={categories} />
        </div>
      </main>
    </div>
  )
}
