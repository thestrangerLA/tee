
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Wallet, Briefcase, Pencil, PiggyBank, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listenToTourAccountSummary, updateTourAccountSummary } from '@/services/tourAccountancyService';
import { listenToTourPrograms } from '@/services/tourProgramService';
import type { TourAccountSummary, TourProgram } from '@/lib/types';
import { listenToAllTourCostItems, listenToAllTourIncomeItems } from '@/services/tourReportService';
import type { TourCostItem, TourIncomeItem } from '@/lib/types';

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

const SummaryCard = ({ title, value, currency, icon, onClick, className }: { title: string, value: string, currency?: string, icon: React.ReactNode, onClick?: () => void, className?: string }) => (
    <Card className={`${onClick ? 'cursor-pointer hover:bg-muted/80' : ''} ${className || ''}`} onClick={onClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
               <CardTitle className="text-sm font-medium">{title}</CardTitle>
               {onClick && <Pencil className="h-3 w-3 text-muted-foreground" />}
            </div>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {currency && <p className="text-xs text-muted-foreground">{currency}</p>}
        </CardContent>
    </Card>
);

export default function TourAccountancyPage() {
    const { toast } = useToast();
    const [summary, setSummary] = useState<TourAccountSummary | null>(null);
    const [allCostItems, setAllCostItems] = useState<TourCostItem[]>([]);
    const [allIncomeItems, setAllIncomeItems] = useState<TourIncomeItem[]>([]);
    
    const [editingField, setEditingField] = useState<{ currency: 'kip' | 'baht' | 'usd' | 'cny'; type: 'capital' } | null>(null);
    const [editingValue, setEditingValue] = useState(0);

    useEffect(() => {
        const unsubscribeSummary = listenToTourAccountSummary(setSummary);
        const unsubscribeCosts = listenToAllTourCostItems(setAllCostItems);
        const unsubscribeIncomes = listenToAllTourIncomeItems(setAllIncomeItems);
        
        return () => {
            unsubscribeSummary();
            unsubscribeCosts();
            unsubscribeIncomes();
        };
    }, []);

    const cumulativeProfit = {
        kip: allIncomeItems.reduce((acc, item) => acc + (item.kip || 0), 0) - allCostItems.reduce((acc, item) => acc + (item.kip || 0), 0),
        baht: allIncomeItems.reduce((acc, item) => acc + (item.baht || 0), 0) - allCostItems.reduce((acc, item) => acc + (item.baht || 0), 0),
        usd: allIncomeItems.reduce((acc, item) => acc + (item.usd || 0), 0) - allCostItems.reduce((acc, item) => acc + (item.usd || 0), 0),
        cny: allIncomeItems.reduce((acc, item) => acc + (item.cny || 0), 0) - allCostItems.reduce((acc, item) => acc + (item.cny || 0), 0),
    };
    
    const totalBalance = {
        kip: (summary?.capital.kip || 0) + cumulativeProfit.kip,
        baht: (summary?.capital.baht || 0) + cumulativeProfit.baht,
        usd: (summary?.capital.usd || 0) + cumulativeProfit.usd,
        cny: (summary?.capital.cny || 0) + cumulativeProfit.cny,
    }


    const openEditDialog = (currency: 'kip' | 'baht' | 'usd' | 'cny') => {
        setEditingField({ currency, type: 'capital' });
        setEditingValue(summary?.capital[currency] || 0);
    };

    const handleUpdateField = async () => {
        if (!editingField || !summary) return;

        const { currency, type } = editingField;
        
        // Create a deep copy to avoid direct mutation
        const newCapital = JSON.parse(JSON.stringify(summary.capital));
        newCapital[currency] = editingValue;
        
        try {
            await updateTourAccountSummary({ capital: newCapital });
            toast({ title: "อัปเดตยอดเงินทุนสำเร็จ" });
            setEditingField(null);
        } catch (error) {
            console.error("Error updating summary:", error);
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        }
    };
    
    const getDialogTitle = () => {
        if (!editingField) return 'แก้ไข';
        const currencyMap = { kip: 'KIP', baht: 'BAHT', usd: 'USD', cny: 'CNY' };
        return `แก้ไขยอดเงินทุน (${currencyMap[editingField.currency]})`;
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
                    <Landmark className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight font-headline">จัดการบัญชี (ธุรกิจทัวร์)</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>ยอดคงเหลือรวม (Total Balance)</CardTitle>
                        <CardDescription>
                            ยอดเงินทุนรวมกับกำไร/ขาดทุนสะสมจากทุกโปรแกรมทัวร์
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="ยอดคงเหลือ KIP" value={formatCurrency(totalBalance.kip)} currency="KIP" icon={<Wallet className="h-5 w-5 text-primary" />} />
                        <SummaryCard title="ยอดคงเหลือ BAHT" value={formatCurrency(totalBalance.baht)} currency="BAHT" icon={<Wallet className="h-5 w-5 text-primary" />} />
                        <SummaryCard title="ยอดคงเหลือ USD" value={formatCurrency(totalBalance.usd)} currency="USD" icon={<Wallet className="h-5 w-5 text-primary" />} />
                        <SummaryCard title="ยอดคงเหลือ CNY" value={formatCurrency(totalBalance.cny)} currency="CNY" icon={<Wallet className="h-5 w-5 text-primary" />} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>เงินทุน (Capital)</CardTitle>
                        <CardDescription>
                            เงินทุนเริ่มต้นสำหรับแต่ละสกุลเงิน (คลิกเพื่อแก้ไข)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="เงินทุน KIP" value={formatCurrency(summary?.capital.kip)} currency="KIP" icon={<Briefcase className="h-5 w-5 text-indigo-500" />} onClick={() => openEditDialog('kip')} />
                        <SummaryCard title="เงินทุน BAHT" value={formatCurrency(summary?.capital.baht)} currency="BAHT" icon={<Briefcase className="h-5 w-5 text-indigo-500" />} onClick={() => openEditDialog('baht')} />
                        <SummaryCard title="เงินทุน USD" value={formatCurrency(summary?.capital.usd)} currency="USD" icon={<Briefcase className="h-5 w-5 text-indigo-500" />} onClick={() => openEditDialog('usd')} />
                        <SummaryCard title="เงินทุน CNY" value={formatCurrency(summary?.capital.cny)} currency="CNY" icon={<Briefcase className="h-5 w-5 text-indigo-500" />} onClick={() => openEditDialog('cny')} />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>กำไร/ขาดทุนสะสม (Cumulative Profit/Loss)</CardTitle>
                        <CardDescription>
                           ผลรวมกำไร/ขาดทุนจากทุกโปรแกรมทัวร์ที่สร้าง
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="กำไร/ขาดทุน KIP" value={formatCurrency(cumulativeProfit.kip)} currency="KIP" icon={<BarChart className="h-5 w-5 text-green-600" />} />
                        <SummaryCard title="กำไร/ขาดทุน BAHT" value={formatCurrency(cumulativeProfit.baht)} currency="BAHT" icon={<BarChart className="h-5 w-5 text-green-600" />} />
                        <SummaryCard title="กำไร/ขาดทุน USD" value={formatCurrency(cumulativeProfit.usd)} currency="USD" icon={<BarChart className="h-5 w-5 text-green-600" />} />
                        <SummaryCard title="กำไร/ขาดทุน CNY" value={formatCurrency(cumulativeProfit.cny)} currency="CNY" icon={<BarChart className="h-5 w-5 text-green-600" />} />
                    </CardContent>
                </Card>
            </main>

             {editingField && (
                 <Dialog open={!!editingField} onOpenChange={(isOpen) => !isOpen && setEditingField(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{getDialogTitle()}</DialogTitle>
                             <DialogDescription>
                                ป้อนยอดเงินทุนปัจจุบันสำหรับสกุลเงินนี้
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-3">
                                 <Label htmlFor="edit-summary-amount">จำนวนเงิน ({editingField.currency.toUpperCase()})</Label>
                                <Input 
                                    id="edit-summary-amount" 
                                    type="number" 
                                    value={editingValue} 
                                    onChange={(e) => setEditingValue(Number(e.target.value))} 
                                    required 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingField(null)}>ยกเลิก</Button>
                            <Button onClick={handleUpdateField}>บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
