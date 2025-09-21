
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator, ChevronDown } from "lucide-react";
import { listenToTransactions } from '@/services/accountancyService';
import type { Transaction } from '@/lib/types';
import { getYear, startOfYear, endOfYear, isWithinInterval, subYears } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(value).replace('LAK', 'KIP');
};

const taxBrackets = [
    { range: "0 - 1,300,000", from: 0, to: 1300000, rate: 0, maxAmount: 0 },
    { range: "1,300,001 - 5,000,000", from: 1300000, to: 5000000, rate: 5, maxAmount: 185000 },
    { range: "5,000,001 - 15,000,000", from: 5000000, to: 15000000, rate: 10, maxAmount: 1000000 },
    { range: "15,000,001 - 25,000,000", from: 15000000, to: 25000000, rate: 15, maxAmount: 1500000 },
    { range: "25,000,001 - 50,000,000", from: 25000000, to: 50000000, rate: 20, maxAmount: 5000000 },
    { range: "ຫຼາຍກວ່າ 50,000,000", from: 50000000, to: Infinity, rate: 25, maxAmount: Infinity },
];

interface TaxCalculationResult {
    tier: string;
    taxableIncome: number;
    rate: number;
    taxAmount: number;
}

export default function TaxCalculatorPage() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
    const [annualIncome, setAnnualIncome] = useState(0);
    const [taxResults, setTaxResults] = useState<TaxCalculationResult[]>([]);
    const [totalTax, setTotalTax] = useState(0);

    useEffect(() => {
        const unsubscribe = listenToTransactions('agriculture', setAllTransactions);
        return () => unsubscribe();
    }, []);

    const calculateAnnualIncome = () => {
        const yearDate = new Date(selectedYear, 0, 1);
        const start = startOfYear(yearDate);
        const end = endOfYear(yearDate);

        const yearlyTransactions = allTransactions.filter(tx => isWithinInterval(tx.date, { start, end }));
        
        const income = yearlyTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const expense = yearlyTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const netIncome = income - expense;
        setAnnualIncome(netIncome > 0 ? netIncome : 0);
        return netIncome > 0 ? netIncome : 0;
    };

    const handleCalculateClick = () => {
        const calculatedIncome = calculateAnnualIncome();
        calculateTax(calculatedIncome);
    };

    const calculateTax = (incomeToCalculate: number) => {
        let remainingIncome = incomeToCalculate;
        const results: TaxCalculationResult[] = [];
        let cumulativeTax = 0;

        for (const bracket of taxBrackets) {
            if (remainingIncome <= 0) break;

            const taxableAtThisTier = Math.min(remainingIncome, bracket.to - bracket.from);
            
            // For the first tier (0%), ensure we don't calculate on income below the 'from' value
            if (bracket.from > 0 && incomeToCalculate < bracket.from) {
                 results.push({
                    tier: bracket.range,
                    taxableIncome: 0,
                    rate: bracket.rate,
                    taxAmount: 0,
                });
                continue;
            }

            const taxAtThisTier = taxableAtThisTier * (bracket.rate / 100);

            results.push({
                tier: bracket.range,
                taxableIncome: taxableAtThisTier,
                rate: bracket.rate,
                taxAmount: taxAtThisTier,
            });

            cumulativeTax += taxAtThisTier;
            remainingIncome -= taxableAtThisTier;
             if (remainingIncome + taxableAtThisTier < bracket.from) break;
        }

        setTaxResults(results);
        setTotalTax(cumulativeTax);
    };
    
    const YearSelector = () => {
        const currentYear = getYear(new Date());
        const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <span>ປີ {selectedYear + 543}</span>
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
                    <Link href="/agriculture">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄິດໄລ່ພາສີເງິນໄດ້ບຸກຄົນທຳມະດາ</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>ເຄື່ອງມືຄິດໄລ່ພາສີ</CardTitle>
                            <CardDescription>ເລືອກປີທີ່ຕ້ອງການຄິດໄລ່, ຈາກນັ້ນກົດປຸ່ມເພື່ອດຶງຂໍ້ມູນ ແລະ ຄິດໄລ່ພາສີ</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                             <div className="grid gap-3">
                                <Label>ເລືອກປີຄິດໄລ່</Label>
                                <YearSelector />
                             </div>
                             <div className="grid gap-3">
                                <Label htmlFor="annual-income">ລາຍໄດ້ສຸດທິປະຈຳປີ (KIP)</Label>
                                <Input 
                                    id="annual-income" 
                                    type="number" 
                                    placeholder="ກົດປຸ່ມດ້ານລຸ່ມເພື່ອຄິດໄລ່"
                                    value={annualIncome || ''}
                                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">ລະບົບຈະຄິດໄລ່ຈາກ (ລາຍຮັບ - ລາຍຈ່າຍ) ໃນປີທີ່ເລືອກ ຫຼື ທ່ານສາມາດປ້ອນເອງໄດ້</p>
                            </div>
                            <Button onClick={handleCalculateClick}>ດຶງຂໍ້ມູນ & ຄິດໄລ່ພາສີ</Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>ອັດຕາພາສີເງິນໄດ້ (ອ້າງອີງ)</CardTitle>
                             <CardDescription>ອັດຕາພາສີເງິນໄດ້ບຸກຄົນທຳມະດາຕາມກົດໝາຍ ສປປ. ລາວ</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ຂັ້ນເງິນໄດ້ (KIP)</TableHead>
                                        <TableHead className="text-right">ອັດຕາພາສີ (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taxBrackets.map((bracket, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{bracket.range}</TableCell>
                                            <TableCell className="text-right">{bracket.rate}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {taxResults.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>ຜົນການຄິດໄລ່ພາສີ</CardTitle>
                            <CardDescription>
                                ຈາກລາຍໄດ້ສຸດທິປະຈຳປີ: {formatCurrency(annualIncome)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ຂັ້ນເງິນໄດ້ (KIP)</TableHead>
                                        <TableHead className="text-right">ລາຍໄດ້ທີ່ຕ້ອງເສຍພາສີ</TableHead>
                                        <TableHead className="text-right">ອັດຕາພາສີ (%)</TableHead>
                                        <TableHead className="text-right">ພາສີທີ່ຕ້ອງຊຳລະ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taxResults.filter(r => r.taxableIncome > 0).map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{result.tier}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(result.taxableIncome)}</TableCell>
                                            <TableCell className="text-right">{result.rate}%</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(result.taxAmount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-6 flex justify-end">
                                <Card className="w-full max-w-sm p-4 bg-muted">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">ລວມພາສີທີ່ຕ້ອງຊຳລະທັງໝົດ</CardTitle>
                                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalTax)}</p>
                                    </div>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
