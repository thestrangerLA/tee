
"use client"

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Printer } from "lucide-react";
import { listenToDocumentTransactions } from '@/services/documentAccountancyService';
import type { Transaction, CurrencyValues } from '@/lib/types';
import { getMonth, format, setMonth, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { lo } from "date-fns/locale/lo";

export const dynamic = 'force-dynamic';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

const currencyKeys: (keyof CurrencyValues)[] = ['kip', 'baht', 'usd', 'cny'];
const initialCurrencyValues: CurrencyValues = { kip: 0, baht: 0, usd: 0, cny: 0 };

// Separate component for the main content
function DocumentContent() {
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isClient, setIsClient] = useState(false);

    // This ensures that rendering of components that use client-side hooks like
    // useSearchParams happens only on the client, after initial hydration.
    useEffect(() => {
        setIsClient(true);
    }, []);

    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const displayDate = useMemo(() => {
        if (year && month) {
            return new Date(Number(year), Number(month));
        }
        return new Date();
    }, [year, month]);

    useEffect(() => {
        if (!isClient) return;
        
        const unsubscribeTransactions = listenToDocumentTransactions(setTransactions);
        return () => {
            unsubscribeTransactions();
        };
    }, [isClient]);
    
    const reportData = useMemo(() => {
        if (!year || !month || !isClient) {
            return { 
                transactions: [], 
                income: { ...initialCurrencyValues }, 
                expense: { ...initialCurrencyValues }, 
                net: { ...initialCurrencyValues } 
            };
        }
        
        const startDate = startOfMonth(displayDate);
        const endDate = endOfMonth(displayDate);

        const monthlyTransactions = transactions.filter(tx => {
            // Add null check for tx.date
            if (!tx.date) return false;
            return isWithinInterval(tx.date, { start: startDate, end: endDate });
        });
        
        const initialTotals = (): CurrencyValues => ({ kip: 0, baht: 0, usd: 0, cny: 0 });
        
        const income = initialTotals();
        const expense = initialTotals();
        const net = initialTotals();

        monthlyTransactions.forEach(tx => {
             currencyKeys.forEach(c => {
                 const key = c as keyof Transaction;
                 if (tx.type === 'income') {
                    income[c] += (tx[key] as number) || 0;
                } else {
                    expense[c] += (tx[key] as number) || 0;
                }
            });
        });
        
        currencyKeys.forEach(c => {
            net[c] = income[c] - expense[c];
        });

        return { transactions: monthlyTransactions, income, expense, net };

    }, [transactions, displayDate, year, month, isClient]);

    // Show loading state during hydration
    if (!isClient) {
        return null;
    }

    const headerTitle = format(displayDate, 'LLLL yyyy', { locale: lo });
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/documents/reports/general-ledger">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້ານາຍງານຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary"/>
                    <h1 className="text-xl font-bold tracking-tight">ປະຫວັດຮັບ-ຈ່າຍ: {headerTitle}</h1>
                </div>
                 <div className="ml-auto">
                     <Button 
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.print();
                            }
                        }} 
                        variant="outline" 
                        size="sm"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        ພິມ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 print:p-2 print:gap-2">
                 <div className="hidden print:block text-center mb-4">
                    <h1 className="text-xl font-bold">ປະຫວັດຮັບ-ຈ່າຍທົ່ວໄປ</h1>
                    <p className="text-sm text-muted-foreground">
                        ສຳລັບເດືອນ {headerTitle}
                    </p>
                </div>
                
                 <Card className="print:shadow-none print:border-none">
                    <CardHeader className="print:hidden">
                        <CardTitle>ສະຫຼຸບຍອດເດືອນ {headerTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 print:p-0">
                         <div className="p-4 bg-muted/50 rounded-lg space-y-2 print:border print:p-2">
                            <h3 className="font-semibold">ຍອດລວມສຳລັບເດືອນນີ້</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs">
                                        <TableHead>ປະເພດ</TableHead>
                                        {currencyKeys.map(c => <TableHead key={c} className="text-right uppercase">{c}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">ລາຍຮັບ</TableCell>
                                        {currencyKeys.map(c => <TableCell key={c} className="text-right text-green-600 font-mono">{formatCurrency(reportData.income[c] || 0)}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">ລາຍຈ່າຍ</TableCell>
                                        {currencyKeys.map(c => <TableCell key={c} className="text-right text-red-600 font-mono">{formatCurrency(reportData.expense[c] || 0)}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="font-bold bg-muted/80">
                                        <TableCell>ກຳໄລ/ຂາດທຶນ</TableCell>
                                         {currencyKeys.map(c => (
                                            <TableCell key={c} className={`text-right font-mono ${(reportData.net[c] || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                {formatCurrency(reportData.net[c] || 0)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        
                        <div>
                             <h3 className="text-lg font-semibold my-4 print:my-2 print:text-base print:border-b print:pb-1">ລາຍລະອຽດທຸລະກຳ</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ວັນທີ</TableHead>
                                        <TableHead>ຄຳອະທິບາຍ</TableHead>
                                        <TableHead>ປະເພດ</TableHead>
                                        {currencyKeys.map(c => <TableHead key={c} className="text-right uppercase">{c}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.transactions.map(tx => (
                                        <TableRow key={tx.id} className={tx.type === 'income' ? 'bg-green-50/30' : 'bg-red-50/30'}>
                                            <TableCell>{tx.date ? format(tx.date, 'dd/MM/yy') : '-'}</TableCell>
                                            <TableCell>{tx.description || '-'}</TableCell>
                                            <TableCell>{tx.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'}</TableCell>
                                            {currencyKeys.map(c => {
                                                const key = c as keyof Transaction;
                                                const value = (tx[key] as number) || 0;
                                                return (
                                                <TableCell key={c} className={`text-right font-mono ${value > 0 ? (tx.type === 'income' ? 'text-green-700' : 'text-red-700') : ''}`}>
                                                    {value > 0 ? formatCurrency(value) : '-'}
                                                </TableCell>
                                            )}
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {reportData.transactions.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                ບໍ່ມີປະຫວັດຮັບ-ຈ່າຍທົ່ວໄປໃນເດືອນນີ້
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default function DocumentGeneralLedgerMonthPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">ກຳລັງໂຫຼດ...</p>
                    </div>
                </div>
            </div>
        }>
            <DocumentContent />
        </Suspense>
    );
}
