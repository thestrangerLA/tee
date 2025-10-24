
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Eye, Trash2, DollarSign, LineChart, Receipt } from "lucide-react";
import { deleteApplianceSale, listenToApplianceSalesByDate } from '@/services/applianceSalesService';
import type { Sale } from '@/lib/types';
import { format } from 'date-fns';
import { lo } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

export default function DailySalesReportPage() {
    const params = useParams();
    const date = params.date as string;
    const { toast } = useToast();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    const displayDate = new Date(date);

    useEffect(() => {
        if (!date) return;
        setLoading(true);
        const unsubscribe = listenToApplianceSalesByDate(displayDate, (data) => {
            setSales(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [date]);

    const handleDeleteSale = async (saleId: string) => {
        if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບໃບບິນນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.")) {
            try {
                await deleteApplianceSale(saleId);
                toast({
                    title: "ລົບໃບບິນສຳເລັດ",
                    description: "ຂໍ້ມູນໃບບິນໄດ້ຖືກລົບອອກຈາກລະບົບແລ້ວ.",
                });
            } catch (error) {
                console.error("Error deleting sale: ", error);
                toast({
                    title: "ເກີດຂໍ້ຜິດພາດ",
                    description: "ບໍ່ສາມາດລົບໃບບິນໄດ້.",
                    variant: "destructive",
                });
            }
        }
    };
    
    const summary = sales.reduce((acc, sale) => {
        acc.totalSales += sale.subtotal;
        acc.totalProfit += sale.totalProfit || 0;
        return acc;
    }, { totalSales: 0, totalProfit: 0 });

    if (loading) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4">
                 <Skeleton className="h-14 w-full mb-4" />
                 <Skeleton className="h-32 w-full mb-4" />
                 <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/appliances/reports/sales">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">ປະຫວັດການຂາຍວັນທີ {format(displayDate, 'd MMMM yyyy', { locale: lo })}</h1>
                        <p className="text-xs text-muted-foreground">ລາຍການບິນທັງໝົດທີ່ໄດ້ຊຳລະເງິນໃນມື້ນີ້</p>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 space-y-4">
                 <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ຍອດຂາຍລວມ</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">LAK {formatCurrency(summary.totalSales)}</div>
                            <p className="text-xs text-muted-foreground">ຈາກ {sales.length} ບິນ</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ກຳໄລລວມ</CardTitle>
                            <LineChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">LAK {formatCurrency(summary.totalProfit)}</div>
                        </CardContent>
                    </Card>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>ລາຍການຂາຍ</CardTitle>
                        <CardDescription>ລາຍການຂາຍທັງໝົດໃນວັນທີ {format(displayDate, 'dd/MM/yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ເລກທີ່ Invoice</TableHead>
                                    <TableHead>ເວລາ</TableHead>
                                    <TableHead className="text-right">ຍອດລວມ</TableHead>
                                    <TableHead className="text-right">ກຳໄລ</TableHead>
                                    <TableHead className="text-center">ຈັດການ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-mono">{sale.id.substring(0,8)}...</TableCell>
                                        <TableCell>{format(sale.createdAt, 'HH:mm:ss')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(sale.subtotal)}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">{formatCurrency(sale.totalProfit || 0)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSale(sale.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {sales.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground">
                                ບໍ່ມີຂໍ້ມູນການຂາຍໃນວັນທີນີ້
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

