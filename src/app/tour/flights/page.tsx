
"use client"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Plane, Copy, Trash2, PlusCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from 'date-fns';

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

type Flight = {
    id: string;
    from: string;
    to: string;
    departureDate?: Date;
    departureTime: string;
    pricePerPerson: number;
    numPeople: number;
    currency: Currency;
};

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

const LOCAL_STORAGE_KEY = 'tour-flights';

export default function FlightsPage() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [grandTotal, setGrandTotal] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                 const parsedData = JSON.parse(savedData, (key, value) => {
                    if (key === 'departureDate' && typeof value === 'string') {
                        return new Date(value);
                    }
                    return value;
                });
                setFlights(parsedData);
            }
        } catch (error) {
            console.error("Failed to load flight data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flights));
            window.dispatchEvent(new CustomEvent('flightsUpdate'));
        } catch (error) {
            console.error("Failed to save flight data to localStorage", error);
        }
    }, [flights]);

    const handleReset = () => {
        if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນທັງໝົດໃນໜ້ານີ້?")) {
            setFlights([]);
        }
    };


    const addFlight = () => {
        const newFlight: Flight = {
            id: uuidv4(),
            from: '',
            to: '',
            departureTime: '08:00',
            pricePerPerson: 0,
            numPeople: 1,
            currency: 'USD'
        };
        setFlights(prev => [...prev, newFlight]);
    };

    const updateFlight = (flightId: string, field: keyof Flight, value: any) => {
        setFlights(prev => prev.map(flight => flight.id === flightId ? { ...flight, [field]: value } : flight));
    };
    
    const duplicateFlight = (flightId: string) => {
        const flightToCopy = flights.find(f => f.id === flightId);
        if (flightToCopy) {
            setFlights(prev => [...prev, { ...flightToCopy, id: uuidv4() }]);
        }
    };

    const deleteFlight = (flightId: string) => {
        setFlights(prev => prev.filter(f => f.id !== flightId));
    };

    const flightTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        flights.forEach(flight => {
            totals[flight.id] = flight.pricePerPerson * flight.numPeople;
        });
        return totals;
    }, [flights]);
    
    useMemo(() => {
        const newGrandTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        flights.forEach((flight) => {
            const flightTotal = flight.pricePerPerson * flight.numPeople;
            newGrandTotal[flight.currency] += flightTotal;
        });
        setGrandTotal(newGrandTotal);
    }, [flights]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/calculator">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Plane className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄ່າປີ້ຍົນ</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={handleReset}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        ລ້າງຂໍ້ມູນ
                    </Button>
                    <Button onClick={addFlight} className="bg-orange-600 hover:bg-orange-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມຄ່າປີ້ຍົນ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {flights.map((flight, index) => (
                        <Card key={flight.id}>
                            <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">ປີ້ຍົນ #{index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => duplicateFlight(flight.id)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteFlight(flight.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>ເສັ້ນທາງ</Label>
                                        <div className="flex items-center gap-2">
                                            <Input placeholder="ຈາກ" value={flight.from} onChange={e => updateFlight(flight.id, 'from', e.target.value)} />
                                            <span>ໄປ</span>
                                            <Input placeholder="ໄປ" value={flight.to} onChange={e => updateFlight(flight.id, 'to', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ວັນ-ເວລາເດີນທາງ</Label>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className="w-[180px] justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {flight.departureDate ? format(new Date(flight.departureDate), "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={flight.departureDate} onSelect={(date) => updateFlight(flight.id, 'departureDate', date)} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="time" value={flight.departureTime} onChange={e => updateFlight(flight.id, 'departureTime', e.target.value)} className="pl-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor={`price-${flight.id}`}>ລາຄາ/ຄົນ</Label>
                                        <Input id={`price-${flight.id}`} type="number" min="0" value={flight.pricePerPerson} onChange={e => updateFlight(flight.id, 'pricePerPerson', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`people-${flight.id}`}>ຈຳນວນຄົນ</Label>
                                        <Input id={`people-${flight.id}`} type="number" min="1" value={flight.numPeople} onChange={e => updateFlight(flight.id, 'numPeople', parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ສະກຸນເງິນ</Label>
                                        <Select value={flight.currency} onValueChange={(v) => updateFlight(flight.id, 'currency', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-orange-100 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-lg text-orange-800">ລວມຄ່າປີ້ຍົນນີ້:</span>
                                    <div className="text-right font-bold text-lg text-orange-800">
                                       {formatNumber(flightTotals[flight.id])} {flight.currency}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {flights.length > 0 && (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຄ່າປີ້ຍົນທັງໝົດ</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-4">
                             {(Object.keys(grandTotal) as Currency[]).filter(c => grandTotal[c] > 0).map(c => (
                                <div key={c} className="p-4 bg-primary/10 rounded-lg">
                                    <p className="text-sm text-primary/80">ລວມ ({c})</p>
                                    <p className="text-2xl font-bold text-primary">{formatNumber(grandTotal[c])}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
