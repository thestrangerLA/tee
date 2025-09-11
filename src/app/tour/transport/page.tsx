
"use client"

import { useState, useMemo } from 'react';
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
    USD: '$ (ดอลลาร์)',
    THB: '฿ (บาท)',
    LAK: '₭ (กีบ)',
    CNY: '¥ (หยวน)',
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

export default function TransportPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [grandTotal, setGrandTotal] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    const addTrip = () => {
        const newTrip: Trip = {
            id: uuidv4(),
            location: '',
            route: '',
            vehicleType: 'รถตู้ทำมะดา',
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
                    <h1 className="text-xl font-bold tracking-tight">ค่าขนส่ง</h1>
                </div>
                <div className="ml-auto">
                    <Button onClick={addTrip} className="bg-green-600 hover:bg-green-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        เพิ่มค่าขนส่ง
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {trips.map((trip, index) => (
                        <Card key={trip.id}>
                             <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">การเดินทาง #{index + 1}</CardTitle>
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
                                        <Label htmlFor={`location-${trip.id}`}>สถานที่เดินทาง</Label>
                                        <Input id={`location-${trip.id}`} placeholder="สถานที่เดินทาง" value={trip.location} onChange={e => updateTrip(trip.id, 'location', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`route-${trip.id}`}>เส้นทาง</Label>
                                        <Input id={`route-${trip.id}`} placeholder="เช่น เวียงจันทน์ - วังเวียง" value={trip.route} onChange={e => updateTrip(trip.id, 'route', e.target.value)} />
                                    </div>
                               </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`vehicle-type-${trip.id}`}>ประเภทรถ</Label>
                                    <Input id={`vehicle-type-${trip.id}`} placeholder="รถตู้ทำมะดา" value={trip.vehicleType} onChange={e => updateTrip(trip.id, 'vehicleType', e.target.value)} />
                                </div>
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`num-vehicles-${trip.id}`}>จำนวนคัน</Label>
                                        <Input id={`num-vehicles-${trip.id}`} type="number" min="1" value={trip.numVehicles} onChange={e => updateTrip(trip.id, 'numVehicles', parseInt(e.target.value) || 1)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`num-days-${trip.id}`}>จำนวนวัน</Label>
                                        <Input id={`num-days-${trip.id}`} type="number" min="1" value={trip.numDays} onChange={e => updateTrip(trip.id, 'numDays', parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`price-${trip.id}`}>ราคา/คัน</Label>
                                        <Input id={`price-${trip.id}`} type="number" min="0" value={trip.pricePerVehicle} onChange={e => updateTrip(trip.id, 'pricePerVehicle', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>สกุลเงิน</Label>
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
                                    <span className="font-bold text-lg text-green-800">รวมค่าขนส่งนี้:</span>
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
                            <CardTitle>สรุปค่าขนส่งทั้งหมด</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-4">
                             {(Object.keys(grandTotal) as Currency[]).filter(c => grandTotal[c] > 0).map(c => (
                                <div key={c} className="p-4 bg-primary/10 rounded-lg">
                                    <p className="text-sm text-primary/80">รวม ({c})</p>
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
    