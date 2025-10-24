
'use client';

import { useState, useEffect, useRef } from 'react';
import { listenToApplianceStockItems } from '@/services/applianceStockService';
import { saveApplianceSale } from '@/services/applianceSalesService';
import { listenToApplianceCustomers } from '@/services/applianceCustomerService';
import type { ApplianceStockItem, ApplianceCustomer } from '@/lib/types';
import { ApplianceInvoiceForm, type ApplianceInvoiceFormHandle } from '@/components/appliance-invoice-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { addApplianceTransaction } from '@/services/applianceAccountancyService';

export default function ApplianceInvoicePage() {
  const [stockItems, setStockItems] = useState<ApplianceStockItem[]>([]);
  const [customers, setCustomers] = useState<ApplianceCustomer[]>([]);
  const invoiceFormRef = useRef<ApplianceInvoiceFormHandle>(null);

  useEffect(() => {
    const unsubscribeStock = listenToApplianceStockItems(setStockItems);
    const unsubscribeCustomers = listenToApplianceCustomers(setCustomers);
    return () => {
      unsubscribeStock();
      unsubscribeCustomers();
    };
  }, []);

  const handleSaveInvoice = async (invoiceData: any) => {
    try {
      // Record the sale
      await saveApplianceSale(invoiceData);

      // Record the income transaction in accountancy
      await addApplianceTransaction({
        date: invoiceData.date,
        type: 'income',
        description: `ລາຍຮັບຈາກການຂາຍ #${invoiceData.invoiceNumber || ''}`,
        amount: invoiceData.subtotal,
      });

      alert('ບັນທຶກລາຍຮັບ ແລະ ອັບເດດສະຕັອກສຳເລັດ!');
      invoiceFormRef.current?.resetForm();
    } catch (error: any) {
       alert(`Failed to save invoice: ${error.message}`);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md sticky top-0 z-30 flex h-20 items-center gap-4 border-b px-4 sm:px-6">
        <Button variant="outline" size="icon" className="h-10 w-10" asChild>
          <Link href="/appliances">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ລາຍຮັບ</h1>
            <p className="text-sm text-muted-foreground">ບັນທຶກລາຍຮັບຈາກການຂາຍເຄື່ອງໃຊ້</p>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
        <ApplianceInvoiceForm 
            ref={invoiceFormRef} 
            allItems={stockItems} 
            customers={customers}
            onSave={handleSaveInvoice}
        />
      </main>
    </div>
  );
}
