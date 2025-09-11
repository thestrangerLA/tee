
"use client"

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, Copy, Trash2, PlusCircle } from "lucide-react";

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

type EntranceFee = {
    id: string;
    locationName: string;
    pax: number;
    numLocations: number;
    price: number;
    currency: Currency;
};

const formatNumber = (num: number, currency: Currency) => {
    const symbols: Record<Currency, string> = { USD: '$', THB: '฿', LAK: '₭', CNY: '¥' };
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(num)} ${symbols[currency]}`;
};

export default function EntranceFeesPage() {
    const [fees, setFees] = useState<EntranceFee[]>([]);
    const [grandTotal, setGrandTotal] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    const addFee = () => {
        const newFee: EntranceFee = {
            id: uuidv4(),
            locationName: '',
            pax: 1,
            numLocations: 1,
            price: 0,
            currency: 'LAK'
        };
        setFees(prev => [...prev, newFee]);
    };

    const updateFee = (feeId: string, field: keyof EntranceFee, value: any) => {
        setFees(prev => prev.map(fee => fee.id === feeId ? { ...fee, [field]: value } : fee));
    };
    
    const duplicateFee = (feeId: string) => {
        const feeToCopy = fees.find(f => f.id === feeId);
        if (feeToCopy) {
            setFees(prev => [...prev, { ...feeToCopy, id: uuidv4() }]);
        }
    };

    const deleteFee = (feeId: string) => {
        setFees(prev => prev.filter(f => f.id !== feeId));
    };

    const feeTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        fees.forEach(fee => {
            totals[fee.id] = fee.pax * fee.numLocations * fee.price;
        });
        return totals;
    }, [fees]);
    
    useMemo(() => {
        const newGrandTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        fees.forEach((fee) => {
            const feeTotal = fee.pax * fee.numLocations * fee.price;
            newGrandTotal[fee.currency] += feeTotal;
        });
        setGrandTotal(newGrandTotal);
    }, [fees]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/calculator">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Camera className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄ່າເຂົ້າຊົມສະຖານທີ່</h1>
                </div>
                <div className="ml-auto">
                    <Button onClick={addFee} className="bg-pink-600 hover:bg-pink-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມຄ່າເຂົ້າຊົມ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {fees.map((fee, index) => (
                        <Card key={fee.id}>
                            <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">ສະຖານທີ່ #{index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => duplicateFee(fee.id)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteFee(fee.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor={`locationName-${fee.id}`}>ຊື່ສະຖານທີ່</Label>
                                    <Input id={`locationName-${fee.id}`} placeholder="ຊື່ສະຖານທີ່" value={fee.locationName} onChange={e => updateFee(fee.id, 'locationName', e.target.value)} />
                                </div>
                                
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor={`pax-${fee.id}`}>Pax</Label>
                                        <Input id={`pax-${fee.id}`} type="number" min="1" value={fee.pax} onChange={e => updateFee(fee.id, 'pax', parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`numLocations-${fee.id}`}>ຈຳນວນສະຖານທີ່</Label>
                                        <Input id={`numLocations-${fee.id}`} type="number" min="1" value={fee.numLocations} onChange={e => updateFee(fee.id, 'numLocations', parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`price-${fee.id}`}>ລາຄາ</Label>
                                        <Input id={`price-${fee.id}`} type="number" min="0" value={fee.price} onChange={e => updateFee(fee.id, 'price', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ສະກຸນເງິນ</Label>
                                        <Select value={fee.currency} onValueChange={(v) => updateFee(fee.id, 'currency', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-pink-100 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-lg text-pink-800">ລວມຄ່າເຂົ້າຊົມນີ້:</span>
                                    <div className="text-right font-bold text-lg text-pink-800">
                                       {formatNumber(feeTotals[fee.id], fee.currency)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {fees.length > 0 && (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຄ່າເຂົ້າຊົມທັງໝົດ</CardTitle>
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
