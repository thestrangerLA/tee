
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, Truck, PlusCircle, Calendar as CalendarIcon, ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { listenToTransportEntries, addTransportEntry, updateTransportEntry, deleteTransportEntry } from '@/services/transportService';
import type { TransportEntry, StockItem } from '@/lib/types';
import { listenToAutoPartsStockItems } from '@/services/autoPartsStockService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, isWithinInterval, startOfMonth, endOfMonth, getMonth, setMonth, getYear, isSameDay } from 'date-fns';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from '@/lib/utils';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
}

const SearchableSelect = ({ items, value, onValueChange }: { items: StockItem[], value: string, onValueChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-8"
                >
                    <span className="truncate">
                        {value
                            ? items.find((item) => item.name === value)?.name ?? value
                            : "ເລືອກສິນຄ້າ..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="ຄົ້ນຫາສິນຄ້າ..." />
                    <CommandEmpty>ບໍ່ພົບສິນຄ້າ.</CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={(currentValue) => {
                                    const selectedItem = items.find(i => i.name.toLowerCase() === currentValue.toLowerCase());
                                    onValueChange(selectedItem ? selectedItem.name : "");
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === item.name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


const TransportTable = ({ type, title, entries, onRowChange, onRowDelete, onAddRow, stockItems }: { 
    type: 'ANS' | 'HAL' | 'MX',
    title: string, 
    entries: TransportEntry[],
    onRowChange: (id: string, field: keyof TransportEntry, value: any) => void,
    onRowDelete: (id: string) => void,
    onAddRow: (type: 'ANS' | 'HAL' | 'MX') => void,
    stockItems: StockItem[]
}) => {
    
    const totalAmount = useMemo(() => entries.reduce((sum, entry) => sum + (entry.amount || 0), 0), [entries]);
    const totalRemaining = useMemo(() => entries.filter(e => !e.finished).reduce((sum, entry) => sum + (entry.amount || 0), 0), [entries]);
    const totalEntries = useMemo(() => entries.length, [entries]);
    const unfinishedEntriesCount = useMemo(() => entries.filter(e => !e.finished).length, [entries]);

    const dailySummaries = useMemo(() => {
        const groupedByDay: Record<string, { date: Date; profit: number, entries: TransportEntry[], orderCount: number, unfinishedCount: number, remainingAmount: number }> = {};

        entries.forEach(entry => {
            const dayKey = format(entry.date, 'yyyy-MM-dd');
            if (!groupedByDay[dayKey]) {
                groupedByDay[dayKey] = {
                    date: entry.date,
                    profit: 0,
                    entries: [],
                    orderCount: 0,
                    unfinishedCount: 0,
                    remainingAmount: 0
                };
            }
            groupedByDay[dayKey].entries.push(entry);
            groupedByDay[dayKey].profit += (entry.amount || 0) - (entry.cost || 0);
            groupedByDay[dayKey].orderCount += 1;
            if (!entry.finished) {
                groupedByDay[dayKey].unfinishedCount += 1;
                groupedByDay[dayKey].remainingAmount += (entry.amount || 0);
            }
        });

        return Object.values(groupedByDay).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [entries]);


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-2">
                        <span>ລວມ: {formatCurrency(totalAmount)}</span>
                        <span className="text-red-600">ຄົງເຫຼືອ: {formatCurrency(totalRemaining)}</span>
                        {totalEntries > 0 && (
                             <span className="font-semibold">| ຄ້າງ {unfinishedEntriesCount}/{totalEntries} ລາຍການ</span>
                        )}
                    </CardDescription>
                </div>
                <Button size="sm" onClick={() => onAddRow(type)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    ເພີ່ມແຖວ
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    {dailySummaries.length > 0 ? (
                         <Accordion type="single" collapsible className="w-full">
                            {dailySummaries.map((summary, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <div className="font-semibold">{`ວັນທີ ${format(summary.date, "d")}`}</div>
                                            <div className="flex gap-4 items-center text-sm">
                                                 <span className={`font-medium ${summary.unfinishedCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    ຄ້າງ {summary.unfinishedCount}/{summary.orderCount}
                                                 </span>
                                                 {summary.unfinishedCount > 0 && (
                                                    <span className="text-red-600">ເຫຼືອ: {formatCurrency(summary.remainingAmount)}</span>
                                                 )}
                                                <span className={summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    ກຳໄລ: {formatCurrency(summary.profit)}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[40%]">ລາຍລະອຽດ</TableHead>
                                                    <TableHead className="w-[150px] text-right">ຕົ້ນທຶນ</TableHead>
                                                    <TableHead className="w-[150px] text-right">ຈຳນວນເງິນ</TableHead>
                                                    <TableHead className="w-[120px] text-right">ກຳໄລ</TableHead>
                                                    <TableHead className="w-[80px] text-center">ສຳເລັດ</TableHead>
                                                    <TableHead className="w-[50px] text-center">ລົບ</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {summary.entries.map((row) => {
                                                    const profit = (row.amount || 0) - (row.cost || 0);
                                                    return (
                                                    <TableRow key={row.id}>
                                                        <TableCell className="p-2">
                                                            <SearchableSelect
                                                                items={stockItems}
                                                                value={row.detail || ''}
                                                                onValueChange={(value) => onRowChange(row.id, 'detail', value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input type="number" value={row.cost || ''} onChange={(e) => onRowChange(row.id, 'cost', parseFloat(e.target.value) || 0)} placeholder="ຕົ້ນທຶນ" className="h-8 text-right" />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input type="number" value={row.amount || ''} onChange={(e) => onRowChange(row.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="ຈຳນວນເງິນ" className="h-8 text-right" />
                                                        </TableCell>
                                                        <TableCell className={`p-2 text-right font-medium ${profit >= 0 ? '' : 'text-red-600'}`}>
                                                            {formatCurrency(profit)}
                                                        </TableCell>
                                                        <TableCell className="text-center p-2">
                                                            <Checkbox checked={row.finished} onCheckedChange={(checked) => onRowChange(row.id, 'finished', checked)} />
                                                        </TableCell>
                                                        <TableCell className="text-center p-2">
                                                            <Button variant="ghost" size="icon" onClick={() => onRowDelete(row.id)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )})}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                         </Accordion>
                    ) : (
                         <div className="text-center text-muted-foreground py-4">ບໍ່ມີລາຍການໃນເດືອນທີ່ເລືอก</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


export default function TransportPage() {
    const { toast } = useToast();
    const [allEntries, setAllEntries] = useState<TransportEntry[]>([]);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    
    useEffect(() => {
        const unsubscribe = listenToTransportEntries(setAllEntries);
        const unsubscribeStock = listenToAutoPartsStockItems(setStockItems);
        return () => {
            unsubscribe();
            unsubscribeStock();
        }
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
            toast({ title: "ເພີ່ມແຖວໃໝ່ສຳເລັດ" });
        } catch (error) {
            console.error("Error adding row: ", error);
            toast({ title: "ເກີດຂໍ້ຜິດພາດ", description: "ບໍ່ສາມາດເພີ່ມແຖວໄດ້", variant: "destructive" });
        }
    };

    const handleTransportRowChange = async (id: string, field: keyof TransportEntry, value: any) => {
        try {
            await updateTransportEntry(id, { [field]: value });
            // No toast needed for real-time updates to avoid being noisy
        } catch (error) {
            console.error("Error updating row: ", error);
            toast({ title: "ເກີດຂໍ້ຜິດພາດ", description: "ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້", variant: "destructive" });
        }
    };

    const handleTransportRowDelete = async (id: string) => {
        if (!window.confirm("ເຈົ້າແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບແຖວນີ້?")) return;
        try {
            await deleteTransportEntry(id);
            toast({ title: "ລຶບແຖວສຳເລັດ" });
        } catch (error) {
            console.error("Error deleting row: ", error);
            toast({ title: "ເກີດຂໍ້ຜິດພາດ", description: "ບໍ່ສາມາດລຶບແຖວໄດ້", variant: "destructive" });
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
                    <Link href="/agriculture">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ບັນຊີຂົນສົ່ງ</h1>
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
                                    title="ລາຍການ ANS"
                                    entries={ansEntries}
                                    onAddRow={handleAddTransportRow}
                                    onRowChange={handleTransportRowChange}
                                    onRowDelete={handleTransportRowDelete}
                                    stockItems={stockItems}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-hal">
                             <AccordionTrigger className="text-lg font-bold bg-green-50 hover:bg-green-100 px-4 rounded-md">HAL</AccordionTrigger>
                            <AccordionContent className="p-1">
                                <TransportTable 
                                    type="HAL"
                                    title="ລາຍການ HAL"
                                    entries={halEntries}
                                    onAddRow={handleAddTransportRow}
                                    onRowChange={handleTransportRowChange}
                                    onRowDelete={handleTransportRowDelete}
                                    stockItems={stockItems}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-mx">
                             <AccordionTrigger className="text-lg font-bold bg-orange-50 hover:bg-orange-100 px-4 rounded-md">MX</AccordionTrigger>
                            <AccordionContent className="p-1">
                                <TransportTable 
                                    type="MX"
                                    title="ລາຍການ MX"
                                    entries={mxEntries}
                                    onAddRow={handleAddTransportRow}
                                    onRowChange={handleTransportRowChange}
                                    onRowDelete={handleTransportRowDelete}
                                    stockItems={stockItems}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div className="md:col-span-1 mt-4 md:mt-0 flex flex-col gap-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຍອດລວມ (ເດືອນທີ່ເລືอก)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">ລວມຈຳນວນເງິນ</span>
                                <span className="font-bold text-lg text-blue-600">{formatCurrency(transportTotalAmount)}</span>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">ລວມຕົ້ນທຶນ</span>
                                <span className="font-bold text-lg text-orange-600">{formatCurrency(transportTotalCost)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">ກຳໄລ</span>
                                <span className={`font-bold text-lg ${transportProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transportProfit)}</span>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                <span className="font-semibold text-lg">ຄົງເຫຼືອ</span>
                                <span className="font-bold text-lg text-red-600">{formatCurrency(transportRemaining)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
