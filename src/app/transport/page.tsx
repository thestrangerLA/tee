
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, Truck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { listenToTransportEntries, addTransportEntry, updateTransportEntry, deleteTransportEntry } from '@/services/transportService';
import type { TransportEntry } from '@/lib/types';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(value).replace('LAK', 'KIP');
}

const TransportEntryRow = ({ row, onRowChange, onRowDelete }: { row: TransportEntry, onRowChange: (id: string, field: keyof TransportEntry, value: any) => void, onRowDelete: (id: string) => void }) => (
    <TableRow>
        <TableCell className="p-1">
            <Input type="text" value={row.ans_date} onChange={(e) => onRowChange(row.id, 'ans_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.ans_cost || ''} onChange={(e) => onRowChange(row.id, 'ans_cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.ans_amount || ''} onChange={(e) => onRowChange(row.id, 'ans_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
             <Checkbox checked={row.ans_finished} onCheckedChange={(checked) => onRowChange(row.id, 'ans_finished', checked)} />
        </TableCell>
        <TableCell className="p-1">
            <Input type="text" value={row.hal_date} onChange={(e) => onRowChange(row.id, 'hal_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.hal_cost || ''} onChange={(e) => onRowChange(row.id, 'hal_cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.hal_amount || ''} onChange={(e) => onRowChange(row.id, 'hal_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
            <Checkbox checked={row.hal_finished} onCheckedChange={(checked) => onRowChange(row.id, 'hal_finished', checked)} />
        </TableCell>
        <TableCell className="p-1">
            <Input type="text" value={row.mx_date} onChange={(e) => onRowChange(row.id, 'mx_date', e.target.value)} placeholder="วันที่" className="h-8" />
        </TableCell>
         <TableCell className="p-1">
            <Input type="number" value={row.mx_cost || ''} onChange={(e) => onRowChange(row.id, 'mx_cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8" />
        </TableCell>
        <TableCell className="p-1">
            <Input type="number" value={row.mx_amount || ''} onChange={(e) => onRowChange(row.id, 'mx_amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8" />
        </TableCell>
        <TableCell className="p-1 text-center">
             <Checkbox checked={row.mx_finished} onCheckedChange={(checked) => onRowChange(row.id, 'mx_finished', checked)} />
        </TableCell>
        <TableCell className="p-1 text-center">
            <Button variant="ghost" size="icon" onClick={() => onRowDelete(row.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </TableCell>
    </TableRow>
);


export default function TransportPage() {
    const { toast } = useToast();
    const [transportRows, setTransportRows] = useState<TransportEntry[]>([]);
    
    useEffect(() => {
        const unsubscribe = listenToTransportEntries(setTransportRows);
        return () => unsubscribe();
    }, []);

    const transportTotalAmount = useMemo(() => {
        return transportRows.reduce((total, row) => {
            return total + (row.ans_amount || 0) + (row.hal_amount || 0) + (row.mx_amount || 0);
        }, 0);
    }, [transportRows]);
    
    const transportTotalCost = useMemo(() => {
        return transportRows.reduce((total, row) => {
            return total + (row.ans_cost || 0) + (row.hal_cost || 0) + (row.mx_cost || 0);
        }, 0);
    }, [transportRows]);

    const transportProfit = useMemo(() => {
        return transportTotalAmount - transportTotalCost;
    }, [transportTotalAmount, transportTotalCost]);

    const transportRemaining = useMemo(() => {
        return transportRows.reduce((total, row) => {
            let remaining = 0;
            if (!row.ans_finished) remaining += (row.ans_amount || 0);
            if (!row.hal_finished) remaining += (row.hal_amount || 0);
            if (!row.mx_finished) remaining += (row.mx_amount || 0);
            return total + remaining;
        }, 0);
    }, [transportRows]);

    const handleAddTransportRow = async () => {
        try {
            await addTransportEntry();
            toast({ title: "เพิ่มแถวใหม่สำเร็จ" });
        } catch (error) {
            console.error("Error adding row: ", error);
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถเพิ่มแถวได้", variant: "destructive" });
        }
    };

    const handleTransportRowChange = async (id: string, field: keyof TransportEntry, value: any) => {
        try {
            await updateTransportEntry(id, { [field]: value });
        } catch (error) {
            console.error("Error updating row: ", error);
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตข้อมูลได้", variant: "destructive" });
        }
    };

    const handleTransportRowDelete = async (id: string) => {
        if (transportRows.length <= 1) {
            toast({ title: "ไม่สามารถลบได้", description: "ต้องมีอย่างน้อย 1 แถว", variant: "destructive" });
            return;
        }
        try {
            await deleteTransportEntry(id);
            toast({ title: "ลบแถวสำเร็จ" });
        } catch (error) {
            console.error("Error deleting row: ", error);
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบแถวได้", variant: "destructive" });
        }
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
                    <Truck className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">บัญชีขนส่ง</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:grid md:grid-cols-3 md:gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>บันทึกค่าขนส่ง</CardTitle>
                            <CardDescription>กรอกข้อมูลค่าใช้จ่ายในการขนส่งแต่ละประเภท (ข้อมูลจะบันทึกอัตโนมัติ)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="min-w-full whitespace-nowrap">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead colSpan={4} className="text-center border-r bg-blue-50">ANS</TableHead>
                                            <TableHead colSpan={4} className="text-center border-r bg-green-50">HAL</TableHead>
                                            <TableHead colSpan={4} className="text-center border-r bg-orange-50">MX</TableHead>
                                            <TableHead className="text-center bg-gray-50">ลบ</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            {/* ANS */}
                                            <TableHead className="text-center">วันที่</TableHead>
                                            <TableHead className="text-center">ต้นทุน</TableHead>
                                            <TableHead className="text-center">จำนวนเงิน</TableHead>
                                            <TableHead className="text-center border-r">เสร็จสิ้น</TableHead>
                                            {/* HAL */}
                                            <TableHead className="text-center">วันที่</TableHead>
                                            <TableHead className="text-center">ต้นทุน</TableHead>
                                            <TableHead className="text-center">จำนวนเงิน</TableHead>
                                            <TableHead className="text-center border-r">เสร็จสิ้น</TableHead>
                                            {/* MX */}
                                            <TableHead className="text-center">วันที่</TableHead>
                                            <TableHead className="text-center">ต้นทุน</TableHead>
                                            <TableHead className="text-center">จำนวนเงิน</TableHead>
                                            <TableHead className="text-center border-r">เสร็จสิ้น</TableHead>
                                            {/* Actions */}
                                            <TableHead className="text-center"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transportRows.map((row) => (
                                            <TransportEntryRow 
                                                key={row.id}
                                                row={row} 
                                                onRowChange={handleTransportRowChange}
                                                onRowDelete={handleTransportRowDelete}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                           
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1 mt-4 md:mt-0 flex flex-col gap-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>สรุปยอด</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">รวมจำนวนเงิน</span>
                                <span className="font-bold text-lg text-blue-600">{formatCurrency(transportTotalAmount)}</span>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">รวมต้นทุน</span>
                                <span className="font-bold text-lg text-orange-600">{formatCurrency(transportTotalCost)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">กำไร</span>
                                <span className={`font-bold text-lg ${transportProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transportProfit)}</span>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">คงเหลือ</span>
                                <span className="font-bold text-lg text-red-600">{formatCurrency(transportRemaining)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>การดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button variant="outline" onClick={handleAddTransportRow}>เพิ่มแถว</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

    