
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePieChart, BookOpen, ChevronRight, Package, TrendingDown, Warehouse } from "lucide-react";
import { listenToMeatStockItems, listenToAllMeatStockLogs } from '@/services/meatStockService';
import type { MeatStockItem, MeatStockLog } from '@/lib/types';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

const StatCard = ({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function MeatReportsPage() {
    const [stockItems, setStockItems] = useState<MeatStockItem[]>([]);
    const [stockLogs, setStockLogs] = useState<MeatStockLog[]>([]);

    useEffect(() => {
        const unsubscribeItems = listenToMeatStockItems(setStockItems);
        const unsubscribeLogs = listenToAllMeatStockLogs(setStockLogs);
        return () => {
            unsubscribeItems();
            unsubscribeLogs();
        };
    }, []);

    const monthlySummary = useMemo(() => {
        const today = new Date();
        const start = startOfMonth(today);
        const end = endOfMonth(today);

        const monthlyLogs = stockLogs.filter(log => isWithinInterval(log.createdAt, { start, end }));

        const soldThisMonth = monthlyLogs
            .filter(log => log.type === 'sale')
            .reduce((sum, log) => sum + Math.abs(log.change), 0);
            
        const remainingStock = stockItems.reduce((sum, item) => sum + item.currentStock, 0);

        const stockValue = stockItems.reduce((sum, item) => sum + (item.currentStock * item.packageSize * item.costPrice), 0);

        return { soldThisMonth, remainingStock, stockValue };
    }, [stockItems, stockLogs]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/meat-business">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <FilePieChart className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ສະຫຼຸບຍອດທຸລະກິດຊີ້ນ</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 md:gap-8 max-w-6xl mx-auto w-full">
                <div className="grid gap-4 md:grid-cols-3">
                     <StatCard 
                        title="ຂາຍອອກເດືອນນີ້"
                        value={`${monthlySummary.soldThisMonth} ຖົງ`}
                        icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
                        description="ຈຳນວນສິນຄ້າທີ່ຂາຍອອກໃນເດືອນປັດຈຸບັນ"
                     />
                     <StatCard 
                        title="ສິນຄ້າຄົງເຫຼືອ"
                        value={`${monthlySummary.remainingStock} ຖົງ`}
                        icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
                        description="ຈຳນວນສິນຄ້າທັງໝົດທີ່ຍັງເຫຼືອໃນສະຕັອກ"
                     />
                     <StatCard 
                        title="ມູນຄ່າສະຕັອກຄົງເຫຼືອ"
                        value={`${formatCurrency(monthlySummary.stockValue)} KIP`}
                        icon={<Package className="h-4 w-4 text-muted-foreground" />}
                        description="ມູນຄ່າລວມຂອງສິນຄ້າໃນຄັງ (ຕາມຕົ້ນທຶນ)"
                     />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>ເລືອກລາຍງານ</CardTitle>
                        <CardDescription>ເລືອກປະເພດລາຍງານທີ່ຕ້ອງການເບິ່ງ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Link href="/meat-business/reports/general-ledger">
                            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className='flex items-center gap-4'>
                                         <div className="bg-primary/10 p-3 rounded-full">
                                          <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">ປະຫວັດຮັບ-ຈ່າຍທົ່ວໄປ</CardTitle>
                                            <CardDescription>ເບິ່ງລາຍການທຸລະກຳທັງໝົດ</CardDescription>
                                        </div>
                                    </div>
                                     <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                            </Card>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
