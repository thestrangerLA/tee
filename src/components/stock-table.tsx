
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { File, MoreHorizontal, PlusCircle } from "lucide-react"
import type { StockItem } from "@/lib/types"
import { AddItemDialog } from "./add-item-dialog"
import { Input } from "./ui/input"

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(amount);
}

export function StockTable({ data, setData, categories }: { data: StockItem[], setData: React.Dispatch<React.SetStateAction<StockItem[]>>, categories: string[] }) {
    const [isAddItemOpen, setAddItemOpen] = React.useState(false)

    const handleFieldChange = (id: string, field: keyof StockItem, value: string | number) => {
        const newStockData = data.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setData(newStockData);
    };

    const handleDeleteItem = (id: string) => {
        setData(data.filter(item => item.id !== id));
    };

    const handleAddItem = (newItem: Omit<StockItem, 'id'>) => {
        const newStockItem: StockItem = {
            id: `PROD${(Date.now() + Math.random()).toString(36)}`, // simple unique id
            ...newItem
        };
        setData([...data, newStockItem]);
    };

    const groupedData = data.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, StockItem[]>);


  return (
    <>
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>สินค้าคงคลัง</CardTitle>
                    <CardDescription>
                    จัดการสินค้าและดูระดับสต็อกของคุณ
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        ส่งออก
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={() => setAddItemOpen(true)}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        เพิ่มสินค้า
                        </span>
                    </Button>
                </div>
            </div>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">ชื่อสินค้า</TableHead>
              <TableHead className="text-right">ราคาต้นทุน</TableHead>
              <TableHead className="text-right">ราคาขายส่ง</TableHead>
              <TableHead className="text-right">ราคาขายปลีก</TableHead>
              <TableHead className="text-right">สต็อกเปิด</TableHead>
              <TableHead className="text-right w-[120px]">สต็อกปัจจุบัน</TableHead>
              <TableHead className="text-right">มูลค่า</TableHead>
              <TableHead>
                <span className="sr-only">การดำเนินการ</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).map(([category, items]) => (
                <React.Fragment key={category}>
                    <TableRow className="bg-muted/50">
                        <TableCell colSpan={8} className="font-semibold">{category}</TableCell>
                    </TableRow>
                    {items.map((item) => {
                        const value = item.costPrice * item.currentStock;
                        return (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                 <Input
                                    defaultValue={item.name}
                                    onBlur={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                                    className="h-8"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    defaultValue={item.costPrice}
                                    onBlur={(e) => handleFieldChange(item.id, 'costPrice', parseFloat(e.target.value) || 0)}
                                    className="h-8 w-28 text-right"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    defaultValue={item.wholesalePrice}
                                    onBlur={(e) => handleFieldChange(item.id, 'wholesalePrice', parseFloat(e.target.value) || 0)}
                                    className="h-8 w-28 text-right"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    defaultValue={item.sellingPrice}
                                    onBlur={(e) => handleFieldChange(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                    className="h-8 w-28 text-right"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    defaultValue={item.openingStock}
                                    onBlur={(e) => handleFieldChange(item.id, 'openingStock', parseInt(e.target.value, 10) || 0)}
                                    className="h-8 w-24 text-right"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    defaultValue={item.currentStock}
                                    onBlur={(e) => handleFieldChange(item.id, 'currentStock', parseInt(e.target.value, 10) || 0)}
                                    className="h-8 w-24 text-right"
                                />
                            </TableCell>
                             <TableCell className="text-right">{formatCurrency(value)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button
                                        aria-haspopup="true"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">สลับเมนู</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>ลบ</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )}
                    )}
                </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          แสดง <strong>1-{data.length}</strong> จาก <strong>{data.length}</strong> สินค้า
        </div>
      </CardFooter>
    </Card>
    <AddItemDialog open={isAddItemOpen} onOpenChange={setAddItemOpen} onAddItem={handleAddItem} categories={categories} />
    </>
  )
}
