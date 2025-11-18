
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, ChevronRight, DollarSign, Calendar, CalendarDays, Trash2 } from "lucide-react";
import { listenToAutoPartsTransportEntries, deleteAutoPartsTransportEntry } from '@/services/autoPartsTransportService';

import { format, isSameDay, isSameMonth, isSameYear, getYear, getMonth, setMonth } from 'date-fns';
import { lo } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { useToast } from '@/hooks/use-toast';
import type { TransportEntry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


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

export default function AutoPartsSalesBasedOnTransportPage() {
    const [transportEntries, setTransportEntries] = useState<TransportEntry[]>([]);
    const [filter, setFilter] = useState<{ year: number | null, month: number | null }>({ year: new Date().getFullYear(), month: new Date().getMonth() });
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = listenToAutoPartsTransportEntries(setTransportEntries);
        return () => unsubscribe();
    }, []);

    const summaryData = useMemo(() => {
        const now = new Date();
        const calculateProfit = (entry: TransportEntry) => (entry.amount || 0) - ((entry.cost || 0) * (entry.quantity || 1));
        
        const todayProfit = transportEntries.filter(s => isSameDay(s.date, now)).reduce((sum, s) => sum + calculateProfit(s), 0);
        const thisMonthProfit = transportEntries.filter(s => isSameMonth(s.date, now)).reduce((sum, s) => sum + calculateProfit(s), 0);
        const thisYearProfit = transportEntries.filter(s => isSameYear(s.date, now)).reduce((sum, s) => sum + calculateProfit(s), 0);
        return { todayProfit, thisMonthProfit, thisYearProfit };
    }, [transportEntries]);

    const filteredEntries = useMemo(() => {
        return transportEntries.filter(entry => {
            const entryYear = getYear(entry.date);
            const entryMonth = getMonth(entry.date);
            if (filter.year && entryYear !== filter.year) return false;
            if (filter.month !== null && entryMonth !== filter.month) return false;
            return true;
        });
    }, [transportEntries, filter]);

    const groupedEntries = useMemo(() => {
        return filteredEntries.reduce((acc, entry) => {
            const companyKey = entry.type || 'Unknown';
            if (!acc[companyKey]) {
                acc[companyKey] = [];
            }
            acc[companyKey].push(entry);
            return acc;
        }, {} as Record<string, TransportEntry[]>);
    }, [filteredEntries]);

    const filteredTotalSales = useMemo(() => {
        return filteredEntries.reduce((sum, s) => sum + (s.amount || 0), 0);
    }, [filteredEntries]);
    
     const filteredTotalProfit = useMemo(() => {
        return filteredEntries.reduce((sum, s) => sum + ((s.amount || 0) - ((s.cost || 0) * (s.quantity || 1))), 0);
    }, [filteredEntries]);

    const availableYears = useMemo(() => {
        const years = new Set(transportEntries.map(s => getYear(s.date)));
        return Array.from(years).sort((a, b) => b - a);
    }, [transportEntries]);

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(setMonth(new Date(), i), 'LLLL', { locale: lo }),
    }));
    
    const handleDeleteEntry = async (e: React.MouseEvent, entryId: string) => {
        e.stopPropagation();
        try {
            await deleteAutoPartsTransportEntry(entryId);
            toast({ title: 'ລຶບລາຍການສຳເລັດ'});
        } catch (error: any) {
            toast({ title: 'ເກີດຂໍ້ຜິດພາດ', description: error.message, variant: 'destructive' });
        }
    };


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/autoparts/reports">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າລາຍງານ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">ປະຫວັດການຂາຍ (ອີງຕາມຂົນສົ່ງ)</h1>
                        <p className="text-xs text-muted-foreground">ລາຍການທັງໝົດທີ່ໄດ້ບັນທຶກໃນລະບົບຂົນສົ່ງ</p>
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
                        {Object.keys(groupedEntries).length > 0 ? (
                           <Accordion type="multiple" className="w-full space-y-4">
                            {Object.entries(groupedEntries).map(([company, entries]) => (
                                <AccordionItem value={company} key={company} className="border rounded-lg">
                                    <AccordionTrigger className="bg-muted/50 p-3 rounded-t-md hover:no-underline font-semibold text-lg">
                                        <div className="flex justify-between w-full pr-2">
                                            <h3>{company}</h3>
                                            <p className="text-sm text-muted-foreground">{entries.length} ລາຍການ</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-2">
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ວັນທີ</TableHead>
                                                    <TableHead>ລາຍລະອຽດ</TableHead>
                                                    <TableHead className="text-center">ຈຳນວນ</TableHead>
                                                    <TableHead className="text-right">ຕົ້ນທຶນ</TableHead>
                                                    <TableHead className="text-right">ລາຄາຂາຍ</TableHead>
                                                    <TableHead className="text-right">ກຳໄລ</TableHead>
                                                    <TableHead className="text-center">ສະຖານະ</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {entries.map((entry) => {
                                                    const profit = (entry.amount || 0) - ((entry.cost || 0) * (entry.quantity || 1));
                                                    return (
                                                         <TableRow key={entry.id}>
                                                            <TableCell>{format(entry.date, 'dd/MM/yy')}</TableCell>
                                                            <TableCell className="font-medium">{entry.detail}</TableCell>
                                                            <TableCell className="text-center">{entry.quantity}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(entry.cost)}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                                                            <TableCell className={`text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit)}</TableCell>
                                                             <TableCell className="text-center">
                                                                <Badge variant={entry.finished ? 'default' : 'secondary'}>{entry.finished ? 'ສຳເລັດ' : 'ຄ້າງ'}</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                         </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
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
