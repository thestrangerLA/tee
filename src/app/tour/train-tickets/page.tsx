
"use client"

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, TrainFront, Copy, Trash2, PlusCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from 'date-fns';

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

type TrainTicket = {
    id: string;
    from: string;
    to: string;
    departureDate?: Date;
    departureTime: string;
    ticketClass: string;
    numTickets: number;
    pricePerTicket: number;
    currency: Currency;
};

const formatNumber = (num: number, currency: Currency) => {
    const symbols: Record<Currency, string> = { USD: '$', THB: '฿', LAK: '₭', CNY: '¥' };
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(num)} ${symbols[currency]}`;
};

export default function TrainTicketsPage() {
    const [tickets, setTickets] = useState<TrainTicket[]>([]);
    const [grandTotal, setGrandTotal] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    const addTicket = () => {
        const newTicket: TrainTicket = {
            id: uuidv4(),
            from: '',
            to: '',
            departureTime: '08:00',
            ticketClass: '',
            numTickets: 1,
            pricePerTicket: 0,
            currency: 'LAK'
        };
        setTickets(prev => [...prev, newTicket]);
    };

    const updateTicket = (ticketId: string, field: keyof TrainTicket, value: any) => {
        setTickets(prev => prev.map(ticket => ticket.id === ticketId ? { ...ticket, [field]: value } : ticket));
    };
    
    const duplicateTicket = (ticketId: string) => {
        const ticketToCopy = tickets.find(f => f.id === ticketId);
        if (ticketToCopy) {
            setTickets(prev => [...prev, { ...ticketToCopy, id: uuidv4() }]);
        }
    };

    const deleteTicket = (ticketId: string) => {
        setTickets(prev => prev.filter(f => f.id !== ticketId));
    };

    const ticketTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        tickets.forEach(ticket => {
            totals[ticket.id] = ticket.pricePerTicket * ticket.numTickets;
        });
        return totals;
    }, [tickets]);
    
    useMemo(() => {
        const newGrandTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        tickets.forEach((ticket) => {
            const ticketTotal = ticket.pricePerTicket * ticket.numTickets;
            newGrandTotal[ticket.currency] += ticketTotal;
        });
        setGrandTotal(newGrandTotal);
    }, [tickets]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/calculator">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <TrainFront className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄ່າປີ້ລົດໄຟ</h1>
                </div>
                <div className="ml-auto">
                    <Button onClick={addTicket} className="bg-red-600 hover:bg-red-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມຄ່າປີ້ລົດໄຟ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {tickets.map((ticket, index) => (
                        <Card key={ticket.id}>
                            <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">ປີ້ລົດໄຟ #{index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => duplicateTicket(ticket.id)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTicket(ticket.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>ເສັ້ນທາງ</Label>
                                        <div className="flex items-center gap-2">
                                            <Input placeholder="ຈາກ" value={ticket.from} onChange={e => updateTicket(ticket.id, 'from', e.target.value)} />
                                            <span>ໄປ</span>
                                            <Input placeholder="ໄປ" value={ticket.to} onChange={e => updateTicket(ticket.id, 'to', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ວັນ-ເວລາເດີນທາງ</Label>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className="w-[180px] justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {ticket.departureDate ? format(ticket.departureDate, "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={ticket.departureDate} onSelect={(date) => updateTicket(ticket.id, 'departureDate', date)} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="time" value={ticket.departureTime} onChange={e => updateTicket(ticket.id, 'departureTime', e.target.value)} className="pl-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor={`tickets-${ticket.id}`}>ຈຳນວນປີ້</Label>
                                        <Input id={`tickets-${ticket.id}`} type="number" min="1" value={ticket.numTickets} onChange={e => updateTicket(ticket.id, 'numTickets', parseInt(e.target.value) || 1)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`class-${ticket.id}`}>ຊັ້ນໂດຍສານ</Label>
                                        <Input id={`class-${ticket.id}`} placeholder="ເຊັ່ນ: ຊັ້ນ 1" value={ticket.ticketClass} onChange={e => updateTicket(ticket.id, 'ticketClass', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`price-${ticket.id}`}>ລາຄາ</Label>
                                        <Input id={`price-${ticket.id}`} type="number" min="0" value={ticket.pricePerTicket} onChange={e => updateTicket(ticket.id, 'pricePerTicket', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ສະກຸນເງິນ</Label>
                                        <Select value={ticket.currency} onValueChange={(v) => updateTicket(ticket.id, 'currency', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-red-100 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-lg text-red-800">ລວມຄ່າປີ້ລົດໄຟນີ້:</span>
                                    <div className="text-right font-bold text-lg text-red-800">
                                       {formatNumber(ticketTotals[ticket.id], ticket.currency)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {tickets.length > 0 && (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຄ່າປີ້ລົດໄຟທັງໝົດ</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-4">
                             {(Object.keys(grandTotal) as Currency[]).filter(c => grandTotal[c] > 0).map(c => (
                                <div key={c} className="p-4 bg-primary/10 rounded-lg">
                                    <p className="text-sm text-primary/80">ລວມ ({c})</p>
                                    <p className="text-2xl font-bold text-primary">{formatNumber(grandTotal[c], c as Currency)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
