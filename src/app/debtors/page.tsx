
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
import { format, startOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowLeft, Users, Calendar as CalendarIcon, Trash2, PlusCircle } from "lucide-react";
import { DebtorCreditorEntry } from '@/lib/types';
import { listenToDebtorCreditorEntries, addDebtorCreditorEntry, updateDebtorCreditorEntry, deleteDebtorCreditorEntry } from '@/services/debtorCreditorService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'LAK', currencyDisplay: 'code', minimumFractionDigits: 0 }).format(value).replace('LAK', 'KIP');
};

const AddEntryForm = ({ onAddEntry }: { onAddEntry: (entry: Omit<DebtorCreditorEntry, 'id' | 'createdAt'>) => Promise<void> }) => {
    const { toast } = useToast();
    const [type, setType] = useState<'debtor' | 'creditor'>('debtor');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');

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
            setDate(new Date());
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
                <CardTitle>เพิ่มรายการลูกหนี้/เจ้าหนี้</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-3">
                        <RadioGroup value={type} onValueChange={(v) => setType(v as 'debtor' | 'creditor')} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debtor" id="r-debtor" />
                                <Label htmlFor="r-debtor">ลูกหนี้ (เราต้องรับเงิน)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="creditor" id="r-creditor" />
                                <Label htmlFor="r-creditor">เจ้าหนี้ (เราต้องจ่ายเงิน)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="date">วันที่</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={th} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="amount">จำนวนเงิน (KIP)</Label>
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

const EntriesTable = ({ entries, onUpdate, onDelete }: { entries: DebtorCreditorEntry[], onUpdate: (id: string, fields: Partial<DebtorCreditorEntry>) => void, onDelete: (id: string) => void }) => {
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>รายละเอียด</TableHead>
                        <TableHead className="text-right">จำนวนเงิน</TableHead>
                        <TableHead className="text-center">ชำระแล้ว</TableHead>
                        <TableHead><span className="sr-only">ลบ</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id} className={entry.isPaid ? 'bg-green-50/50 text-muted-foreground' : ''}>
                            <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell className="font-medium">{entry.description}</TableCell>
                            <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                            <TableCell className="text-center">
                                <Checkbox checked={entry.isPaid} onCheckedChange={(checked) => onUpdate(entry.id, { isPaid: !!checked })} />
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {entries.length === 0 && <div className="text-center text-muted-foreground py-4">ไม่มีรายการ</div>}
        </>
    );
};

const SectionAccordionItem = ({ title, entries, onUpdate, onDelete, value }: {
    title: string;
    entries: DebtorCreditorEntry[];
    onUpdate: (id: string, fields: Partial<DebtorCreditorEntry>) => void;
    onDelete: (id: string) => void;
    value: string;
}) => {
    const totalAmount = useMemo(() => entries.reduce((sum, entry) => sum + entry.amount, 0), [entries]);

    return (
        <AccordionItem value={value}>
            <AccordionTrigger className="text-lg font-bold bg-muted/50 hover:bg-muted px-4 rounded-md">
                <div className="flex justify-between w-full pr-4">
                    <span>{title}</span>
                    <span className="text-base font-semibold text-primary">{formatCurrency(totalAmount)}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-1">
                <EntriesTable entries={entries} onUpdate={onUpdate} onDelete={onDelete} />
            </AccordionContent>
        </AccordionItem>
    );
};


export default function DebtorsPage() {
    const { toast } = useToast();
    const [allEntries, setAllEntries] = useState<DebtorCreditorEntry[]>([]);

    useEffect(() => {
        const unsubscribe = listenToDebtorCreditorEntries(setAllEntries);
        return () => unsubscribe();
    }, []);

    const debtors = useMemo(() => allEntries.filter(e => e.type === 'debtor' && !e.isPaid), [allEntries]);
    const creditors = useMemo(() => allEntries.filter(e => e.type === 'creditor' && !e.isPaid), [allEntries]);
    const history = useMemo(() => allEntries.filter(e => e.isPaid), [allEntries]);

    const handleAddEntry = async (entry: Omit<DebtorCreditorEntry, 'id' | 'createdAt'>) => {
        await addDebtorCreditorEntry(entry);
    };

    const handleUpdateEntry = async (id: string, fields: Partial<DebtorCreditorEntry>) => {
        try {
            await updateDebtorCreditorEntry(id, fields);
            toast({ title: "อัปเดตสถานะสำเร็จ" });
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
                    <h1 className="text-xl font-bold tracking-tight">ลูกหนี้/เจ้าหนี้</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <AddEntryForm onAddEntry={handleAddEntry} />
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-2">
                         <Accordion type="single" collapsible defaultValue="item-debtors" className="w-full">
                            <SectionAccordionItem
                                value="item-debtors"
                                title="ลูกหนี้ (ยังไม่ได้ชำระ)"
                                entries={debtors}
                                onUpdate={handleUpdateEntry}
                                onDelete={handleDeleteEntry}
                            />
                            <SectionAccordionItem
                                value="item-creditors"
                                title="เจ้าหนี้ (ยังไม่ได้ชำระ)"
                                entries={creditors}
                                onUpdate={handleUpdateEntry}
                                onDelete={handleDeleteEntry}
                            />
                             <SectionAccordionItem
                                value="item-history"
                                title="ประวัติการชำระ"
                                entries={history}
                                onUpdate={handleUpdateEntry}
                                onDelete={handleDeleteEntry}
                            />
                        </Accordion>
                    </div>
                </div>
            </main>
        </div>
    );
}
