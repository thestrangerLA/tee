
'use client';

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, PlusCircle, Printer } from 'lucide-react';
import type { ApplianceStockItem, ApplianceCustomer } from '@/lib/types';
import { format } from 'date-fns';

interface InvoiceItem extends ApplianceStockItem {
  quantity: number;
}

interface ApplianceInvoiceFormProps {
    allItems: ApplianceStockItem[];
    customers: ApplianceCustomer[];
    onSave: (invoiceData: any) => void;
    paymentStatus: 'paid' | 'unpaid';
    onPaymentStatusChange: (status: 'paid' | 'unpaid') => void;
}

export interface ApplianceInvoiceFormHandle {
    resetForm: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('lo-LA').format(value);

export const ApplianceInvoiceForm = forwardRef<ApplianceInvoiceFormHandle, ApplianceInvoiceFormProps>(
  ({ allItems, customers, onSave, paymentStatus, onPaymentStatusChange }, ref) => {
    
    const initialCustomerState = { name: '', address: '', phone: '' };
    const [customer, setCustomer] = useState<Partial<ApplianceCustomer>>(initialCustomerState);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useImperativeHandle(ref, () => ({
      resetForm() {
        setCustomer(initialCustomerState);
        setInvoiceItems([]);
        setInvoiceNumber('');
        setInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
      }
    }));

    const subtotal = useMemo(() => {
      return invoiceItems.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
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

    const handleCustomerSelect = (customerId: string) => {
        const selectedCustomer = customers.find(c => c.id === customerId);
        setCustomer(selectedCustomer || initialCustomerState);
    };
    
    const handleSave = () => {
        const invoiceData = {
            customer: customer,
            items: invoiceItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.sellingPrice,
                total: item.sellingPrice * item.quantity,
            })),
            subtotal: subtotal,
            invoiceNumber: invoiceNumber,
            date: new Date(invoiceDate),
            status: paymentStatus
        };
        onSave(invoiceData);
    };

    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>ຂໍ້ມູນໃບເກັບເງິນ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">ຂໍ້ມູນລູກຄ້າ</h3>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="ເລືອກລູກຄ້າທີ່ມີຢູ່ແລ້ວ" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid gap-2">
                <Label htmlFor="customer-name">ຊື່ລູກຄ້າ</Label>
                <Input id="customer-name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-address">ທີ່ຢູ່</Label>
                <Textarea id="customer-address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="customer-phone">ເບີໂທ</Label>
                <Input id="customer-phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">ລາຍລະອຽດໃບເກັບເງິນ</h3>
              <div className="grid gap-2">
                <Label htmlFor="invoice-number">ເລກທີ່ໃບເກັບເງິນ</Label>
                <Input id="invoice-number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice-date">ວັນທີ</Label>
                <Input id="invoice-date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                 <Label>ສະຖານະການຊຳລະເງິນ</Label>
                 <RadioGroup value={paymentStatus} onValueChange={(val: 'paid' | 'unpaid') => onPaymentStatusChange(val)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paid" id="paid" />
                        <Label htmlFor="paid">ຊຳລະແລ້ວ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unpaid" id="unpaid" />
                        <Label htmlFor="unpaid">ຕິດໜີ້</Label>
                    </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">ລາຍການສິນຄ້າ</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">ສິນຄ້າ</TableHead>
                  <TableHead>ຈຳນວນ</TableHead>
                  <TableHead>ລາຄາຕໍ່ໜ່ວຍ</TableHead>
                  <TableHead>ລາຄາລວມ</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select value={item.id} onValueChange={(value) => handleItemChange(index, 'id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="ເລືອກສິນຄ້າ" />
                        </SelectTrigger>
                        <SelectContent>
                          {allItems.map(stockItem => (
                            <SelectItem key={stockItem.id} value={stockItem.id}>{stockItem.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} />
                    </TableCell>
                    <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.sellingPrice * item.quantity)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="mt-4" onClick={handleAddItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> ເພີ່ມລາຍການ
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>ລາຄາລວມຍ່ອຍ:</span>
                <span>{formatCurrency(subtotal)} KIP</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>ຍອດລວມທັງໝົດ:</span>
                <span>{formatCurrency(subtotal)} KIP</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
             <Button onClick={() => window.print()} variant="outline"><Printer className="mr-2 h-4 w-4"/>ພິມ</Button>
             <Button onClick={handleSave}>ບັນທຶກໃບເກັບເງິນ</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ApplianceInvoiceForm.displayName = 'ApplianceInvoiceForm';
