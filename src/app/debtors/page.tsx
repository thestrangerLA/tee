
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, isWithinInterval, startOfMonth, endOfMonth, getYear, getMonth, setMonth } from "date-fns";
import { lo } from "date-fns/locale";
import { ArrowLeft, Users, Calendar as CalendarIcon, Trash2, PlusCircle, ChevronDown } from "lucide-react";
import { DebtorCreditorEntry } from '@/lib/types';
import { listenToDebtorCreditorEntries, addDebtorCreditorEntry, updateDebtorCreditorEntry, deleteDebtorCreditorEntry } from '@/services/debtorCreditorService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

const AddEntryForm = ({ onAddEntry, defaultDate }: { onAddEntry: (entry: Omit<DebtorCreditorEntry, 'id' | 'createdAt'>) => Promise<void>, defaultDate: Date }) => {
    const { toast } = useToast();
    const [type, setType] = useState<'debtor' | 'creditor'>('debtor');
    const [date, setDate] = useState<Date | undefined>(defaultDate);
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    
    useEffect(() => {
        setDate(defaultDate);
    }, [defaultDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !amount || !description) {
            toast({
                title: "ข้อผิดพลาด",
                description: "กรุณากรอกข้อมูลให้ครบถ้วน",
                variant: "destructive",
            });
            return;
        }

        try {
            await onAddEntry({
                type,
                date: startOfDay(date),
                amount,
                description,
                isPaid: false
            });
            toast({ title: "เพิ่มรายการสำเร็จ" });
            // Reset form
            setType('debtor');
            setDate(defaultDate);
            setAmount(0);
            setDescription('');
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
                <CardTitle>เพิ่มรายการลูกหนี้/เจ้าหนี้ทั่วไป</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-3">
                        <RadioGroup value={type} onValueChange={(v) => setType(v as 'debtor' | 'creditor')} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debtor" id="r-debtor" />
                                <Label htmlFor="r-debtor">ลูกหนี้ (ต้องรับเงิน)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="creditor" id="r-creditor" />
                                <Label htmlFor="r-creditor">เจ้าหนี้ (ต้องจ่ายเงิน)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="date">วันที่</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: lo }) : <span>เลือกวันที่</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={lo} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="amount">จำนวนเงิน</Label>
                        <Input id="amount" type="number" placeholder="0" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description">รายละเอียด/ชื่อ</Label>
                        <Textarea id="description" placeholder="เช่น ค่าปุ๋ย, นาย ก." value={description} onChange={(e) => setDescription(e.target.value)} required />
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


export default function DebtorsPage() {
    const { toast } = useToast();
    const [allEntries, setAllEntries] = useState<DebtorCreditorEntry[]>([]);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());


    useEffect(() => {
        const unsubscribe = listenToDebtorCreditorEntries(setAllEntries);
        return () => unsubscribe();
    }, []);

    const dailySummaries = useMemo(() => {
        const start = startOfMonth(displayMonth);
        const end = endOfMonth(displayMonth);
        const monthlyEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start, end }));

        const groupedByDay: Record<string, { date: Date; entries: DebtorCreditorEntry[] }> = {};

        monthlyEntries.forEach(entry => {
            const dayKey = format(entry.date, 'yyyy-MM-dd');
            if (!groupedByDay[dayKey]) {
                groupedByDay[dayKey] = {
                    date: entry.date,
                    entries: []
                };
            }
            groupedByDay[dayKey].entries.push(entry);
        });

        return Object.values(groupedByDay).sort((a, b) => b.date.getTime() - a.date.getTime());

    }, [allEntries, displayMonth]);
    
    const summaryTotals = useMemo(() => {
        const start = startOfMonth(displayMonth);
        const end = endOfMonth(displayMonth);
        const monthlyEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start, end }));
        
        const totalDebtors = monthlyEntries
            .filter(e => e.type === 'debtor' && !e.isPaid)
            .reduce((sum, entry) => sum + entry.amount, 0);
            
        const totalCreditors = monthlyEntries
            .filter(e => e.type === 'creditor' && !e.isPaid)
            .reduce((sum, entry) => sum + entry.amount, 0);

        return { totalDebtors, totalCreditors };
    }, [allEntries, displayMonth]);


    const handleAddEntry = async (entry: Omit<DebtorCreditorEntry, 'id' | 'createdAt'>) => {
        await addDebtorCreditorEntry(entry);
    };

    const handleUpdateEntry = async (id: string, fields: Partial<DebtorCreditorEntry>) => {
        try {
            await updateDebtorCreditorEntry(id, fields);
            // No toast for inline edits to avoid being noisy
        } catch (error) {
            console.error("Error updating entry: ", error);
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
        try {
            await deleteDebtorCreditorEntry(id);
            toast({ title: "ลบรายการสำเร็จ" });
        } catch (error) {
            console.error("Error deleting entry: ", error);
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        }
    };

    const MonthYearSelector = () => {
        const years = Array.from({ length: 3 }, (_, i) => getYear(new Date()) - 1 + i);
        const months = Array.from({ length: 12 }, (_, i) => setMonth(new Date(), i));

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        {format(displayMonth, "LLLL yyyy", { locale: lo })}
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
                                            {format(month, "LLLL", { locale: lo })}
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
                    <Users className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ลูกหนี้/เจ้าหนี้ทั่วไป</h1>
                </div>
                <div className="ml-auto">
                    <MonthYearSelector />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <AddEntryForm onAddEntry={handleAddEntry} defaultDate={displayMonth} />
                         <Card>
                            <CardHeader>
                                <CardTitle>สรุปยอด (เดือนที่เลือก)</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <h3 className="text-lg font-semibold">ลูกหนี้คงค้าง</h3>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(summaryTotals.totalDebtors)}</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <h3 className="text-lg font-semibold">เจ้าหนี้คงค้าง</h3>
                                    <p className="text-xl font-bold text-yellow-600">{formatCurrency(summaryTotals.totalCreditors)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                         <Card>
                            <CardHeader>
                                <CardTitle>รายการประจำเดือน</CardTitle>
                                <CardDescription>แสดงรายการทั้งหมดในเดือน {format(displayMonth, "LLLL yyyy", { locale: lo })}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dailySummaries.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full">
                                        {dailySummaries.map((summary, index) => (
                                            <AccordionItem value={`item-${index}`} key={index}>
                                                <AccordionTrigger>
                                                    <div className="flex justify-between w-full pr-4">
                                                        <div className="font-semibold">{`วันที่ ${format(summary.date, "d")}`}</div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>ประเภท</TableHead>
                                                                <TableHead>รายละเอียด</TableHead>
                                                                <TableHead className="text-right">จำนวนเงิน</TableHead>
                                                                <TableHead className="text-center">ชำระแล้ว</TableHead>
                                                                <TableHead><span className="sr-only">ลบ</span></TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                        {summary.entries.map((entry) => (
                                                            <TableRow key={entry.id} className={entry.isPaid ? 'bg-green-50/50 text-muted-foreground' : (entry.type === 'debtor' ? 'bg-red-50/50' : 'bg-yellow-50/50')}>
                                                                <TableCell className="p-2">
                                                                     <Badge variant={entry.type === 'debtor' ? 'destructive' : 'secondary'} className="w-[60px] justify-center">
                                                                        {entry.type === 'debtor' ? 'ลูกหนี้' : 'เจ้าหนี้'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-medium p-2">
                                                                    <Input 
                                                                        defaultValue={entry.description}
                                                                        onBlur={(e) => handleUpdateEntry(entry.id, { description: e.target.value })}
                                                                        className="h-8"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2">
                                                                    <Input 
                                                                        type="number"
                                                                        defaultValue={entry.amount}
                                                                        onBlur={(e) => handleUpdateEntry(entry.id, { amount: Number(e.target.value) || 0 })}
                                                                        className="h-8 text-right"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center p-2">
                                                                    <Checkbox checked={entry.isPaid} onCheckedChange={(checked) => handleUpdateEntry(entry.id, { isPaid: !!checked })} />
                                                                </TableCell>
                                                                <TableCell className="p-2">
                                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        </TableBody>
                                                    </Table>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        ไม่มีรายการในเดือนที่เลือก
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

    