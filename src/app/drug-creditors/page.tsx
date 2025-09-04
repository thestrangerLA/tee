
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, isWithinInterval, startOfMonth, endOfMonth, getYear, setMonth, getMonth } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowLeft, Users, Calendar as CalendarIcon, Trash2, PlusCircle, ChevronDown } from "lucide-react";
import { DrugCreditorEntry } from '@/lib/types';
import { listenToDrugCreditorEntries, addDrugCreditorEntry, updateDrugCreditorEntry, deleteDrugCreditorEntry } from '@/services/drugCreditorService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};


const AddEntryForm = ({ onAddEntry }: { onAddEntry: (entry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date' | 'isPaid'>) => Promise<void> }) => {
    const { toast } = useToast();
    const [order, setOrder] = useState(0);
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order || !description) {
            toast({
                title: "ข้อผิดพลาด",
                description: "กรุณากรอกลำดับและรายละเอียด",
                variant: "destructive",
            });
            return;
        }

        try {
            await onAddEntry({
                order,
                description,
                cost,
                sellingPrice,
            });
            toast({ title: "เพิ่มรายการสำเร็จ" });
            // Reset form
            setOrder(0);
            setDescription('');
            setCost(0);
            setSellingPrice(0);
        } catch (error) {
            console.error("Error adding entry: ", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถเพิ่มรายการได้",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>เพิ่มรายการยาใหม่</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                             <Label htmlFor="order">Order</Label>
                             <Input id="order" type="number" placeholder="1" value={order || ''} onChange={(e) => setOrder(Number(e.target.value))} required />
                        </div>
                        <div className="grid gap-2">
                             <Label htmlFor="description">รายการ</Label>
                             <Input id="description" placeholder="ชื่อยา" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                         <div className="grid gap-2">
                             <Label htmlFor="cost">ต้นทุน</Label>
                             <Input id="cost" type="number" placeholder="0" value={cost || ''} onChange={(e) => setCost(Number(e.target.value))} />
                        </div>
                         <div className="grid gap-2">
                             <Label htmlFor="sellingPrice">ราคาขาย</Label>
                             <Input id="sellingPrice" type="number" placeholder="0" value={sellingPrice || ''} onChange={(e) => setSellingPrice(Number(e.target.value))} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        เพิ่มรายการ
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};


export default function DrugCreditorsPage() {
    const { toast } = useToast();
    const [allEntries, setAllEntries] = useState<DrugCreditorEntry[]>([]);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

    useEffect(() => {
        const unsubscribe = listenToDrugCreditorEntries(setAllEntries, displayMonth);
        return () => unsubscribe();
    }, [displayMonth]);

    const filteredEntries = useMemo(() => {
        const start = startOfMonth(displayMonth);
        const end = endOfMonth(displayMonth);
        return allEntries.filter(entry => isWithinInterval(entry.date, { start, end }));
    }, [allEntries, displayMonth]);

    const handleAddEntry = async (newEntry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date' | 'isPaid'>) => {
        try {
            await addDrugCreditorEntry(newEntry, displayMonth);
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

    const groupedByOrder = useMemo(() => {
        const groups: Record<string, DrugCreditorEntry[]> = {};
        filteredEntries.forEach(entry => {
            const orderKey = String(entry.order);
            if (!groups[orderKey]) {
                groups[orderKey] = [];
            }
            groups[orderKey].push(entry);
        });
        return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
    }, [filteredEntries]);

    const pageTotals = useMemo(() => {
        const cost = filteredEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
        const sellingPrice = filteredEntries.reduce((sum, entry) => sum + (entry.sellingPrice || 0), 0);
        const profit = filteredEntries.reduce((sum, entry) => {
            const entryProfit = (entry.sellingPrice || 0) - (entry.cost || 0);
            return sum + (entryProfit * 0.4); // This profit is the 40% share
        }, 0);


        const unpaidEntries = filteredEntries.filter(e => !e.isPaid);
        const remainingCreditorPayable = unpaidEntries.reduce((sum, entry) => {
            const entryProfit = (entry.sellingPrice || 0) - (entry.cost || 0);
            const entryShare40 = entryProfit * 0.4;
            return sum + (entry.cost || 0) + entryShare40;
        }, 0);

        return { cost, sellingPrice, profit, remainingCreditorPayable };
    }, [filteredEntries]);

     const MonthYearSelector = () => {
        const years = Array.from({ length: 3 }, (_, i) => getYear(new Date()) - 1 + i);
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
                    <Users className="h-6 w-6 text-rose-500" />
                    <h1 className="text-xl font-bold tracking-tight">เจ้าหนี้ค่ายา</h1>
                </div>
                 <div className="ml-auto flex items-center gap-4">
                     <MonthYearSelector />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid lg:grid-cols-3">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <AddEntryForm onAddEntry={handleAddEntry} />
                    <Card>
                        <CardHeader>
                            <CardTitle>สรุปยอดรวม (เดือนที่เลือก)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <h3 className="text-base font-semibold">ต้นทุนรวม</h3>
                                <p className="text-lg font-bold">{formatCurrency(pageTotals.cost)}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <h3 className="text-base font-semibold">ราคาขายรวม</h3>
                                <p className="text-lg font-bold">{formatCurrency(pageTotals.sellingPrice)}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <h3 className="text-base font-semibold">กำไร (40%)</h3>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(pageTotals.profit)}</p>
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3 bg-red-50">
                                <h3 className="text-base font-semibold text-red-700">รวมเจ้าหนี้คงเหลือ</h3>
                                <p className="text-lg font-bold text-red-600">{formatCurrency(pageTotals.remainingCreditorPayable)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>ตารางคำนวณส่วนแบ่ง</CardTitle>
                             <CardDescription>ข้อมูลสำหรับเดือน {format(displayMonth, "LLLL yyyy", { locale: th })}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {groupedByOrder.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {groupedByOrder.map(([order, entries]) => {
                                        const orderTotals = entries.reduce((acc, entry) => {
                                            const profit = (entry.sellingPrice || 0) - (entry.cost || 0);
                                            const share40 = profit * 0.4;
                                            acc.profit += share40;
                                            
                                            if (!entry.isPaid) {
                                                const creditorPayable = (entry.cost || 0) + share40;
                                                acc.payable += creditorPayable;
                                            }
                                            
                                            return acc;
                                        }, { payable: 0, profit: 0 });

                                        return (
                                        <AccordionItem value={`order-${order}`} key={order}>
                                            <AccordionTrigger>
                                                <div className="flex justify-between w-full pr-4">
                                                    <div className="font-semibold text-lg">Order: {order}</div>
                                                     <div className="flex gap-4 items-center">
                                                        <span className="text-sm text-blue-600">จ่าย (คงเหลือ): {formatCurrency(orderTotals.payable)}</span>
                                                        <span className={`text-sm ${orderTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            กำไร (40%): {formatCurrency(orderTotals.profit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>รายการ</TableHead>
                                                                <TableHead className="w-[120px] text-right">ต้นทุน</TableHead>
                                                                <TableHead className="w-[120px] text-right">ราคาขาย</TableHead>
                                                                <TableHead className="w-[120px] text-right">กำไร</TableHead>
                                                                <TableHead className="w-[120px] text-right">40%</TableHead>
                                                                <TableHead className="w-[120px] text-right">60%</TableHead>
                                                                <TableHead className="w-[140px] text-right">เจ้าหนี้ ต้องจ่าย</TableHead>
                                                                <TableHead className="w-[80px] text-center">เสร็จสิ้น</TableHead>
                                                                <TableHead className="w-[50px]"><span className="sr-only">Delete</span></TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {entries.map((entry) => {
                                                                const profit = (entry.sellingPrice || 0) - (entry.cost || 0);
                                                                const share40 = profit * 0.4;
                                                                const share60 = profit * 0.6;
                                                                const creditorPayable = (entry.cost || 0) + share40;
                                                                return (
                                                                    <TableRow key={entry.id} className={entry.isPaid ? "bg-green-50/50 text-muted-foreground" : ""}>
                                                                        <TableCell className="p-1">
                                                                            <Input defaultValue={entry.description} onBlur={(e) => handleUpdateEntry(entry.id, 'description', e.target.value)} className="h-8" disabled={entry.isPaid} />
                                                                        </TableCell>
                                                                        <TableCell className="p-1">
                                                                            <Input type="number" defaultValue={entry.cost} onBlur={(e) => handleUpdateEntry(entry.id, 'cost', Number(e.target.value) || 0)} className="h-8 text-right" disabled={entry.isPaid} />
                                                                        </TableCell>
                                                                        <TableCell className="p-1">
                                                                            <Input type="number" defaultValue={entry.sellingPrice} onBlur={(e) => handleUpdateEntry(entry.id, 'sellingPrice', Number(e.target.value) || 0)} className="h-8 text-right" disabled={entry.isPaid} />
                                                                        </TableCell>
                                                                        <TableCell className="p-1 text-right font-medium">{formatCurrency(profit)}</TableCell>
                                                                        <TableCell className="p-1 text-right">{formatCurrency(share40)}</TableCell>
                                                                        <TableCell className="p-1 text-right">{formatCurrency(share60)}</TableCell>
                                                                        <TableCell className="p-1 text-right font-bold text-blue-600">{formatCurrency(creditorPayable)}</TableCell>
                                                                        <TableCell className="p-1 text-center">
                                                                            <Checkbox checked={entry.isPaid} onCheckedChange={(checked) => handleUpdateEntry(entry.id, 'isPaid', !!checked)} />
                                                                        </TableCell>
                                                                        <TableCell className="p-1 text-center">
                                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )})}
                                </Accordion>
                            ) : (
                                 <div className="text-center text-muted-foreground py-8">
                                    ไม่มีรายการในเดือนที่เลือก
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
