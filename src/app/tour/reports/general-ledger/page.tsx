
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, ChevronDown, BookOpen } from "lucide-react";
import { listenToTourTransactions } from '@/services/tourAccountancyService';
import type { Transaction, CurrencyValues } from '@/lib/types';
import { getYear, getMonth, format, setMonth, isWithinInterval, startOfYear, endOfYear } from 'date-fns';
import { th } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

const currencyKeys: (keyof CurrencyValues)[] = ['kip', 'baht', 'usd', 'cny'];


export default function GeneralLedgerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

    useEffect(() => {
        const unsubscribeTransactions = listenToTourTransactions(setTransactions);
        return () => {
            unsubscribeTransactions();
        };
    }, []);
    
    const yearlyTransactionReport = useMemo(() => {
        const yearDate = new Date(selectedYear, 0, 1);
        const start = startOfYear(yearDate);
        const end = endOfYear(yearDate);

        const yearlyTransactions = transactions.filter(tx => isWithinInterval(tx.date, { start, end }));
        
        const initialTotals = () => ({ kip: 0, baht: 0, usd: 0, cny: 0 });

        const groupedByMonth = yearlyTransactions.reduce((acc, tx) => {
            const month = getMonth(tx.date);
            if (!acc[month]) {
                acc[month] = {
                    transactions: [],
                    income: initialTotals(),
                    expense: initialTotals()
                };
            }
            acc[month].transactions.push(tx);
            currencyKeys.forEach(c => {
                 if (tx.type === 'income') {
                    acc[month].income[c] += tx[c] || 0;
                } else {
                    acc[month].expense[c] += tx[c] || 0;
                }
            });
            return acc;
        }, {} as Record<number, { transactions: Transaction[], income: CurrencyValues, expense: CurrencyValues }>);

        return Object.entries(groupedByMonth)
            .map(([month, data]) => ({ 
                month: parseInt(month), 
                transactions: data.transactions,
                income: data.income,
                expense: data.expense
            }))
            .sort((a, b) => a.month - b.month);

    }, [transactions, selectedYear]);

    const yearlyTransactionTotals = useMemo(() => {
        const totals = {
            income: { kip: 0, baht: 0, usd: 0, cny: 0 },
            expense: { kip: 0, baht: 0, usd: 0, cny: 0 }
        };

        yearlyTransactionReport.forEach(monthData => {
            currencyKeys.forEach(c => {
                totals.income[c] += monthData.income[c];
                totals.expense[c] += monthData.expense[c];
            });
        });

        return totals;
    }, [yearlyTransactionReport]);

    const YearSelector = () => {
        const transactionYears = Array.from(new Set(transactions.map(t => getYear(t.date)))).sort((a,b) => b-a);
        const years = transactionYears.length > 0 ? transactionYears : [getYear(new Date())];
        if (!years.includes(selectedYear)) {
             years.push(selectedYear)
        }
        
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <span>ปี {selectedYear + 543}</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {years.map(year => (
                        <DropdownMenuItem key={year} onClick={() => setSelectedYear(year)}>
                            {year + 543}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/reports">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้ารายงาน</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary"/>
                    <h1 className="text-xl font-bold tracking-tight">ประวัติรับ-จ่ายทั่วไป</h1>
                </div>
                 <div className="ml-auto">
                    <YearSelector />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <Card>
                    <CardHeader>
                        <CardDescription>แสดงรายการธุรกรรมทั่วไปที่ไม่ผูกกับโปรแกรมทัวร์ในปี {selectedYear + 543}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <h3 className="font-semibold">ยอดรวมปี {selectedYear + 543}</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs">
                                        <TableHead>ประเภท</TableHead>
                                        {currencyKeys.map(c => <TableHead key={c} className="text-right uppercase">{c}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">รายรับ</TableCell>
                                        {currencyKeys.map(c => <TableCell key={c} className="text-right text-green-600 font-mono">{formatCurrency(yearlyTransactionTotals.income[c])}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">รายจ่าย</TableCell>
                                        {currencyKeys.map(c => <TableCell key={c} className="text-right text-red-600 font-mono">{formatCurrency(yearlyTransactionTotals.expense[c])}</TableCell>)}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {yearlyTransactionReport.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {yearlyTransactionReport.map(({ month, income, expense, transactions }) => (
                                    <AccordionItem value={`month-${month}`} key={month}>
                                        <AccordionTrigger>
                                        <div className="flex flex-col md:flex-row justify-between w-full pr-4 text-sm">
                                            <div className="font-semibold text-base mb-2 md:mb-0">{format(setMonth(new Date(), month), 'LLLL yyyy', { locale: th })}</div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
                                                {currencyKeys.map(c => (
                                                    <div key={c} className="flex items-center justify-end gap-1">
                                                        <span className="font-bold uppercase text-xs">{c}:</span>
                                                        <span className="text-green-600 font-mono">{formatCurrency(income[c])}</span>/
                                                        <span className="text-red-600 font-mono">{formatCurrency(expense[c])}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>วันที่</TableHead>
                                                        <TableHead>คำอธิบาย</TableHead>
                                                        <TableHead>ประเภท</TableHead>
                                                        {currencyKeys.map(c => <TableHead key={c} className="text-right uppercase">{c}</TableHead>)}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {transactions.map(tx => (
                                                        <TableRow key={tx.id} className={tx.type === 'income' ? 'bg-green-50/30' : 'bg-red-50/30'}>
                                                            <TableCell>{format(tx.date, 'dd/MM/yy')}</TableCell>
                                                            <TableCell>{tx.description}</TableCell>
                                                            <TableCell>{tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</TableCell>
                                                            {currencyKeys.map(c => (
                                                                <TableCell key={c} className={`text-right font-mono ${tx[c] || 0 > 0 ? (tx.type === 'income' ? 'text-green-700' : 'text-red-700') : ''}`}>
                                                                    {(tx[c] || 0) > 0 ? formatCurrency(tx[c]!) : '-'}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                ไม่มีประวัติรับ-จ่ายทั่วไปในปี {selectedYear + 543}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

