
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, FilePieChart, ChevronDown, BookOpen } from "lucide-react";
import { listenToAllTourPrograms, listenToAllTourCostItems, listenToAllTourIncomeItems } from '@/services/tourReportService';
import { listenToTourTransactions } from '@/services/tourAccountancyService';
import type { TourProgram, TourCostItem, TourIncomeItem, Currency, Transaction, CurrencyValues } from '@/lib/types';
import { getYear, format, getMonth, setMonth, isWithinInterval, startOfYear, endOfYear } from 'date-fns';
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

const currencies: Currency[] = ['KIP', 'BAHT', 'USD', 'CNY'];
const currencyKeys: (keyof CurrencyValues)[] = ['kip', 'baht', 'usd', 'cny'];


type ProgramReport = TourProgram & {
    totalCost: Record<Currency, number>;
    totalIncome: Record<Currency, number>;
    profit: Record<Currency, number>;
}

type YearlyReport = {
    year: number;
    programs: ProgramReport[];
    totalProfit: Record<Currency, number>;
}


export default function TourReportsPage() {
    const [programs, setPrograms] = useState<TourProgram[]>([]);
    const [costs, setCosts] = useState<TourCostItem[]>([]);
    const [incomes, setIncomes] = useState<TourIncomeItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

    useEffect(() => {
        const unsubscribePrograms = listenToAllTourPrograms(setPrograms);
        const unsubscribeCosts = listenToAllTourCostItems(setCosts);
        const unsubscribeIncomes = listenToAllTourIncomeItems(setIncomes);
        const unsubscribeTransactions = listenToTourTransactions(setTransactions);
        return () => {
            unsubscribePrograms();
            unsubscribeCosts();
            unsubscribeIncomes();
            unsubscribeTransactions();
        };
    }, []);

    const reportsData: YearlyReport[] = useMemo(() => {
        const costsByProgram = costs.reduce((acc, item) => {
            if (!acc[item.programId]) {
                acc[item.programId] = [];
            }
            acc[item.programId].push(item);
            return acc;
        }, {} as Record<string, TourCostItem[]>);

        const incomesByProgram = incomes.reduce((acc, item) => {
            if (!acc[item.programId]) {
                acc[item.programId] = [];
            }
            acc[item.programId].push(item);
            return acc;
        }, {} as Record<string, TourIncomeItem[]>);


        const programReports = programs.map(p => {
            const programCosts = costsByProgram[p.id] || [];
            const programIncomes = incomesByProgram[p.id] || [];

            const totalCost = programCosts.reduce((acc, item) => {
                currencies.forEach(c => acc[c] += item[c.toLowerCase() as keyof typeof item] as number || 0);
                return acc;
            }, { KIP: 0, BAHT: 0, USD: 0, CNY: 0 });

            const totalIncome = programIncomes.reduce((acc, item) => {
                currencies.forEach(c => acc[c] += item[c.toLowerCase() as keyof typeof item] as number || 0);
                return acc;
            }, { KIP: 0, BAHT: 0, USD: 0, CNY: 0 });

            const profit = currencies.reduce((acc, c) => {
                acc[c] = totalIncome[c] - totalCost[c];
                return acc;
            }, { KIP: 0, BAHT: 0, USD: 0, CNY: 0 });

            return { ...p, totalCost, totalIncome, profit };
        });


        const groupedByYear = programReports.reduce((acc, report) => {
            const year = getYear(report.date);
            if (!acc[year]) {
                acc[year] = { year, programs: [], totalProfit: { KIP: 0, BAHT: 0, USD: 0, CNY: 0 } };
            }
            acc[year].programs.push(report);
            currencies.forEach(c => acc[year].totalProfit[c] += report.profit[c]);
            return acc;
        }, {} as Record<number, YearlyReport>);
        
        return Object.values(groupedByYear).sort((a, b) => b.year - a.year);

    }, [programs, costs, incomes]);
    
    const filteredReport = useMemo(() => {
        return reportsData.find(r => r.year === selectedYear);
    }, [reportsData, selectedYear]);

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


    const YearSelector = () => {
        const years = Array.from(new Set(reportsData.map(r => r.year))).sort((a,b) => b - a);
        if (years.length === 0 && !years.includes(selectedYear)) {
            years.unshift(selectedYear);
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
                    <Link href="/tour">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้าหลัก</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <FilePieChart className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">สรุปยอดธุรกิจทัวร์</h1>
                </div>
                 <div className="ml-auto">
                    <YearSelector />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-lg font-semibold bg-white p-4 rounded-lg shadow-sm border hover:bg-muted/50 no-underline hover:no-underline">
                             <div className="flex items-center gap-2">
                                <FilePieChart className="h-5 w-5 text-primary" />
                                <span>สรุปผลประกอบการรายโปรแกรม</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>ภาพรวมปี {selectedYear + 543}</CardTitle>
                                    <CardDescription>ภาพรวมกำไร-ขาดทุน และรายละเอียดของแต่ละโปรแกรม</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                {filteredReport ? (
                                    <>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <h3 className="text-md font-semibold mb-2">ภาพรวมกำไร/ขาดทุน ประจำปี {selectedYear + 543}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {currencies.map(c => (
                                                <div key={c} className="p-3 bg-background rounded-lg border">
                                                    <p className="text-sm text-muted-foreground">{c}</p>
                                                    <p className={`text-xl font-bold ${filteredReport.totalProfit[c] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(filteredReport.totalProfit[c])}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-md font-semibold mb-2 mt-4">รายละเอียดรายโปรแกรม</h3>
                                        <Accordion type="single" collapsible className="w-full">
                                            {filteredReport.programs.map((program) => (
                                                <AccordionItem value={program.id} key={program.id}>
                                                    <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                                                        <div className="flex justify-between w-full pr-4 items-center">
                                                            <div className="text-left">
                                                                <p className="font-bold">{program.programName}</p>
                                                                <p className="text-sm text-muted-foreground">{program.tourCode} | {format(program.date, "dd MMM yyyy", { locale: th })}</p>
                                                            </div>
                                                            <div className="flex gap-4 text-xs font-mono text-right">
                                                                {currencies.map(c => (
                                                                    <div key={c} className="w-24">
                                                                        <span className="text-muted-foreground">{c}: </span> 
                                                                        <span className={program.profit[c] >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(program.profit[c])}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-2">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>สกุลเงิน</TableHead>
                                                                    <TableHead className="text-right">รายรับรวม</TableHead>
                                                                    <TableHead className="text-right">ต้นทุนรวม</TableHead>
                                                                    <TableHead className="text-right">กำไร/ขาดทุน</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {currencies.map(c => (
                                                                    <TableRow key={c}>
                                                                        <TableCell className="font-medium">{c}</TableCell>
                                                                        <TableCell className="text-right text-green-600">{formatCurrency(program.totalIncome[c])}</TableCell>
                                                                        <TableCell className="text-right text-red-600">{formatCurrency(program.totalCost[c])}</TableCell>
                                                                        <TableCell className={`text-right font-bold ${program.profit[c] >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                                            {formatCurrency(program.profit[c])}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableFooter>
                                                                <TableRow>
                                                                    <TableCell colSpan={4} className="text-right print:hidden">
                                                                        <Button variant="outline" size="sm" asChild>
                                                                            <Link href={`/tour-programs/${program.id}`}>ไปที่หน้ารายละเอียด</Link>
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableFooter>
                                                        </Table>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <p>ไม่มีข้อมูลโปรแกรมสำหรับปี {selectedYear + 543}</p>
                                    </div>
                                )}
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-lg font-semibold bg-white p-4 rounded-lg shadow-sm border hover:bg-muted/50 no-underline hover:no-underline">
                             <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> ประวัติรับ-จ่ายทั่วไป</div>
                        </AccordionTrigger>
                         <AccordionContent className="pt-4">
                             <Card>
                                 <CardHeader>
                                     <CardDescription>แสดงรายการธุรกรรมทั่วไปที่ไม่ผูกกับโปรแกรมทัวร์ในปี {selectedYear + 543}</CardDescription>
                                 </CardHeader>
                                 <CardContent>
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
                         </AccordionContent>
                    </AccordionItem>
                 </Accordion>
            </main>
        </div>
    );
}
