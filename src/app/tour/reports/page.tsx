
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePieChart } from "lucide-react";
import { listenToTourPrograms, listenToTourCostItemsForProgram, listenToTourIncomeItemsForProgram } from '@/services/tourProgramService';
import type { TourProgram, TourCostItem, TourIncomeItem } from '@/lib/types';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

interface ProgramReport extends TourProgram {
    totalIncome: { kip: number, baht: number, usd: number, cny: number };
    totalCost: { kip: number, baht: number, usd: number, cny: number };
    profit: { kip: number, baht: number, usd: number, cny: number };
}

export default function TourReportsPage() {
    const [programs, setPrograms] = useState<TourProgram[]>([]);
    const [allCosts, setAllCosts] = useState<Record<string, TourCostItem[]>>({});
    const [allIncomes, setAllIncomes] = useState<Record<string, TourIncomeItem[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribePrograms = listenToTourPrograms(setPrograms);
        return () => unsubscribePrograms();
    }, []);

    useEffect(() => {
        if (programs.length === 0) {
            setLoading(false);
            return;
        };

        const unsubscribers: (() => void)[] = [];
        let loadedCount = 0;

        programs.forEach(program => {
            const unsubCosts = listenToTourCostItemsForProgram(program.id, (items) => {
                setAllCosts(prev => ({ ...prev, [program.id]: items }));
            });
            const unsubIncomes = listenToTourIncomeItemsForProgram(program.id, (items) => {
                setAllIncomes(prev => ({ ...prev, [program.id]: items }));
                
                // A simple way to check if all data is loaded
                loadedCount++;
                if (loadedCount >= programs.length * 2) { // once for cost, once for income
                    setLoading(false);
                }
            });
            unsubscribers.push(unsubCosts, unsubIncomes);
        });

        // Fallback to stop loading after a timeout
        const timer = setTimeout(() => setLoading(false), 5000);

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(timer);
        };
    }, [programs]);

    const reportsData = useMemo<ProgramReport[]>(() => {
        return programs.map(program => {
            const costs = allCosts[program.id] || [];
            const incomes = allIncomes[program.id] || [];

            const totalCost = costs.reduce((acc, item) => {
                acc.kip += item.kip || 0;
                acc.baht += item.baht || 0;
                acc.usd += item.usd || 0;
                acc.cny += item.cny || 0;
                return acc;
            }, { kip: 0, baht: 0, usd: 0, cny: 0 });

            const totalIncome = incomes.reduce((acc, item) => {
                acc.kip += item.kip || 0;
                acc.baht += item.baht || 0;
                acc.usd += item.usd || 0;
                acc.cny += item.cny || 0;
                return acc;
            }, { kip: 0, baht: 0, usd: 0, cny: 0 });

            const profit = {
                kip: totalIncome.kip - totalCost.kip,
                baht: totalIncome.baht - totalCost.baht,
                usd: totalIncome.usd - totalCost.usd,
                cny: totalIncome.cny - totalCost.cny,
            };

            return { ...program, totalCost, totalIncome, profit };
        });
    }, [programs, allCosts, allIncomes]);
    
    const CurrencyDisplay = ({ values, isProfit = false }: { values: { [key:string]: number }, isProfit?: boolean}) => {
        const currencies = Object.keys(values).filter(c => values[c] !== 0);
        if (currencies.length === 0) return <span>-</span>;
        return (
            <div className="flex flex-col items-end">
                {currencies.map(currency => {
                     const value = values[currency as keyof typeof values];
                     const color = isProfit ? (value >= 0 ? 'text-green-600' : 'text-red-600') : '';
                    return (
                        <span key={currency} className={`text-xs ${color}`}>
                            {formatCurrency(value)} {currency.toUpperCase()}
                        </span>
                    )
                })}
            </div>
        )
    }

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
                    <h1 className="text-xl font-bold tracking-tight">รายงานสรุปโปรแกรมทัวร์</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>ภาพรวมผลประกอบการ</CardTitle>
                        <CardDescription>สรุปรายรับ, ค่าใช้จ่าย, และกำไร/ขาดทุน ของแต่ละโปรแกรม</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>โปรแกรม</TableHead>
                                        <TableHead>รหัสทัวร์</TableHead>
                                        <TableHead>กลุ่ม</TableHead>
                                        <TableHead className="text-right">รวมยอดรับ</TableHead>
                                        <TableHead className="text-right">รวมยอดจ่าย</TableHead>
                                        <TableHead className="text-right">กำไร/ขาดทุน</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">กำลังโหลดข้อมูลรายงาน...</TableCell>
                                        </TableRow>
                                    ) : reportsData.length > 0 ? (
                                        reportsData.map(report => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.programName}</TableCell>
                                                <TableCell>{report.tourCode}</TableCell>
                                                <TableCell>{report.groupName}</TableCell>
                                                <TableCell className="text-right">
                                                    <CurrencyDisplay values={report.totalIncome} />
                                                </TableCell>
                                                 <TableCell className="text-right">
                                                    <CurrencyDisplay values={report.totalCost} />
                                                </TableCell>
                                                 <TableCell className="text-right font-semibold">
                                                     <CurrencyDisplay values={report.profit} isProfit={true} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                ยังไม่มีข้อมูลโปรแกรมทัวร์
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
