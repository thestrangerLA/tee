
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, Truck, PlusCircle, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { listenToTransportEntries, addTransportEntry, updateTransportEntry, deleteTransportEntry } from '@/services/transportService';
import type { TransportEntry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, isWithinInterval, startOfMonth, endOfMonth, getMonth, setMonth, getYear } from 'date-fns';
import { th } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(value).replace('LAK', 'KIP');
}

const TransportTable = ({ type, title, entries, onRowChange, onRowDelete, onAddRow }: { 
    type: 'ANS' | 'HAL' | 'MX',
    title: string, 
    entries: TransportEntry[],
    onRowChange: (id: string, field: keyof TransportEntry, value: any) => void,
    onRowDelete: (id: string) => void,
    onAddRow: (type: 'ANS' | 'HAL' | 'MX') => void
}) => {
    
    const totalCost = useMemo(() => entries.reduce((sum, entry) => sum + (entry.cost || 0), 0), [entries]);
    const totalAmount = useMemo(() => entries.reduce((sum, entry) => sum + (entry.amount || 0), 0), [entries]);
    const totalRemaining = useMemo(() => entries.filter(e => !e.finished).reduce((sum, entry) => sum + (entry.amount || 0), 0), [entries]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        จำนวนเงินรวม: {formatCurrency(totalAmount)} | คงเหลือ: {formatCurrency(totalRemaining)}
                    </CardDescription>
                </div>
                <Button size="sm" onClick={() => onAddRow(type)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    เพิ่มแถว
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">วันที่</TableHead>
                                <TableHead>รายละเอียด</TableHead>
                                <TableHead className="text-right">ต้นทุน</TableHead>
                                <TableHead className="text-right">จำนวนเงิน</TableHead>
                                <TableHead className="text-center">เสร็จสิ้น</TableHead>
                                <TableHead className="text-center">ลบ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className="w-full justify-start text-left font-normal h-8 text-xs"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {row.date ? format(row.date, "dd/MM/yyyy") : <span>เลือกวันที่</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={row.date}
                                                    onSelect={(d) => onRowChange(row.id, 'date', d ? startOfDay(d) : new Date())}
                                                    initialFocus
                                                    locale={th}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                    <TableCell>
                                        <Input value={row.detail || ''} onChange={(e) => onRowChange(row.id, 'detail', e.target.value)} placeholder="รายละเอียด" className="h-8" />
                                    </TableCell>
                                     <TableCell>
                                        <Input type="number" value={row.cost || ''} onChange={(e) => onRowChange(row.id, 'cost', parseFloat(e.target.value) || 0)} placeholder="ต้นทุน" className="h-8 text-right" />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={row.amount || ''} onChange={(e) => onRowChange(row.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="จำนวนเงิน" className="h-8 text-right" />
                                    </TableCell>
                                     <TableCell className="text-center">
                                        <Checkbox checked={row.finished} onCheckedChange={(checked) => onRowChange(row.id, 'finished', checked)} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" onClick={() => onRowDelete(row.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {entries.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4">ไม่มีรายการในเดือนที่เลือก</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


export default function TransportPage() {
    const { toast } = useToast();
    const [allEntries, setAllEntries] = useState<TransportEntry[]>([]);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    
    useEffect(() => {
        const unsubscribe = listenToTransportEntries(setAllEntries);
        return () => unsubscribe();
    }, []);

    const filteredEntries = useMemo(() => {
        const start = startOfMonth(displayMonth);
        const end = endOfMonth(displayMonth);
        return allEntries.filter(entry => isWithinInterval(entry.date, { start, end }));
    }, [allEntries, displayMonth]);


    const ansEntries = useMemo(() => filteredEntries.filter(e => e.type === 'ANS'), [filteredEntries]);
    const halEntries = useMemo(() => filteredEntries.filter(e => e.type === 'HAL'), [filteredEntries]);
    const mxEntries = useMemo(() => filteredEntries.filter(e => e.type === 'MX'), [filteredEntries]);


    const transportTotalAmount = useMemo(() => filteredEntries.reduce((total, row) => total + (row.amount || 0), 0), [filteredEntries]);
    const transportTotalCost = useMemo(() => filteredEntries.reduce((total, row) => total + (row.cost || 0), 0), [filteredEntries]);
    const transportProfit = useMemo(() => transportTotalAmount - transportTotalCost, [transportTotalAmount, transportTotalCost]);
    const transportRemaining = useMemo(() => filteredEntries.filter(e => !e.finished).reduce((total, row) => total + (row.amount || 0), 0), [filteredEntries]);

    const handleAddTransportRow = async (type: 'ANS' | 'HAL' | 'MX') => {
        try {
            await addTransportEntry(type, displayMonth);
            toast({ title: "เพิ่มแถวใหม่สำเร็จ" });
        } catch (error) {
            console.error("Error adding row: ", error);
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถเพิ่มแถวได้", variant: "destructive" });
        }
    };

    const handleTransportRowChange = async (id: string, field: keyof TransportEntry, value: any) => {
        try {
            await updateTransportEntry(id, { [field]: value });
            // No toast needed for real-time updates to avoid being noisy
        } catch (error) {
            console.error("Error updating row: ", error);
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตข้อมูลได้", variant: "destructive" });
        }
    };

    const handleTransportRowDelete = async (id: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแถวนี้?")) return;
        try {
            await deleteTransportEntry(id);
            toast({ title: "ลบแถวสำเร็จ" });
        } catch (error) {
            console.error("Error deleting row: ", error);
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบแถวได้", variant: "destructive" });
        }
    };

    const MonthYearSelector = () => {
        const years = [2024, 2025, 2026];
        const months = Array.from({ length: 12 }, (_, i) => setMonth(new Date(), i));

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        {format(displayMonth, "LLLL yyyy", { locale: th })}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {years.map(year => (
                         <DropdownMenuSub key={year}>
                            <DropdownMenuSubTrigger>
                                <span>{year + 543}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {months.map(month => (
                                        <DropdownMenuItem 
                                            key={getMonth(month)} 
                                            onClick={() => {
                                                const newDate = new Date(year, getMonth(month), 1);
                                                setDisplayMonth(newDate);
                                            }}
                                        >
                                            {format(month, "LLLL", { locale: th })}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                             </DropdownMenuPortal>
                        </DropdownMenuSub>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
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
                 <div className="ml-auto">
                    <MonthYearSelector />
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:grid md:grid-cols-3 md:gap-8">
                <div className="md:col-span-2 flex flex-col gap-4">
                     <Accordion type="single" collapsible defaultValue="item-ans" className="w-full">
                        <AccordionItem value="item-ans">
                            <AccordionTrigger className="text-lg font-bold bg-blue-50 hover:bg-blue-100 px-4 rounded-md">ANS</AccordionTrigger>
                            <AccordionContent className="p-1">
                                 <TransportTable 
                                    type="ANS"
                                    title="รายการ ANS"
                                    entries={ansEntries}
                                    onAddRow={handleAddTransportRow}
                                    onRowChange={handleTransportRowChange}
                                    onRowDelete={handleTransportRowDelete}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-hal">
                             <AccordionTrigger className="text-lg font-bold bg-green-50 hover:bg-green-100 px-4 rounded-md">HAL</AccordionTrigger>
                            <AccordionContent className="p-1">
                                <TransportTable 
                                    type="HAL"
                                    title="รายการ HAL"
                                    entries={halEntries}
                                    onAddRow={handleAddTransportRow}
                                    onRowChange={handleTransportRowChange}
                                    onRowDelete={handleTransportRowDelete}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-mx">
                             <AccordionTrigger className="text-lg font-bold bg-orange-50 hover:bg-orange-100 px-4 rounded-md">MX</AccordionTrigger>
                            <AccordionContent className="p-1">
                                <TransportTable 
                                    type="MX"
                                    title="รายการ MX"
                                    entries={mxEntries}
                                    onAddRow={handleAddTransportRow}
                                    onRowChange={handleTransportRowChange}
                                    onRowDelete={handleTransportRowDelete}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div className="md:col-span-1 mt-4 md:mt-0 flex flex-col gap-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>สรุปยอดรวม (เดือนที่เลือก)</CardTitle>
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
                </div>
            </main>
        </div>
    );
}
