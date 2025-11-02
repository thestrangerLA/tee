
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, HandCoins, PlusCircle, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { listenToAutoPartsCodEntries, addAutoPartsCodEntry, updateAutoPartsCodEntry, deleteAutoPartsCodEntry } from '@/services/autoPartsCodService';
import type { CodEntry } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, isWithinInterval, startOfMonth, endOfMonth, getMonth, setMonth, getYear } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
}

export default function AutoPartsCodPage() {
    const { toast } = useToast();
    const [allEntries, setAllEntries] = useState<CodEntry[]>([]);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const [newEntry, setNewEntry] = useState<Partial<Omit<CodEntry, 'id' | 'createdAt'>>>({
        date: new Date(),
        type: 'pending',
        customerName: '',
        description: '',
        amount: 0,
    });
    
    useEffect(() => {
        const unsubscribe = listenToAutoPartsCodEntries(setAllEntries);
        return () => unsubscribe();
    }, []);

    const filteredEntries = useMemo(() => {
        const start = startOfMonth(displayMonth);
        const end = endOfMonth(displayMonth);
        return allEntries.filter(entry => isWithinInterval(entry.date, { start, end }));
    }, [allEntries, displayMonth]);
    
    const summary = useMemo(() => {
        const totalAmount = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
        const collected = filteredEntries.filter(e => e.type === 'collected').reduce((sum, e) => sum + e.amount, 0);
        const pending = filteredEntries.filter(e => e.type === 'pending').reduce((sum, e) => sum + e.amount, 0);
        const returned = filteredEntries.filter(e => e.type === 'returned').reduce((sum, e) => sum + e.amount, 0);
        const paidToOffice = filteredEntries.filter(e => e.isPaidToOffice).reduce((sum, e) => sum + e.amount, 0);
        const dueToOffice = collected - paidToOffice;

        return { totalAmount, collected, pending, returned, paidToOffice, dueToOffice };
    }, [filteredEntries]);
    
    const handleAddEntry = async () => {
        if (!newEntry.date || !newEntry.customerName || !newEntry.amount) {
            toast({title: 'ຂໍ້ມູນບໍ່ຄົບ', description: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ', variant: 'destructive'});
            return;
        }
        try {
            await addAutoPartsCodEntry({
                date: startOfDay(newEntry.date),
                type: 'pending',
                customerName: newEntry.customerName,
                description: newEntry.description || '',
                amount: newEntry.amount,
            });
            toast({title: 'ເພີ່ມລາຍການ COD ສຳເລັດ'});
            setNewEntry({ date: new Date(), type: 'pending', customerName: '', description: '', amount: 0 });
        } catch (e) {
            toast({title: 'ເກີດຂໍ້ຜິດພາດ', variant: 'destructive'});
        }
    };

    const handleUpdateEntry = (id: string, field: keyof CodEntry, value: any) => {
        updateAutoPartsCodEntry(id, {[field]: value});
    };
    
    const handleDeleteEntry = (id: string) => {
        if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?')) {
            deleteAutoPartsCodEntry(id).then(() => toast({title: 'ລຶບລາຍການສຳເລັດ'}));
        }
    };


    const MonthYearSelector = () => {
        const years = Array.from({ length: 3 }, (_, i) => getYear(new Date()) - 1 + i);
        const months = Array.from({ length: 12 }, (_, i) => setMonth(new Date(), i));

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        {format(displayMonth, "LLLL yyyy")}
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
                                            {format(month, "LLLL")}
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
                    <Link href="/autoparts">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <HandCoins className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ລະບົບ COD (ອາໄຫຼລົດ)</h1>
                </div>
                 <div className="ml-auto">
                    <MonthYearSelector />
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:grid md:grid-cols-3 md:gap-8">
                <div className="md:col-span-1 flex flex-col gap-4">
                     <Card>
                        <CardHeader><CardTitle>ເພີ່ມລາຍການໃໝ່</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>ວັນທີ</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className="justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newEntry.date ? format(newEntry.date, "PPP") : <span>ເລືອກວັນທີ</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newEntry.date} onSelect={(d) => setNewEntry(p => ({...p, date: d}))} initialFocus/></PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2"><Label>ຊື່ລູກຄ້າ</Label><Input value={newEntry.customerName} onChange={e => setNewEntry(p => ({...p, customerName: e.target.value}))} /></div>
                            <div className="grid gap-2"><Label>ລາຍລະອຽດ</Label><Input value={newEntry.description} onChange={e => setNewEntry(p => ({...p, description: e.target.value}))} /></div>
                            <div className="grid gap-2"><Label>ຈຳນວນເງິນ</Label><Input type="number" value={newEntry.amount || ''} onChange={e => setNewEntry(p => ({...p, amount: Number(e.target.value)}))} /></div>
                            <Button onClick={handleAddEntry}><PlusCircle className="mr-2 h-4 w-4"/>ເພີ່ມລາຍການ</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>ສະຫຼຸບຍອດ COD (ເດືອນທີ່ເລືອກ)</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between"><span>ຍອດລວມທັງໝົດ:</span><span className="font-bold">{formatCurrency(summary.totalAmount)}</span></div>
                            <div className="flex justify-between"><span>ເກັບເງິນສຳເລັດ:</span><span className="font-bold text-green-600">{formatCurrency(summary.collected)}</span></div>
                            <div className="flex justify-between"><span>ກຳລັງດຳເນີນການ:</span><span className="font-bold text-yellow-600">{formatCurrency(summary.pending)}</span></div>
                            <div className="flex justify-between"><span>ສົ່ງຄືນ:</span><span className="font-bold text-orange-600">{formatCurrency(summary.returned)}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span>ມອບເງິນໃຫ້ Office ແລ້ວ:</span><span className="font-bold">{formatCurrency(summary.paidToOffice)}</span></div>
                            <div className="flex justify-between font-bold text-red-600"><span>ຍອດຄ້າງທີ່ຕ້ອງມອບ:</span><span >{formatCurrency(summary.dueToOffice)}</span></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 mt-4 md:mt-0">
                    <Card>
                        <CardHeader><CardTitle>ລາຍການ COD</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ວັນທີ</TableHead>
                                        <TableHead>ລູກຄ້າ</TableHead>
                                        <TableHead className="text-right">ຈຳນວນເງິນ</TableHead>
                                        <TableHead className="text-center">ສະຖານະ</TableHead>
                                        <TableHead className="text-center">ມອບເງິນ Office</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEntries.map(entry => (
                                        <TableRow key={entry.id} className={entry.isPaidToOffice ? 'bg-green-50/50' : ''}>
                                            <TableCell>{format(entry.date, 'dd/MM/yy')}</TableCell>
                                            <TableCell>{entry.customerName}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                                            <TableCell className="text-center">
                                                <Select value={entry.type} onValueChange={(v) => handleUpdateEntry(entry.id, 'type', v)}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending"><Badge variant="secondary">ຄ້າງ</Badge></SelectItem>
                                                        <SelectItem value="collected"><Badge className="bg-green-500">ສຳເລັດ</Badge></SelectItem>
                                                        <SelectItem value="returned"><Badge variant="destructive">ຄືນ</Badge></SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox checked={entry.isPaidToOffice} onCheckedChange={c => handleUpdateEntry(entry.id, 'isPaidToOffice', c)} />
                                            </TableCell>
                                            <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredEntries.length === 0 && <div className="text-center p-8 text-muted-foreground">ບໍ່ມີລາຍການ</div>}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
