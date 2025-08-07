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
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
}

export function StockTable({ data }: { data: StockItem[] }) {
    const [isAddItemOpen, setAddItemOpen] = React.useState(false)
    const [stockData, setStockData] = React.useState(data);

    const handleCurrentStockChange = (id: string, value: string) => {
        const newStockData = stockData.map(item => 
            item.id === id ? { ...item, currentStock: parseInt(value, 10) || 0 } : item
        );
        setStockData(newStockData);
    };

    const groupedData = stockData.reduce((acc, item) => {
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
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead className="text-right">ราคาต้นทุน</TableHead>
              <TableHead className="text-right">ราคาขายส่ง</TableHead>
              <TableHead className="text-right">ราคาขายปลีก</TableHead>
              <TableHead className="text-right">สต็อกเปิด</TableHead>
              <TableHead className="text-right w-[120px]">สต็อกปัจจุบัน</TableHead>
              <TableHead>
                <span className="sr-only">การดำเนินการ</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).map(([category, items]) => (
                <React.Fragment key={category}>
                    <TableRow className="bg-muted/50">
                        <TableCell colSpan={7} className="font-semibold">{category}</TableCell>
                    </TableRow>
                    {items.map((item) => {
                        return (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.wholesalePrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.sellingPrice)}</TableCell>
                            <TableCell className="text-right">{item.openingStock}</TableCell>
                            <TableCell className="text-right">
                                <Input 
                                    type="number" 
                                    className="h-8 w-24 text-right"
                                    defaultValue={item.openingStock}
                                />
                            </TableCell>
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
                                    <DropdownMenuItem>แก้ไข</DropdownMenuItem>
                                    <DropdownMenuItem>ลบ</DropdownMenuItem>
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
    <AddItemDialog open={isAddItemOpen} onOpenChange={setAddItemOpen} />
    </>
  )
}
