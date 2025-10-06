
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Printer, AlertCircle } from "lucide-react";
import { listenToAllMeatTransactions } from '@/services/meatReportService';
import type { Transaction } from '@/lib/types';
import { format, isWithinInterval, startOfMonth, endOfMonth, isValid } from 'date-fns';

import { useClientSearchParams } from '@/hooks/useClientSearchParams';
import StaticExportWrapper from '@/components/StaticExportWrapper';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

function ErrorDisplay({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                    <h3 className="text-lg font-semibold">ເກີດຂໍ້ຜິດພາດ</h3>
                    <p className="text-muted-foreground">{message}</p>
                </div>
            </div>
        </div>
    );
}

function MeatGeneralLedgerMonthPageComponent() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const searchParams = useClientSearchParams();
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const { displayDate, isValidParams } = useMemo(() => {
        if (!year || !month) return { displayDate: new Date(), isValidParams: false };
        const yearNum = Number(year);
        const monthNum = Number(month);
        const isValid = yearNum >= 1900 && yearNum <= 2100 && monthNum >= 0 && monthNum <= 11;
        if (!isValid) return { displayDate: new Date(), isValidParams: false };
        return { displayDate: new Date(yearNum, monthNum), isValidParams: true };
    }, [year, month]);

    const handlePrint = useCallback(() => {
        if (typeof window !== 'undefined') window.print();
    }, []);

    useEffect(() => {
        setLoading(true);
        setError(null);
        try {
            const unsubscribe = listenToAllMeatTransactions(
                (newTransactions) => { setTransactions(newTransactions); setLoading(false); },
                (error) => { console.error('Error loading transactions:', error); setError('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນທຸລະກຳໄດ້'); setLoading(false); }
            );
            return () => unsubscribe();
        } catch (err) {
            console.error('Error setting up transaction listener:', err);
            setError('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບລະບົບຖານຂໍ້ມູນໄດ້');
            setLoading(false);
        }
    }, []);
    
    const reportData = useMemo(() => {
        if (!isValidParams) return { transactions: [], income: 0, expense: 0, net: 0 };
        const startDate = startOfMonth(displayDate);
        const endDate = endOfMonth(displayDate);
        const monthlyTransactions = transactions.filter(tx => tx.date && isValid(tx.date) && isWithinInterval(tx.date, { start: startDate, end: endDate }));
        const income = monthlyTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const expense = monthlyTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const net = income - expense;
        return { transactions: monthlyTransactions, income, expense, net };
    }, [transactions, displayDate, isValidParams]);

    if (error) return <ErrorDisplay message={error} />;
    if (!isValidParams) return <ErrorDisplay message="ພາລາມີເຕີ້ປີ ຫຼື ເດືອນບໍ່ຖືກຕ້ອງ" />;
    if (loading) {
         return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">ກຳລັງໂຫຼດ...</p>
                    </div>
                </div>
            </div>
        );
    }

    const headerTitle = format(displayDate, 'LLLL yyyy');
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/meat-business/reports/general-ledger">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າລາຍງານຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary"/>
                    <h1 className="text-xl font-bold tracking-tight">ປະຫວັດຮັບ-ຈ່າຍ: {headerTitle}</h1>
                </div>
                <div className="ml-auto">
                    <Button onClick={handlePrint} variant="outline" size="sm" disabled={reportData.transactions.length === 0}>
                        <Printer className="mr-2 h-4 w-4" />
                        ພິມ
                    </Button>
                </div>
            </header>
            
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 print:p-2 print:gap-2">
                <div className="hidden print:block text-center mb-4">
                    <h1 className="text-xl font-bold">ປະຫວັດຮັບ-ຈ່າຍທົ່ວໄປ (ທຸລະກິດຊີ້ນ)</h1>
                    <p className="text-sm text-muted-foreground">ສຳລັບເດືອນ {headerTitle}</p>
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
                                    <TableRow className="text-xs"><TableHead>ປະເພດ</TableHead><TableHead className="text-right">KIP</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow><TableCell className="font-medium">ລາຍຮັບ</TableCell><TableCell className="text-right text-green-600 font-mono">{formatCurrency(reportData.income)}</TableCell></TableRow>
                                    <TableRow><TableCell className="font-medium">ລາຍຈ່າຍ</TableCell><TableCell className="text-right text-red-600 font-mono">{formatCurrency(reportData.expense)}</TableCell></TableRow>
                                    <TableRow className="font-bold bg-muted/80"><TableCell>ກຳໄລ/ຂາດທຶນ</TableCell><TableCell className={`text-right font-mono ${reportData.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(reportData.net)}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold my-4 print:my-2 print:text-base print:border-b print:pb-1">ລາຍລະອຽດທຸລະກຳ</h3>
                            {reportData.transactions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow><TableHead>ວັນທີ</TableHead><TableHead>ຄຳອະທິບາຍ</TableHead><TableHead>ປະເພດ</TableHead><TableHead className="text-right">KIP</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.transactions.map(tx => (
                                            <TableRow key={tx.id} className={tx.type === 'income' ? 'bg-green-50/30' : 'bg-red-50/30'}>
                                                <TableCell>{tx.date && isValid(tx.date) ? format(tx.date, 'dd/MM/yy') : '-'}</TableCell>
                                                <TableCell className="max-w-xs truncate" title={tx.description || ''}>{tx.description || '-'}</TableCell>
                                                <TableCell>{tx.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'}</TableCell>
                                                <TableCell className={`text-right font-mono ${tx.amount > 0 ? (tx.type === 'income' ? 'text-green-700' : 'text-red-700') : ''}`}>{tx.amount > 0 ? formatCurrency(tx.amount) : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">ບໍ່ມີປະຫວັດຮັບ-ຈ່າຍໃນເດືອນນີ້</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default function MeatGeneralLedgerMonthPageWrapper() {
    return (
        <StaticExportWrapper>
            <MeatGeneralLedgerMonthPageComponent />
        </StaticExportWrapper>
    )
}
