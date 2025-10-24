
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, ChevronRight, DollarSign, Calendar, CalendarDays } from "lucide-react";
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isSameDay, isSameMonth, isSameYear, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, getYear, getMonth, setMonth } from 'date-fns';
import { lo } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import type { Sale } from '@/lib/types';


const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

const SummaryCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function ApplianceSalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [filter, setFilter] = useState<{ year: number | null, month: number | null }>({ year: new Date().getFullYear(), month: new Date().getMonth() });

    useEffect(() => {
        const q = query(collection(db, 'applianceSales'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const salesData: Sale[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                salesData.push({
                    id: doc.id,
                    ...data,
                    date: (data.date as Timestamp).toDate(),
                    createdAt: (data.createdAt as Timestamp).toDate(),
                } as Sale);
            });
            setSales(salesData);
        });
        return () => unsubscribe();
    }, []);

    const summaryData = useMemo(() => {
        const now = new Date();
        const todayProfit = sales.filter(s => isSameDay(s.date, now)).reduce((sum, s) => sum + (s.totalProfit || 0), 0);
        const thisMonthProfit = sales.filter(s => isSameMonth(s.date, now)).reduce((sum, s) => sum + (s.totalProfit || 0), 0);
        const thisYearProfit = sales.filter(s => isSameYear(s.date, now)).reduce((sum, s) => sum + (s.totalProfit || 0), 0);
        return { todayProfit, thisMonthProfit, thisYearProfit };
    }, [sales]);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleYear = getYear(sale.date);
            const saleMonth = getMonth(sale.date);
            if (filter.year && saleYear !== filter.year) return false;
            if (filter.month !== null && saleMonth !== filter.month) return false;
            return true;
        });
    }, [sales, filter]);

    const groupedSales = useMemo(() => {
        return filteredSales.reduce((acc, sale) => {
            const dayKey = format(sale.date, 'yyyy-MM-dd');
            if (!acc[dayKey]) {
                acc[dayKey] = {
                    date: sale.date,
                    sales: []
                };
            }
            acc[dayKey].sales.push(sale);
            return acc;
        }, {} as Record<string, { date: Date, sales: Sale[] }>);
    }, [filteredSales]);

    const sortedGroupedSales = Object.values(groupedSales).sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const filteredTotalSales = useMemo(() => {
        return filteredSales.reduce((sum, s) => sum + (s.subtotal || 0), 0);
    }, [filteredSales]);
    
    const filteredTotalProfit = useMemo(() => {
        return filteredSales.reduce((sum, s) => sum + (s.totalProfit || 0), 0);
    }, [filteredSales]);

    const availableYears = useMemo(() => {
        const years = new Set(sales.map(s => getYear(s.date)));
        return Array.from(years).sort((a, b) => b - a);
    }, [sales]);

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(setMonth(new Date(), i), 'LLLL', { locale: lo }),
    }));


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/appliances/reports">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າລາຍງານ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">ປະຫວັດການຂາຍທັງໝົດ</h1>
                        <p className="text-xs text-muted-foreground">ລາຍການບິນທັງໝົດທີ່ໄດ້ຊຳລະເງິນແລ້ວ</p>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard title="ກຳໄລມື້ນີ້" value={`LAK ${formatCurrency(summaryData.todayProfit)}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                    <SummaryCard title="ກຳໄລເດືອນນີ້" value={`LAK ${formatCurrency(summaryData.thisMonthProfit)}`} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
                    <SummaryCard title="ກຳໄລປີນີ້" value={`LAK ${formatCurrency(summaryData.thisYearProfit)}`} icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />
                </div>
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>ປະຫວັດການຂາຍ</CardTitle>
                                <CardDescription>ຍອດຂາຍລວມ: LAK {formatCurrency(filteredTotalSales)} | ກຳໄລລວມ: LAK {formatCurrency(filteredTotalProfit)}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">{filter.year ? `ປີ ${filter.year + 543}` : 'ທຸກໆປີ'}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setFilter(f => ({ ...f, year: null }))}>ທຸກໆປີ</DropdownMenuItem>
                                        {availableYears.map(year => (
                                            <DropdownMenuItem key={year} onClick={() => setFilter(f => ({ ...f, year }))}>ປີ {year + 543}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">{filter.month !== null ? months[filter.month].label : 'ທຸກໆເດືອນ'}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setFilter(f => ({ ...f, month: null }))}>ທຸກໆເດືອນ</DropdownMenuItem>
                                        {months.map(month => (
                                            <DropdownMenuItem key={month.value} onClick={() => setFilter(f => ({ ...f, month: month.value }))}>{month.label}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" onClick={() => setFilter({ year: null, month: null })}>ລ້າງຕົວກອງ</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sortedGroupedSales.length > 0 ? (
                            sortedGroupedSales.map(group => (
                                <Link key={group.date.toISOString()} href={`/appliances/reports/sales/${format(group.date, 'yyyy-MM-dd')}`}>
                                    <Card className="overflow-hidden hover:bg-muted/50 cursor-pointer">
                                        <CardHeader className="bg-muted/50 p-3">
                                            <h3 className="font-semibold">{format(group.date, 'EEEE, d MMMM yyyy', { locale: lo })}</h3>
                                            <p className="text-xs text-muted-foreground">{group.sales.length} ທຸລະກຳ</p>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-16">
                                ບໍ່ມີຂໍ້ມູນການຂາຍໃນຊ່ວງເວລາທີ່ເລືອກ
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
