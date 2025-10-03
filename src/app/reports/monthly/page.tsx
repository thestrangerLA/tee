
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, AlertCircle, Wallet, Users, Truck, UserMinus, PiggyBank, Combine, DollarSign, Tags } from "lucide-react";
import { listenToAllTransactions, listenToAccountSummary } from '@/services/accountancyService';
import { listenToDebtorCreditorEntries } from '@/services/debtorCreditorService';
import { listenToTransportEntries } from '@/services/transportService';
import { listenToAllDrugCreditorEntries } from '@/services/drugCreditorService';
import { listenToStockItems } from '@/services/stockService';

import type { Transaction, AccountSummary, DebtorCreditorEntry, TransportEntry, DrugCreditorEntry, StockItem } from '@/lib/types';
import { format, isWithinInterval, startOfMonth, endOfMonth, isValid, getYear, getMonth } from 'date-fns';

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

const PrintSummaryCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="border rounded-lg p-2 flex flex-col items-center justify-center text-center">
        {icon}
        <h4 className="text-xs font-semibold mt-1">{title}</h4>
        <p className="text-sm font-bold">{value}</p>
    </div>
);


function MonthlyReportPageComponent() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
    const [debtorEntries, setDebtorEntries] = useState<DebtorCreditorEntry[]>([]);
    const [transportEntries, setTransportEntries] = useState<TransportEntry[]>([]);
    const [drugCreditorEntries, setDrugCreditorEntries] = useState<DrugCreditorEntry[]>([]);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    
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
            const unsubTransactions = listenToAllTransactions(setTransactions);
            const unsubSummary = listenToAccountSummary('agriculture', setAccountSummary);
            const unsubDebtors = listenToDebtorCreditorEntries(setDebtorEntries);
            const unsubTransport = listenToTransportEntries(setTransportEntries);
            const unsubDrugCreditors = listenToAllDrugCreditorEntries(setDrugCreditorEntries);
            const unsubStock = listenToStockItems(setStockItems);
            
            const timer = setTimeout(() => setLoading(false), 1500); // Give time for all listeners to fetch initial data

            return () => {
                unsubTransactions();
                unsubSummary();
                unsubDebtors();
                unsubTransport();
                unsubDrugCreditors();
                unsubStock();
                clearTimeout(timer);
            };
        } catch (err) {
            console.error('Error setting up listeners:', err);
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
    
    const summaryCardData = useMemo(() => {
        const totalMoney = (accountSummary?.cash || 0) + (accountSummary?.transfer || 0);

        const totalDebtors = debtorEntries
            .filter(e => e.type === 'debtor' && !e.isPaid)
            .reduce((sum, entry) => sum + entry.amount, 0);

        const transportRemaining = transportEntries
            .reduce((total, row) => {
                let remaining = 0;
                if (!row.finished) remaining += (row.amount || 0);
                return total + remaining;
            }, 0);
        
        const drugCreditorsPayable = drugCreditorEntries
            .filter(e => !e.isPaid)
            .reduce((sum, entry) => {
                const profit = (entry.sellingPrice || 0) - (entry.cost || 0);
                const share40 = profit * 0.4;
                return sum + (entry.cost || 0) + share40;
            }, 0);

        const grandTotalMoney = totalMoney + totalDebtors + transportRemaining + drugCreditorsPayable;

        return { totalMoney, totalDebtors, transportRemaining, drugCreditorsPayable, grandTotalMoney };
    }, [accountSummary, debtorEntries, transportEntries, drugCreditorEntries]);

    const stockValueData = useMemo(() => {
        const totalStockValueKip = stockItems.reduce((acc, item) => acc + item.currentStock * item.costPrice, 0);
        
        const valuePerCategoryKip = stockItems.reduce((acc, item) => {
            const value = item.currentStock * item.costPrice;
            if (!acc[item.category]) {
                acc[item.category] = 0;
            }
            acc[item.category] += value;
            return acc;
        }, {} as Record<string, number>);

        return { totalStockValueKip, valuePerCategoryKip };
    }, [stockItems]);

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
                <h1 className="text-xl font-bold tracking-tight">ລາຍງານປະຈຳເດືອນ: {headerTitle}</h1>
                <div className="ml-auto">
                    <Button onClick={handlePrint} variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        ພິມ
                    </Button>
                </div>
            </header>
            
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 print:p-2 print:gap-2">
                <div className="hidden print:block text-center mb-4">
                    <h1 className="text-xl font-bold">ລາຍງານປະຈຳເດືອນ (ທຸລະກິດກະສິກຳ)</h1>
                    <p className="text-sm text-muted-foreground">ສຳລັບເດືອນ {headerTitle}</p>
                </div>

                <div className="hidden print:block mb-4">
                    <h2 className="text-lg font-bold text-center mb-2">ສະຫຼຸບຍອດທຸລະກິດ</h2>
                     <div className="grid grid-cols-5 gap-2">
                        <PrintSummaryCard title="ລວມເງິນ" value={formatCurrency(summaryCardData.totalMoney)} icon={<Combine className="h-5 w-5 text-green-600" />} />
                        <PrintSummaryCard title="ລູກໜີ້ທົ່ວໄປ" value={formatCurrency(summaryCardData.totalDebtors)} icon={<Users className="h-5 w-5 text-yellow-600" />} />
                        <PrintSummaryCard title="ຄ່າຂົນສົ່ງ" value={formatCurrency(summaryCardData.transportRemaining)} icon={<Truck className="h-5 w-5 text-red-600" />} />
                        <PrintSummaryCard title="ລູກໜີ້ຄ່າຢາ" value={formatCurrency(summaryCardData.drugCreditorsPayable)} icon={<UserMinus className="h-5 w-5 text-rose-500" />} />
                        <PrintSummaryCard title="ລວມທັງໝົດ" value={formatCurrency(summaryCardData.grandTotalMoney)} icon={<PiggyBank className="h-5 w-5 text-blue-600" />} />
                    </div>
                </div>

                <div className="hidden print:block mb-4 space-y-2">
                    <h2 className="text-lg font-bold text-center mb-2">ສະຫຼຸບຍອດສະຕັອກ (ກີບ)</h2>
                    <PrintSummaryCard 
                        title="ມູນຄ່າສະຕັອກທັງໝົດ" 
                        value={formatCurrency(stockValueData.totalStockValueKip)} 
                        icon={<DollarSign className="h-5 w-5 text-primary" />} 
                    />
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(stockValueData.valuePerCategoryKip).sort(([a], [b]) => a.localeCompare(b)).map(([category, value]) => (
                            <PrintSummaryCard
                                key={category}
                                title={category}
                                value={formatCurrency(value)}
                                icon={<Tags className="h-4 w-4 text-muted-foreground" />}
                            />
                        ))}
                    </div>
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

export default function MonthlyReportPageWrapper() {
    return (
        <StaticExportWrapper>
            <MonthlyReportPageComponent />
        </StaticExportWrapper>
    )
}
