
'use client';

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Printer, Check, ChevronsUpDown } from 'lucide-react';
import type { ApplianceStockItem } from '@/lib/types';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from '@/lib/utils';

interface InvoiceItem extends ApplianceStockItem {
  quantity: number;
}

interface ApplianceInvoiceFormProps {
    allItems: ApplianceStockItem[];
    onSave: (invoiceData: any) => void;
}

export interface ApplianceInvoiceFormHandle {
    resetForm: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('lo-LA').format(value);

const SearchableSelect = ({ items, value, onValueChange }: { items: ApplianceStockItem[], value: string, onValueChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? items.find((item) => item.id === value)?.name
                        : "ເລືອກສິນຄ້າ..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="ຄົ້ນຫາສິນຄ້າ..." />
                    <CommandEmpty>ບໍ່ພົບສິນຄ້າ.</CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={() => {
                                    onValueChange(item.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === item.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


export const ApplianceInvoiceForm = forwardRef<ApplianceInvoiceFormHandle, ApplianceInvoiceFormProps>(
  ({ allItems, onSave }, ref) => {
    
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

    const [expenseDetails, setExpenseDetails] = useState({ description: '', amount: 0 });

    useImperativeHandle(ref, () => ({
      resetForm() {
        setInvoiceItems([]);
        setInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
        setExpenseDetails({ description: '', amount: 0 });
        setTransactionType('income');
      }
    }));

    const { subtotal, totalCost, totalProfit } = useMemo(() => {
        const subtotal = invoiceItems.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
        const totalCost = invoiceItems.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
        const totalProfit = subtotal - totalCost;
        return { subtotal, totalCost, totalProfit };
    }, [invoiceItems]);

    const handleAddItem = () => {
      if (allItems.length > 0) {
        const firstItem = allItems[0];
        setInvoiceItems([...invoiceItems, { ...firstItem, quantity: 1 }]);
      }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
      const updatedItems = [...invoiceItems];
      if (field === 'id') {
        const selectedItem = allItems.find(item => item.id === value);
        if (selectedItem) {
          updatedItems[index] = { ...selectedItem, quantity: updatedItems[index].quantity || 1 };
        }
      } else {
        (updatedItems[index] as any)[field] = value;
      }
      setInvoiceItems(updatedItems);
    };

    const handleRemoveItem = (index: number) => {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (transactionType === 'income') {
             const invoiceData = {
                items: invoiceItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    costPrice: item.costPrice,
                    price: item.sellingPrice,
                    total: item.sellingPrice * item.quantity,
                })),
                subtotal: subtotal,
                totalCost: totalCost,
                totalProfit: totalProfit,
                date: new Date(invoiceDate),
                type: 'income',
            };
            onSave(invoiceData);
        } else {
             const expenseData = {
                items: [], // No items for expense
                subtotal: expenseDetails.amount,
                date: new Date(invoiceDate),
                description: expenseDetails.description,
                type: 'expense'
            };
            onSave(expenseData);
        }
       
    };

    return (
      <Card className="w-full max-w-6xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>ບັນທຶກ</CardTitle>
          <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as 'income' | 'expense')} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">ລາຍຮັບ</TabsTrigger>
              <TabsTrigger value="expense">ລາຍຈ່າຍ</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={transactionType} >
            <TabsContent value="income" className="mt-0 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="invoice-date">ວັນທີ</Label>
                        <Input id="invoice-date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                    </div>
                </div>
                
                <div>
                    <h3 className="font-semibold mb-4">ລາຍການສິນຄ້າ</h3>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[30%]">ສິນຄ້າ</TableHead>
                        <TableHead>ຈຳນວນ</TableHead>
                        <TableHead>ລາຄາຕົ້ນທຶນ</TableHead>
                        <TableHead>ລາຄາຕໍ່ໜ່ວຍ</TableHead>
                        <TableHead>ລາຄາລວມ</TableHead>
                        <TableHead>ກຳໄລ</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoiceItems.map((item, index) => {
                          const total = item.sellingPrice * item.quantity;
                          const profit = total - (item.costPrice * item.quantity);
                          return (
                            <TableRow key={index}>
                                <TableCell>
                                    <SearchableSelect 
                                      items={allItems}
                                      value={item.id}
                                      onValueChange={(value) => handleItemChange(index, 'id', value)}
                                    />
                                </TableCell>
                                <TableCell>
                                <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} />
                                </TableCell>
                                <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                                <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                                <TableCell>{formatCurrency(total)}</TableCell>
                                <TableCell>{formatCurrency(profit)}</TableCell>
                                <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                    </Table>
                    <Button variant="outline" className="mt-4" onClick={handleAddItem}>
                    <PlusCircle className="mr-2 h-4 w-4" /> ເພີ່ມລາຍການ
                    </Button>
                </div>

                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between">
                        <span>ຕົ້ນທຶນລວມ:</span>
                        <span className="font-mono">{formatCurrency(totalCost)} KIP</span>
                    </div>
                    <div className="flex justify-between">
                        <span>ລາຄາລວມຍ່ອຍ:</span>
                        <span className="font-mono">{formatCurrency(subtotal)} KIP</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-600">
                        <span>ກຳໄລລວມ:</span>
                        <span className="font-mono">{formatCurrency(totalProfit)} KIP</span>
                    </div>
                    </div>
                </div>
            </TabsContent>
             <TabsContent value="expense" className="mt-0">
                 <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="expense-date">ວັນທີ</Label>
                            <Input id="expense-date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expense-description">ລາຍການຊື້</Label>
                            <Textarea id="expense-description" placeholder="ອະທິບາຍລາຍຈ່າຍ..." value={expenseDetails.description} onChange={e => setExpenseDetails(prev => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expense-amount">ຈຳນວນເງິນ (KIP)</Label>
                            <Input id="expense-amount" type="number" placeholder="0" value={expenseDetails.amount || ''} onChange={e => setExpenseDetails(prev => ({ ...prev, amount: Number(e.target.value) }))}/>
                        </div>
                    </div>
                 </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-6">
             <Button onClick={() => window.print()} variant="outline"><Printer className="mr-2 h-4 w-4"/>ພິມ</Button>
             <Button onClick={handleSave}>ບັນທຶກ</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ApplianceInvoiceForm.displayName = 'ApplianceInvoiceForm';
