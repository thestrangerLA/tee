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
import { Badge } from "@/components/ui/badge"
import { File, ListFilter, MoreHorizontal, PlusCircle } from "lucide-react"
import type { StockItem } from "@/lib/types"
import { AddItemDialog } from "./add-item-dialog"
import { RecordTransactionDialog } from "./record-transaction-dialog"

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
}

export function StockTable({ data }: { data: StockItem[] }) {
    const [isAddItemOpen, setAddItemOpen] = React.useState(false)
    const [isRecordTxOpen, setRecordTxOpen] = React.useState(false)

  return (
    <>
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                    Manage your products and view their stock levels.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                            </span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuItem>In Stock</DropdownMenuItem>
                        <DropdownMenuItem>Low Stock</DropdownMenuItem>
                        <DropdownMenuItem>Out of Stock</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Export
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={() => setAddItemOpen(true)}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Product
                        </span>
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={() => setRecordTxOpen(true)}>
                         <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Record Transaction</span>
                    </Button>
                </div>
            </div>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Opening Stock</TableHead>
              <TableHead className="text-right">Purchases</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Wholesale Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
                const currentStock = item.openingStock + item.purchases - item.sales;
                const status: 'in-stock' | 'low-stock' | 'out-of-stock' = 
                    currentStock <= 0 ? 'out-of-stock' :
                    currentStock < 20 ? 'low-stock' : 'in-stock';
              
                return (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={status === 'out-of-stock' ? 'destructive' : status === 'low-stock' ? 'secondary' : 'default'}
                               className={status === 'low-stock' ? 'bg-orange-200 text-orange-800' : ''}>
                           {status.replace('-', ' ')}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.openingStock}</TableCell>
                    <TableCell className="text-right text-green-600">+{item.purchases}</TableCell>
                    <TableCell className="text-right text-red-600">-{item.sales}</TableCell>
                    <TableCell className="text-right font-semibold">{currentStock}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.wholesalePrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.sellingPrice)}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
              )}
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{data.length}</strong> of <strong>{data.length}</strong> products
        </div>
      </CardFooter>
    </Card>
    <AddItemDialog open={isAddItemOpen} onOpenChange={setAddItemOpen} />
    <RecordTransactionDialog open={isRecordTxOpen} onOpenChange={setRecordTxOpen} items={data} />
    </>
  )
}
