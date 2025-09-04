
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowLeft, Users, Calendar as CalendarIcon, Trash2, PlusCircle } from "lucide-react";
import { DrugCreditorEntry } from '@/lib/types';
import { listenToDrugCreditorEntries, addDrugCreditorEntry, updateDrugCreditorEntry, deleteDrugCreditorEntry } from '@/services/drugCreditorService';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

export default function DrugCreditorsPage() {
    const { toast } = useToast();
    const [entries, setEntries] = useState<DrugCreditorEntry[]>([]);
    const [displayDate, setDisplayDate] = useState<Date>(new Date());

    useEffect(() => {
        const unsubscribe = listenToDrugCreditorEntries(setEntries, startOfDay(displayDate));
        return () => unsubscribe();
    }, [displayDate]);

    const handleAddEntry = async () => {
        try {
            const nextOrder = entries.length > 0 ? Math.max(...entries.map(e => e.order)) + 1 : 1;
            await addDrugCreditorEntry({
                order: nextOrder,
                description: '',
                cost: 0,
                sellingPrice: 0,
            }, displayDate);
            toast({ title: 'เพิ่มรายการใหม่สำเร็จ' });
        } catch (error) {
            console.error('Error adding entry:', error);
            toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
        }
    };

    const handleUpdateEntry = async (id: string, field: keyof Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date'>, value: any) => {
        try {
            // No toast for inline edits to avoid being noisy
            await updateDrugCreditorEntry(id, { [field]: value });
        } catch (error) {
            console.error('Error updating entry:', error);
            toast({ title: 'เกิดข้อผิดพลาดในการอัปเดต', variant: 'destructive' });
        }
    };
    
    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
        try {
            await deleteDrugCreditorEntry(id);
            toast({ title: "ลบรายการสำเร็จ" });
        } catch (error) {
            console.error("Error deleting entry: ", error);
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        }
    };

    const totals = useMemo(() => {
        const cost = entries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
        const sellingPrice = entries.reduce((sum, entry) => sum + (entry.sellingPrice || 0), 0);
        const profit = sellingPrice - cost;
        const share40 = profit * 0.4;
        const share60 = profit * 0.6;
        return { cost, sellingPrice, profit, share40, share60 };
    }, [entries]);

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
                    <Users className="h-6 w-6 text-rose-500" />
                    <h1 className="text-xl font-bold tracking-tight">เจ้าหนี้ค่ายา</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                             <CardTitle>ตารางคำนวณส่วนแบ่ง</CardTitle>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {displayDate ? format(displayDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={displayDate} onSelect={(date) => date && setDisplayDate(date)} initialFocus locale={th} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">order</TableHead>
                                        <TableHead>รายการ</TableHead>
                                        <TableHead className="w-[150px] text-right">ต้นทุน</TableHead>
                                        <TableHead className="w-[150px] text-right">ราคาขาย</TableHead>
                                        <TableHead className="w-[150px] text-right">กำไร</TableHead>
                                        <TableHead className="w-[150px] text-right">40%</TableHead>
                                        <TableHead className="w-[150px] text-right">60%</TableHead>
                                        <TableHead className="w-[50px]"><span className="sr-only">Delete</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => {
                                        const profit = (entry.sellingPrice || 0) - (entry.cost || 0);
                                        const share40 = profit * 0.4;
                                        const share60 = profit * 0.6;
                                        return (
                                            <TableRow key={entry.id}>
                                                <TableCell className="p-1 text-center">{entry.order}</TableCell>
                                                <TableCell className="p-1">
                                                     <Input
                                                        defaultValue={entry.description}
                                                        onBlur={(e) => handleUpdateEntry(entry.id, 'description', e.target.value)}
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                     <Input
                                                        type="number"
                                                        defaultValue={entry.cost}
                                                        onBlur={(e) => handleUpdateEntry(entry.id, 'cost', Number(e.target.value) || 0)}
                                                        className="h-8 text-right"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <Input
                                                        type="number"
                                                        defaultValue={entry.sellingPrice}
                                                        onBlur={(e) => handleUpdateEntry(entry.id, 'sellingPrice', Number(e.target.value) || 0)}
                                                        className="h-8 text-right"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1 text-right font-medium">{formatCurrency(profit)}</TableCell>
                                                <TableCell className="p-1 text-right">{formatCurrency(share40)}</TableCell>
                                                <TableCell className="p-1 text-right">{formatCurrency(share60)}</TableCell>
                                                <TableCell className="p-1 text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={2} className="text-right p-2">รวม</TableCell>
                                        <TableCell className="text-right p-2">{formatCurrency(totals.cost)}</TableCell>
                                        <TableCell className="text-right p-2">{formatCurrency(totals.sellingPrice)}</TableCell>
                                        <TableCell className="text-right p-2">{formatCurrency(totals.profit)}</TableCell>
                                        <TableCell className="text-right p-2">{formatCurrency(totals.share40)}</TableCell>
                                        <TableCell className="text-right p-2">{formatCurrency(totals.share60)}</TableCell>
                                        <TableCell className="p-2"></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                         <div className="flex justify-end mt-4">
                            <Button onClick={handleAddEntry}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                เพิ่มรายการ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
