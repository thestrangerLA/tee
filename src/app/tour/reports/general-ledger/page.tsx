
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar as CalendarIcon, Printer, ChevronRight } from "lucide-react";
import { listenToTourTransactions, addTourTransaction } from '@/services/tourAccountancyService';
import type { Transaction, CurrencyValues } from '@/lib/types';
import { getMonth, format, setMonth, isWithinInterval, startOfYear, endOfYear, getYear } from 'date-fns';
import { th } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar";
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

const currencyKeys: (keyof CurrencyValues)[] = ['kip', 'baht', 'usd', 'cny'];


export default function GeneralLedgerPage() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(startOfYear(new Date()));
    const [endDate, setEndDate] = useState<Date | undefined>(endOfYear(new Date()));

    useEffect(() => {
        const unsubscribeTransactions = listenToTourTransactions(setTransactions);
        return () => {
            unsubscribeTransactions();
        };
    }, []);
    
    const reportData = useMemo(() => {
        const filteredTransactions = transactions.filter(tx => {
            if (!startDate || !endDate) return false;
            return isWithinInterval(tx.date, { start: startDate, end: endDate });
        });
        
        const initialTotals = () => ({ kip: 0, baht: 0, usd: 0, cny: 0 });

        const groupedByMonth = filteredTransactions.reduce((acc, tx) => {
            const month = getMonth(tx.date);
            const year = getYear(tx.date);
            const key = `${year}-${month}`;
            if (!acc[key]) {
                acc[key] = {
                    year,
                    month,
                    transactions: [],
                    income: initialTotals(),
                    expense: initialTotals(),
                    net: initialTotals()
                };
            }
            acc[key].transactions.push(tx);
            currencyKeys.forEach(c => {
                 if (tx.type === 'income') {
                    acc[key].income[c] += tx[c] || 0;
                } else {
                    acc[key].expense[c] += tx[c] || 0;
                }
                acc[key].net[c] = acc[key].income[c] - acc[key].expense[c];
            });
            return acc;
        }, {} as Record<string, { year: number, month: number, transactions: Transaction[], income: CurrencyValues, expense: CurrencyValues, net: CurrencyValues }>);
        
        const monthlyReports = Object.values(groupedByMonth)
            .sort((a, b) => (b.year - a.year) || (b.month - a.month));
        
        const grandTotals = {
            income: initialTotals(),
            expense: initialTotals(),
            net: initialTotals()
        };

        monthlyReports.forEach(monthData => {
            currencyKeys.forEach(c => {
                grandTotals.income[c] += monthData.income[c];
                grandTotals.expense[c] += monthData.expense[c];
                grandTotals.net[c] += monthData.net[c];
            });
        });

        return { monthlyReports, grandTotals };

    }, [transactions, startDate, endDate]);

    const handleClosePeriod = async () => {
        if (!endDate) {
            toast({ title: "ข้อผิดพลาด", description: "กรุณาเลือกวันที่สิ้นสุด", variant: "destructive" });
            return;
        }

        const confirmation = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการปิดงบการเงิน ณ วันที่ ${format(endDate, "PPP", { locale: th })}? การดำเนินการนี้จะสร้างธุรกรรมสรุปยอดและไม่สามารถย้อนกลับได้ง่าย`);
        if (!confirmation) return;

        const { grandTotals } = reportData;

        try {
            // Create a closing entry for expenses (becomes an income to offset)
            const expenseClosingTransaction: Omit<Transaction, 'id'> = {
                date: endDate,
                type: 'income',
                description: `ปิดงบการเงิน (รายจ่าย) ณ ${format(endDate, "dd/MM/yy")}`,
                amount: 0,
                ...grandTotals.expense
            };
            await addTourTransaction(expenseClosingTransaction);
            
            // Create a closing entry for incomes (becomes an expense to offset)
            const incomeClosingTransaction: Omit<Transaction, 'id'> = {
                date: endDate,
                type: 'expense',
                description: `ปิดงบการเงิน (รายรับ) ณ ${format(endDate, "dd/MM/yy")}`,
                amount: 0,
                ...grandTotals.income
            };
            await addTourTransaction(incomeClosingTransaction);

            toast({
                title: "ปิดงบการเงินสำเร็จ",
                description: `สร้างธุรกรรมสรุปยอด ณ วันที่ ${format(endDate, "PPP", { locale: th })} เรียบร้อยแล้ว`,
            });

        } catch (error) {
            console.error("Failed to close financial period:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถสร้างธุรกรรมปิดงบได้",
                variant: "destructive"
            });
        }
    };


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white">
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
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>ตัวกรองรายงาน</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start-date">วันที่เริ่มต้น</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="start-date" variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={th} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end-date">วันที่สิ้นสุด</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="end-date" variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={th} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="md:ml-auto">
                            <Button onClick={handleClosePeriod} variant="destructive">ปิดงบการเงิน</Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                         <CardDescription>
                            แสดงรายการธุรกรรมทั่วไปที่ไม่ผูกกับโปรแกรมทัวร์สำหรับช่วงวันที่ที่เลือก
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <h3 className="font-semibold">ยอดรวมสำหรับช่วงวันที่ที่เลือก</h3>
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
                                        {currencyKeys.map(c => <TableCell key={c} className="text-right text-green-600 font-mono">{formatCurrency(reportData.grandTotals.income[c])}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">รายจ่าย</TableCell>
                                        {currencyKeys.map(c => <TableCell key={c} className="text-right text-red-600 font-mono">{formatCurrency(reportData.grandTotals.expense[c])}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="font-bold bg-muted/80">
                                        <TableCell>กำไร/ขาดทุน</TableCell>
                                         {currencyKeys.map(c => (
                                            <TableCell key={c} className={`text-right font-mono ${reportData.grandTotals.net[c] >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                {formatCurrency(reportData.grandTotals.net[c])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {reportData.monthlyReports.length > 0 ? (
                           <div className="space-y-2">
                            {reportData.monthlyReports.map(({ year, month, net }) => (
                                <Link 
                                    href={`/tour/reports/general-ledger-month?year=${year}&month=${month}`} 
                                    key={`${year}-${month}`}
                                    passHref
                                >
                                    <Card className="hover:bg-muted/50 cursor-pointer">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="font-semibold text-base">
                                                {format(setMonth(new Date(year, month), month), 'LLLL yyyy', { locale: th })}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:grid grid-cols-4 gap-x-4 text-xs">
                                                    {currencyKeys.map(c => (
                                                        <div key={c} className="flex items-center justify-end gap-1">
                                                            <span className="font-bold uppercase text-muted-foreground">{c}:</span>
                                                            <span className={`font-mono w-20 text-right ${net[c] >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(net[c])}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                           </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                ไม่มีประวัติรับ-จ่ายทั่วไปในปีที่เลือก
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
