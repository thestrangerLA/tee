
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

import { ArrowLeft, Users, Calendar as CalendarIcon, Trash2, PlusCircle, ChevronDown } from "lucide-react";
import { DrugCreditorEntry } from '@/lib/types';
import { listenToDrugCreditorEntries, addDrugCreditorEntry, updateDrugCreditorEntry, deleteDrugCreditorEntry, updateOrderStatus } from '@/services/drugCreditorService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';


const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0 }).format(value);
};


const AddEntryForm = ({ onAddEntry, defaultDate }: { onAddEntry: (entry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date' | 'isPaid' | 'note'>, date: Date) => Promise<void>, defaultDate: Date }) => {
    const { toast } = useToast();
    const [order, setOrder] = useState(0);
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order || !description) {
            toast({
                title: "ຂໍ້ຜິດພາດ",
                description: "ກະລຸນາປ້ອນລຳດັບ ແລະ ລາຍລະອຽດ",
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
            }, defaultDate);
            toast({ title: "ເພີ່ມລາຍການສຳເລັດ" });
            // Reset form
            setOrder(0);
            setDescription('');
            setCost(0);
            setSellingPrice(0);
        } catch (error) {
            console.error("Error adding entry: ", error);
            toast({
                title: "ເກີດຂໍ້ຜິດພາດ",
                description: "ບໍ່ສາມາດເພີ່ມລາຍການໄດ້",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>ເພີ່ມລາຍການຢາໃໝ່</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                             <Label htmlFor="order">ລຳດັບ</Label>
                             <Input id="order" type="number" placeholder="1" value={order || ''} onChange={(e) => setOrder(Number(e.target.value))} required />
                        </div>
                        <div className="grid gap-2">
                             <Label htmlFor="description">ລາຍການ</Label>
                             <Input id="description" placeholder="ຊື່ຢາ" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                         <div className="grid gap-2">
                             <Label htmlFor="cost">ຕົ້ນທຶນ</Label>
                             <Input id="cost" type="number" placeholder="0" value={cost || ''} onChange={(e) => setCost(Number(e.target.value))} />
                        </div>
                         <div className="grid gap-2">
                             <Label htmlFor="sellingPrice">ລາຄາຂາຍ</Label>
                             <Input id="sellingPrice" type="number" placeholder="0" value={sellingPrice || ''} onChange={(e) => setSellingPrice(Number(e.target.value))} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມລາຍການ
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

    const handleAddEntry = async (newEntry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date' | 'isPaid' | 'note'>, date: Date) => {
        try {
            const selectedDateForEntry = new Date(displayMonth); // Use the month being displayed
            await addDrugCreditorEntry(newEntry, selectedDateForEntry);
        } catch (error) {
            console.error('Error adding entry:', error);
            toast({ title: 'ເກີດຂໍ້ຜິດພາດ', variant: 'destructive' });
        }
    };
    
    const handleUpdateEntry = async (id: string, field: keyof Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date'>, value: any) => {
        try {
            await updateDrugCreditorEntry(id, { [field]: value });
        } catch (error) {
            console.error('Error updating entry:', error);
            toast({ title: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ', variant: 'destructive' });
        }
    };
    
    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm("ເຈົ້າແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?")) return;
        try {
            await deleteDrugCreditorEntry(id);
            toast({ title: "ລຶບລາຍການສຳເລັດ" });
        } catch (error) {
            console.error("Error deleting entry: ", error);
            toast({ title: "ເກີດຂໍ້ຜິດພາດ", variant: "destructive" });
        }
    };
    
    const handleOrderStatusChange = async (date: Date, order: number, isPaid: boolean) => {
        try {
            await updateOrderStatus(date, order, isPaid);
            toast({
                title: `ອັບເດດລຳດັບ ${order} ສຳເລັດ`,
                description: `ປ່ຽນສະຖານະເປັນ ${isPaid ? 'ຈ່າຍແລ້ວ' : 'ຍັງບໍ່ໄດ້ຈ່າຍ'}`,
            });
        } catch (error) {
            console.error("Error updating order status: ", error);
            toast({ title: "ເກີດຂໍ້ຜິດພາດ", variant: "destructive" });
        }
    };

    const dailySummaries = useMemo(() => {
        const groupedByDay: Record<string, { 
            date: Date; 
            entries: DrugCreditorEntry[];
            totalOrders: number;
            remainingOrders: number;
        }> = {};

        filteredEntries.forEach(entry => {
            const dayKey = format(entry.date, 'yyyy-MM-dd');
            if (!groupedByDay[dayKey]) {
                groupedByDay[dayKey] = { 
                    date: entry.date, 
                    entries: [],
                    totalOrders: 0,
                    remainingOrders: 0
                };
            }
            groupedByDay[dayKey].entries.push(entry);
        });

        // Calculate order counts after grouping all entries
        Object.values(groupedByDay).forEach(daySummary => {
            const ordersInDay = daySummary.entries.reduce((acc, entry) => {
                const orderKey = String(entry.order);
                if (!acc[orderKey]) acc[orderKey] = [];
                acc[orderKey].push(entry);
                return acc;
            }, {} as Record<string, DrugCreditorEntry[]>);

            const totalOrders = Object.keys(ordersInDay).length;
            const remainingOrders = Object.values(ordersInDay).filter(orderEntries => 
                orderEntries.some(e => !e.isPaid)
            ).length;
            
            daySummary.totalOrders = totalOrders;
            daySummary.remainingOrders = remainingOrders;
        });

        return Object.values(groupedByDay).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [filteredEntries]);


    const pageTotals = useMemo(() => {
        const cost = filteredEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
        const sellingPrice = filteredEntries.reduce((sum, entry) => sum + (entry.sellingPrice || 0), 0);
        const profit = filteredEntries.reduce((sum, entry) => {
            const entryProfit = (entry.sellingPrice || 0) - (entry.cost || 0);
            return sum + (entryProfit * 0.4); 
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
                    <Users className="h-6 w-6 text-rose-500" />
                    <h1 className="text-xl font-bold tracking-tight">ລູກໜີ້ຄ່າຢາ</h1>
                </div>
                 <div className="ml-auto flex items-center gap-4">
                     <MonthYearSelector />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid lg:grid-cols-3">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <AddEntryForm onAddEntry={handleAddEntry} defaultDate={displayMonth} />
                    <Card>
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຍອດລວມ (ເດືອນທີ່ເລືອກ)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <h3 className="text-base font-semibold">ຕົ້ນທຶນລວມ</h3>
                                <p className="text-lg font-bold">{formatCurrency(pageTotals.cost)}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <h3 className="text-base font-semibold">ລາຄາຂາຍລວມ</h3>
                                <p className="text-lg font-bold">{formatCurrency(pageTotals.sellingPrice)}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <h3 className="text-base font-semibold">ກຳໄລ (40%)</h3>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(pageTotals.profit)}</p>
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3 bg-red-50">
                                <h3 className="text-base font-semibold text-red-700">ລວມລູກໜີ້ຄົງເຫຼືອ</h3>
                                <p className="text-lg font-bold text-red-600">{formatCurrency(pageTotals.remainingCreditorPayable)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>ຕາຕະລາງຄິດໄລ່ສ່ວນແບ່ງ</CardTitle>
                             <CardDescription>ຂໍ້ມູນສຳລັບເດືອນ {format(displayMonth, "LLLL yyyy")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailySummaries.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {dailySummaries.map((summary, index) => {
                                        const ordersInDay = summary.entries.reduce((acc, entry) => {
                                            const orderKey = String(entry.order);
                                            if (!acc[orderKey]) acc[orderKey] = [];
                                            acc[orderKey].push(entry);
                                            return acc;
                                        }, {} as Record<string, DrugCreditorEntry[]>);

                                        return (
                                        <AccordionItem value={`day-${index}`} key={index}>
                                            <AccordionTrigger>
                                                 <div className="flex justify-between w-full pr-4">
                                                    <div className="font-semibold text-lg">{`ວັນທີ ${format(summary.date, "d")}`}</div>
                                                     <div className="flex gap-4 items-center">
                                                        <span className={`text-sm font-semibold ${summary.remainingOrders > 0 ? 'text-red-500' : 'text-green-500'}`}>{summary.remainingOrders}/{summary.totalOrders} ລຳດັບ</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-4 border-l-2">
                                                <Accordion type="single" collapsible className="w-full">
                                                    {Object.entries(ordersInDay).map(([order, entries]) => {
                                                        const orderTotals = entries.reduce((acc, entry) => {
                                                            const profit = (entry.sellingPrice || 0) - (entry.cost || 0);
                                                            acc.cost += entry.cost || 0;
                                                            acc.sellingPrice += entry.sellingPrice || 0;
                                                            acc.profit += profit;
                                                            const share40 = profit * 0.4;
                                                            const share60 = profit * 0.6;
                                                            acc.share40 += share40;
                                                            acc.share60 += share60;
                                                            if (!entry.isPaid) {
                                                                acc.payable += (entry.cost || 0) + share40;
                                                            }
                                                            return acc;
                                                        }, { payable: 0, profit: 0, cost: 0, sellingPrice: 0, share40: 0, share60: 0 });

                                                        const isOrderPaid = entries.every(e => e.isPaid);

                                                        return (
                                                        <AccordionItem value={`order-${order}`} key={order}>
                                                          <div className="flex w-full items-center pr-4 pl-2">
                                                              <AccordionTrigger className="flex-1 py-2">
                                                                  <div className="flex justify-between w-full items-center">
                                                                      <div className="font-semibold">ລຳດັບ: {order}</div>
                                                                      <div className="flex gap-4 items-center text-sm">
                                                                          <span className="text-blue-600">ຈ່າຍ (ຄົງເຫຼືອ): {formatCurrency(orderTotals.payable)}</span>
                                                                          <span className="text-green-600">ກຳໄລ (40%): {formatCurrency(orderTotals.share40)}</span>
                                                                          <span className="text-yellow-600">ກຳໄລ (60%): {formatCurrency(orderTotals.share60)}</span>
                                                                      </div>
                                                                  </div>
                                                              </AccordionTrigger>
                                                              <div className="flex items-center gap-2 pl-4" onClick={(e) => e.stopPropagation()}>
                                                                  <Checkbox
                                                                      id={`order-paid-${order}-${summary.date.toISOString()}`}
                                                                      checked={isOrderPaid}
                                                                      onCheckedChange={(checked) => handleOrderStatusChange(summary.date, Number(order), !!checked)}
                                                                  />
                                                                  <Label htmlFor={`order-paid-${order}-${summary.date.toISOString()}`} className="text-sm font-medium whitespace-nowrap">
                                                                      ສຳເລັດ
                                                                  </Label>
                                                              </div>
                                                          </div>
                                                            <AccordionContent>
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>ລາຍການ</TableHead>
                                                                            <TableHead>ໝາຍເຫດ</TableHead>
                                                                            <TableHead className="w-[100px] text-right">ຕົ້ນທຶນ</TableHead>
                                                                            <TableHead className="w-[100px] text-right">ລາຄາຂາຍ</TableHead>
                                                                            <TableHead className="w-[100px] text-right">ກຳໄລ</TableHead>
                                                                            <TableHead className="w-[100px] text-right">40%</TableHead>
                                                                            <TableHead className="w-[100px] text-right">60%</TableHead>
                                                                            <TableHead className="w-[50px]"><span className="sr-only">Delete</span></TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {entries.map((entry) => {
                                                                            const profit = (entry.sellingPrice || 0) - (entry.cost || 0);
                                                                            const share40 = profit * 0.4;
                                                                            const share60 = profit * 0.6;
                                                                            return (
                                                                                <TableRow key={entry.id} className={entry.isPaid ? "bg-green-50/50 text-muted-foreground" : ""}>
                                                                                    <TableCell className="p-1">
                                                                                        <Input defaultValue={entry.description} onBlur={(e) => handleUpdateEntry(entry.id, 'description', e.target.value)} className="h-8" disabled={entry.isPaid} />
                                                                                    </TableCell>
                                                                                     <TableCell className="p-1">
                                                                                        <Input defaultValue={entry.note} onBlur={(e) => handleUpdateEntry(entry.id, 'note', e.target.value)} className="h-8" disabled={entry.isPaid} />
                                                                                    </TableCell>
                                                                                    <TableCell className="p-1">
                                                                                        <Input type="number" defaultValue={entry.cost || undefined} onBlur={(e) => handleUpdateEntry(entry.id, 'cost', Number(e.target.value) || 0)} className="h-8 text-right" disabled={entry.isPaid} />
                                                                                    </TableCell>
                                                                                    <TableCell className="p-1">
                                                                                        <Input type="number" defaultValue={entry.sellingPrice || undefined} onBlur={(e) => handleUpdateEntry(entry.id, 'sellingPrice', Number(e.target.value) || 0)} className="h-8 text-right" disabled={entry.isPaid} />
                                                                                    </TableCell>
                                                                                    <TableCell className="p-1 text-right">{formatCurrency(profit)}</TableCell>
                                                                                    <TableCell className="p-1 text-right text-green-600 font-medium">{formatCurrency(share40)}</TableCell>
                                                                                    <TableCell className="p-1 text-right text-yellow-600 font-medium">{formatCurrency(share60)}</TableCell>
                                                                                    <TableCell className="p-1 text-center">
                                                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                    <tfoot className="bg-muted/50 font-medium">
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} className="p-2 text-right">ລວມ</TableCell>
                                                                            <TableCell className="p-2 text-right">{formatCurrency(orderTotals.cost)}</TableCell>
                                                                            <TableCell className="p-2 text-right">{formatCurrency(orderTotals.sellingPrice)}</TableCell>
                                                                            <TableCell className="p-2 text-right">{formatCurrency(orderTotals.profit)}</TableCell>
                                                                            <TableCell className="p-2 text-right text-green-600">{formatCurrency(orderTotals.share40)}</TableCell>
                                                                            <TableCell className="p-2 text-right text-yellow-600">{formatCurrency(orderTotals.share60)}</TableCell>
                                                                            <TableCell className="p-2"></TableCell>
                                                                        </TableRow>
                                                                    </tfoot>
                                                                </Table>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                        )
                                                    })}
                                                </Accordion>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )})}
                                </Accordion>
                            ) : (
                                 <div className="text-center text-muted-foreground py-8">
                                    ບໍ່ມີລາຍການໃນເດືອນທີ່ເລືອກ
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
