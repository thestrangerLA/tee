
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(value).replace('LAK', 'KIP');
};

const taxBrackets = [
    { range: "0 - 1,300,000", from: 0, to: 1300000, rate: 0, maxAmount: 0 },
    { range: "1,300,001 - 5,000,000", from: 1300000, to: 5000000, rate: 5, maxAmount: 185000 },
    { range: "5,000,001 - 15,000,000", from: 5000000, to: 15000000, rate: 10, maxAmount: 1000000 },
    { range: "15,000,001 - 25,000,000", from: 15000000, to: 25000000, rate: 15, maxAmount: 1500000 },
    { range: "25,000,001 - 50,000,000", from: 25000000, to: 50000000, rate: 20, maxAmount: 5000000 },
    { range: "มากกว่า 50,000,000", from: 50000000, to: Infinity, rate: 25, maxAmount: Infinity },
];

interface TaxCalculationResult {
    tier: string;
    taxableIncome: number;
    rate: number;
    taxAmount: number;
}

export default function TaxCalculatorPage() {
    const [annualIncome, setAnnualIncome] = useState(0);
    const [taxResults, setTaxResults] = useState<TaxCalculationResult[]>([]);
    const [totalTax, setTotalTax] = useState(0);

    const calculateTax = () => {
        let remainingIncome = annualIncome;
        const results: TaxCalculationResult[] = [];
        let cumulativeTax = 0;

        for (const bracket of taxBrackets) {
            if (remainingIncome <= 0) break;

            const taxableAtThisTier = Math.min(remainingIncome, bracket.to - bracket.from);
            const taxAtThisTier = taxableAtThisTier * (bracket.rate / 100);

            results.push({
                tier: bracket.range,
                taxableIncome: taxableAtThisTier,
                rate: bracket.rate,
                taxAmount: taxAtThisTier,
            });

            cumulativeTax += taxAtThisTier;
            remainingIncome -= taxableAtThisTier;
        }

        setTaxResults(results);
        setTotalTax(cumulativeTax);
    };

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
                    <Calculator className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">คำนวณภาษีเงินได้บุคคลธรรมดา</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>เครื่องมือคำนวณภาษี</CardTitle>
                            <CardDescription>ป้อนรายได้สุทธิประจำปีของคุณเพื่อคำนวณภาษีที่ต้องชำระ</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                             <div className="grid gap-3">
                                <Label htmlFor="annual-income">รายได้สุทธิประจำปี (KIP)</Label>
                                <Input 
                                    id="annual-income" 
                                    type="number" 
                                    placeholder="กรอกรายได้สุทธิ"
                                    value={annualIncome || ''}
                                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                />
                            </div>
                            <Button onClick={calculateTax}>คำนวณภาษี</Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>อัตราภาษีเงินได้ (อ้างอิง)</CardTitle>
                             <CardDescription>อัตราภาษีเงินได้บุคคลธรรมดาตามกฎหมาย สปป. ลาว</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ขั้นเงินได้ (KIP)</TableHead>
                                        <TableHead className="text-right">อัตราภาษี (%)</TableHead>
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
                            <CardTitle>ผลการคำนวณภาษี</CardTitle>
                            <CardDescription>
                                จากรายได้สุทธิประจำปี: {formatCurrency(annualIncome)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ขั้นเงินได้ (KIP)</TableHead>
                                        <TableHead className="text-right">รายได้ที่ต้องเสียภาษี</TableHead>
                                        <TableHead className="text-right">อัตราภาษี (%)</TableHead>
                                        <TableHead className="text-right">ภาษีที่ต้องชำระ</TableHead>
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
                                        <CardTitle className="text-lg">รวมภาษีที่ต้องชำระทั้งหมด</CardTitle>
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
