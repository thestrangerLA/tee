
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, ChevronRight, DollarSign, Calendar, CalendarDays, ArrowUpCircle, ArrowDownCircle, Scale } from "lucide-react";
import { listenToApplianceTransactions } from '@/services/applianceAccountancyService';
import type { Transaction } from '@/lib/types';
import { getMonth, format, setMonth, isWithinInterval, startOfYear, endOfYear, getYear } from 'date-fns';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '@/components/ui/label';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

const SummaryCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function ApplianceGeneralLedgerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(startOfYear(new Date()));
    const [endDate, setEndDate] = useState<Date | undefined>(endOfYear(new Date()));

    useEffect(() => {
        const unsubscribeTransactions = listenToApplianceTransactions(setTransactions);
        return () => {
            unsubscribeTransactions();
        };
    }, []);
    
    const reportData = useMemo(() => {
        const filteredTransactions = transactions.filter(tx => {
            if (!startDate || !endDate) return true; // Show all if no date range
            return isWithinInterval(tx.date, { start: startDate, end: endDate });
        });
        
        const groupedByMonth = filteredTransactions.reduce((acc, tx) => {
            const month = getMonth(tx.date);
            const year = getYear(tx.date);
            const key = `${year}-${month}`;
            if (!acc[key]) {
                acc[key] = {
                    year,
                    month,
                    transactions: [],
                    income: 0,
                    expense: 0,
                    net: 0
                };
            }
            acc[key].transactions.push(tx);
            if (tx.type === 'income') {
                acc[key].income += tx.amount || 0;
            } else {
                acc[key].expense += tx.amount || 0;
            }
            acc[key].net = acc[key].income - acc[key].expense;
            return acc;
        }, {} as Record<string, { year: number, month: number, transactions: Transaction[], income: number, expense: number, net: number }>);
        
        const monthlyReports = Object.values(groupedByMonth)
            .sort((a, b) => (b.year - a.year) || (b.month - a.month));
        
        const grandTotals = filteredTransactions.reduce((acc, tx) => {
            if (tx.type === 'income') {
                acc.income += tx.amount || 0;
            } else {
                acc.expense += tx.amount || 0;
            }
            acc.net = acc.income - acc.expense;
            return acc;
        }, { income: 0, expense: 0, net: 0 });

        return { monthlyReports, grandTotals };

    }, [transactions, startDate, endDate]);


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/appliances/reports">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າລາຍງານ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">ປະຫວັດຮັບ-ຈ່າຍທົ່ວไป</h1>
                        <p className="text-xs text-muted-foreground">ສະແດງລາຍການທຸລະກຳທັງໝົດຂອງທຸລະກິດເຄື່ອງໃຊ້</p>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard title="ລວມລາຍຮັບ" value={`LAK ${formatCurrency(reportData.grandTotals.income)}`} icon={<ArrowUpCircle className="h-4 w-4 text-muted-foreground text-green-500" />} />
                    <SummaryCard title="ລວມລາຍຈ່າຍ" value={`LAK ${formatCurrency(reportData.grandTotals.expense)}`} icon={<ArrowDownCircle className="h-4 w-4 text-muted-foreground text-red-500" />} />
                    <SummaryCard title="ກຳໄລ/ຂາດທຶນ" value={`LAK ${formatCurrency(reportData.grandTotals.net)}`} icon={<Scale className="h-4 w-4 text-muted-foreground text-blue-500" />} />
                </div>
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>ລາຍງານລາຍເດືອນ</CardTitle>
                                <CardDescription>ສະແດງສະຫຼຸບລາຍເດືອນຕາມຊ່ວງວັນທີທີ່ເລືອກ</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                               <div className="grid gap-2">
                                    <Label htmlFor="start-date" className="sr-only">ວັນທີເລີ່ມຕົ້ນ</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="start-date" variant={"outline"} className="w-[200px] justify-start text-left font-normal">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "dd/MM/yy") : <span>ເລີ່ມ</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus  /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end-date" className="sr-only">ວັນທີສິ້ນສຸດ</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="end-date" variant={"outline"} className="w-[200px] justify-start text-left font-normal">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "dd/MM/yy") : <span>ສິ້ນສຸດ</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus  /></PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {reportData.monthlyReports.length > 0 ? (
                           reportData.monthlyReports.map(({ year, month, net, income, expense }) => (
                                <Link 
                                    href={`/appliances/reports/general-ledger-month?year=${year}&month=${month}`} 
                                    key={`${year}-${month}`}
                                    passHref
                                >
                                    <Card className="hover:bg-muted/50 cursor-pointer">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="font-semibold text-base">
                                                {format(setMonth(new Date(year, month), month), 'LLLL yyyy')}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:grid grid-cols-3 gap-x-4 text-xs">
                                                     <div className="flex items-center justify-end gap-1 text-green-600">
                                                        <span className="font-bold uppercase">ຮັບ:</span>
                                                        <span className={`font-mono w-24 text-right`}>{formatCurrency(income)}</span>
                                                    </div>
                                                     <div className="flex items-center justify-end gap-1 text-red-600">
                                                        <span className="font-bold uppercase">ຈ່າຍ:</span>
                                                        <span className={`font-mono w-24 text-right`}>{formatCurrency(expense)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className="font-bold uppercase text-muted-foreground">Net:</span>
                                                        <span className={`font-mono w-24 text-right ${net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(net)}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-16">
                                ບໍ່ມີຂໍ້ມູນໃນຊ່ວງເວລາທີ່ເລືອກ
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

    