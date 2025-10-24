
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
                        {sales.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {sales.map((sale) => (
                                    <AccordionItem value={sale.id} key={sale.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <div className="font-semibold">{`ໃບບິນ ວັນທີ ${format(sale.date, 'dd/MM/yyyy')}`}</div>
                                                <div className="text-right font-mono">{formatCurrency(sale.subtotal)} KIP</div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-2">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">ລາຍລະອຽດໃບບິນ</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>ລາຍການ</TableHead>
                                                            <TableHead className="text-center">ຈຳນວນ</TableHead>
                                                            <TableHead className="text-right">ລາຄາຕໍ່ໜ່ວຍ</TableHead>
                                                            <TableHead className="text-right">ລາຄາລວມ</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sale.items.map(item => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                                <TableCell className="text-right font-mono">{formatCurrency(item.price)}</TableCell>
                                                                <TableCell className="text-right font-mono">{formatCurrency(item.total)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground py-16">
                                ບໍ່ມີຂໍ້ມູນການຂາຍ
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
