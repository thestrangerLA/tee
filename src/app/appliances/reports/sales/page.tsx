
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Printer, MoreHorizontal } from "lucide-react";
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};

interface Sale {
    id: string;
    items: { id: string; name: string; quantity: number; price: number; total: number; }[];
    subtotal: number;
    date: Date;
    createdAt: Date;
}

export default function ApplianceSalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);

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
                    <FileText className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ລາຍງານການຂາຍ (ເຄື່ອງໃຊ້)</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">
                <Card>
                    <CardHeader>
                        <CardTitle>ປະຫວັດການຂາຍທັງໝົດ</CardTitle>
                        <CardDescription>ລາຍການໃບເກັບເງິນທີ່ໄດ້ບັນທຶກໄວ້</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ວັນທີ</TableHead>
                                    <TableHead>ລາຍການ</TableHead>
                                    <TableHead className="text-right">ຍອດລວມ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length > 0 ? (
                                    sales.map(sale => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">{format(sale.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>
                                                <ul className="list-disc list-inside">
                                                    {sale.items.map(item => (
                                                        <li key={item.id} className="text-sm">
                                                            {item.name} (x{item.quantity})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(sale.subtotal)} KIP</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            ບໍ່ມີຂໍ້ມູນການຂາຍ
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
