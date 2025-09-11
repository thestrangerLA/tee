
"use client"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, Copy, Trash2, PlusCircle } from "lucide-react";

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

type Trip = {
    id: string;
    location: string;
    route: string;
    vehicleType: string;
    numVehicles: number;
    numDays: number;
    pricePerVehicle: number;
    currency: Currency;
};

const formatNumber = (num: number, currency: Currency) => {
    const symbols: Record<Currency, string> = { USD: '$', THB: '฿', LAK: '₭', CNY: '¥' };
    return `${symbols[currency]}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
};

const LOCAL_STORAGE_KEY = 'tour-trips';

export default function TransportPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [grandTotal, setGrandTotal] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                setTrips(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Failed to load transport data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
            window.dispatchEvent(new CustomEvent('tripsUpdate'));
        } catch (error) {
            console.error("Failed to save transport data to localStorage", error);
        }
    }, [trips]);
    
    const handleReset = () => {
        if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນທັງໝົດໃນໜ້ານີ້?")) {
            setTrips([]);
        }
    };

    const addTrip = () => {
        const newTrip: Trip = {
            id: uuidv4(),
            location: '',
            route: '',
            vehicleType: 'ລົດຕູ້ທຳມະດາ',
            numVehicles: 1,
            numDays: 1,
            pricePerVehicle: 0,
            currency: 'USD'
        };
        setTrips(prev => [...prev, newTrip]);
    };
    
    const updateTrip = (tripId: string, field: keyof Trip, value: any) => {
        setTrips(prev => prev.map(trip => trip.id === tripId ? { ...trip, [field]: value } : trip));
    };

    const duplicateTrip = (tripId: string) => {
        const tripToCopy = trips.find(trip => trip.id === tripId);
        if (tripToCopy) {
            setTrips(prev => [...prev, { ...tripToCopy, id: uuidv4() }]);
        }
    };
    
    const deleteTrip = (tripId: string) => {
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
    };
    
    const tripTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        trips.forEach(trip => {
            totals[trip.id] = trip.numVehicles * trip.numDays * trip.pricePerVehicle;
        });
        return totals;
    }, [trips]);
    
    useMemo(() => {
        const newGrandTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        trips.forEach((trip, index) => {
            const tripTotal = trip.numVehicles * trip.numDays * trip.pricePerVehicle;
            newGrandTotal[trip.currency] += tripTotal;
        });
        setGrandTotal(newGrandTotal);
    }, [trips]);


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/calculator">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄ່າຂົນສົ່ງ</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                     <Button variant="destructive" size="sm" onClick={handleReset}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        ລ້າງຂໍ້ມູນ
                    </Button>
                    <Button onClick={addTrip} className="bg-green-600 hover:bg-green-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມຄ່າຂົນສົ່ງ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {trips.map((trip, index) => (
                        <Card key={trip.id}>
                             <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">ການເດີນທາງ #{index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => duplicateTrip(trip.id)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTrip(trip.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-6">
                               <div className="grid md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <Label htmlFor={`location-${trip.id}`}>ສະຖານທີ່ເດີນທາງ</Label>
                                        <Input id={`location-${trip.id}`} placeholder="ສະຖານທີ່ເດີນທາງ" value={trip.location} onChange={e => updateTrip(trip.id, 'location', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`route-${trip.id}`}>ເສັ້ນທາງ</Label>
                                        <Input id={`route-${trip.id}`} placeholder="ຕົວຢ່າງ ວຽງຈັນ - ວັງວຽງ" value={trip.route} onChange={e => updateTrip(trip.id, 'route', e.target.value)} />
                                    </div>
                               </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`vehicle-type-${trip.id}`}>ປະເພດລົດ</Label>
                                    <Input id={`vehicle-type-${trip.id}`} placeholder="ລົດຕູ້ທຳມະດາ" value={trip.vehicleType} onChange={e => updateTrip(trip.id, 'vehicleType', e.target.value)} />
                                </div>
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`num-vehicles-${trip.id}`}>ຈຳນວນຄັນ</Label>
                                        <Input id={`num-vehicles-${trip.id}`} type="number" min="1" value={trip.numVehicles} onChange={e => updateTrip(trip.id, 'numVehicles', parseInt(e.target.value) || 1)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`num-days-${trip.id}`}>ຈຳນວນວັນ</Label>
                                        <Input id={`num-days-${trip.id}`} type="number" min="1" value={trip.numDays} onChange={e => updateTrip(trip.id, 'numDays', parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`price-${trip.id}`}>ລາຄາ/ຄັນ</Label>
                                        <Input id={`price-${trip.id}`} type="number" min="0" value={trip.pricePerVehicle} onChange={e => updateTrip(trip.id, 'pricePerVehicle', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ສະກຸນເງິນ</Label>
                                        <Select value={trip.currency} onValueChange={(v) => updateTrip(trip.id, 'currency', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-green-100 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-lg text-green-800">ລວມຄ່າຂົນສົ່ງນີ້:</span>
                                    <div className="text-right font-bold text-lg text-green-800">
                                       {formatNumber(tripTotals[trip.id], trip.currency)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {trips.length > 0 && (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຄ່າຂົນສົ່ງທັງໝົດ</CardTitle>
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
