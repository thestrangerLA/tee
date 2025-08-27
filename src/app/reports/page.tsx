
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, BarChart } from "lucide-react";
import { listenToTransactions } from '@/services/accountancyService';
import type { Transaction } from '@/lib/types';
import { getYear, getMonth, format } from 'date-fns';
import { th } from "date-fns/locale";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(value).replace('LAK', 'KIP');
};

type MonthlySummary = {
    month: number;
    income: number;
    expense: number;
    net: number;
}

type YearlySummary = {
    year: number;
    income: number;
    expense: number;
    net: number;
    months: MonthlySummary[];
}

export default function ReportsPage() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const unsubscribe = listenToTransactions(setAllTransactions);
        return () => unsubscribe();
    }, []);

    const reportsData: YearlySummary[] = useMemo(() => {
        const groupedByYear: Record<number, Record<number, { income: number, expense: number }>> = {};

        allTransactions.forEach(tx => {
            const year = getYear(tx.date);
            const month = getMonth(tx.date); // 0-11

            if (!groupedByYear[year]) {
                groupedByYear[year] = {};
            }
            if (!groupedByYear[year][month]) {
                groupedByYear[year][month] = { income: 0, expense: 0 };
            }

            if (tx.type === 'income') {
                groupedByYear[year][month].income += tx.amount;
            } else {
                groupedByYear[year][month].expense += tx.amount;
            }
        });

        const result: YearlySummary[] = Object.entries(groupedByYear).map(([yearStr, monthsData]) => {
            const year = parseInt(yearStr);
            let yearlyIncome = 0;
            let yearlyExpense = 0;

            const months: MonthlySummary[] = Object.entries(monthsData).map(([monthStr, data]) => {
                const month = parseInt(monthStr);
                const net = data.income - data.expense;
                yearlyIncome += data.income;
                yearlyExpense += data.expense;
                return { month, income: data.income, expense: data.expense, net };
            }).sort((a, b) => a.month - b.month);

            return {
                year,
                income: yearlyIncome,
                expense: yearlyExpense,
                net: yearlyIncome - yearlyExpense,
                months
            };
        }).sort((a, b) => b.year - a.year); // Sort years descending

        return result;

    }, [allTransactions]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้าหลัก</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <BarChart className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">สรุปยอดรายปี/รายเดือน</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>สรุปผลประกอบการ</CardTitle>
                        <CardDescription>แสดงรายรับ, รายจ่าย และกำไรสุทธิ แยกตามปีและเดือน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reportsData.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                                {reportsData.map((yearSummary, index) => (
                                    <AccordionItem value={`item-${index}`} key={yearSummary.year}>
                                        <AccordionTrigger className="bg-muted/50 px-4 rounded-md">
                                            <div className="flex justify-between w-full pr-4 text-lg font-bold">
                                                <span>ปี {yearSummary.year + 543}</span>
                                                <div className="flex gap-4">
                                                    <span className="text-green-600">รับ: {formatCurrency(yearSummary.income)}</span>
                                                    <span className="text-red-600">จ่าย: {formatCurrency(yearSummary.expense)}</span>
                                                    <span className={yearSummary.net >= 0 ? 'text-blue-600' : 'text-red-600'}>
                                                        กำไร: {formatCurrency(yearSummary.net)}
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-1/4">เดือน</TableHead>
                                                        <TableHead className="text-right text-green-600">รายรับ</TableHead>
                                                        <TableHead className="text-right text-red-600">รายจ่าย</TableHead>
                                                        <TableHead className="text-right">กำไร/ขาดทุนสุทธิ</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {yearSummary.months.map(monthSummary => (
                                                         <TableRow key={monthSummary.month}>
                                                            <TableCell className="font-medium">
                                                                {format(new Date(yearSummary.year, monthSummary.month), "LLLL", { locale: th })}
                                                            </TableCell>
                                                            <TableCell className="text-right">{formatCurrency(monthSummary.income)}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(monthSummary.expense)}</TableCell>
                                                            <TableCell className={`text-right font-semibold ${monthSummary.net >= 0 ? '' : 'text-red-600'}`}>{formatCurrency(monthSummary.net)}</TableCell>
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
                                ไม่มีข้อมูลธุรกรรม
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
