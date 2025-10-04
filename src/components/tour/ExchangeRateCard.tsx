
"use client"
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export const ExchangeRateCard = ({ grandTotals }: { grandTotals: Record<Currency, number> }) => {
    const [exchangeRates, setExchangeRates] = useState({ USD: 21000, THB: 600, CNY: 3000 });

    const totalInLAK = useMemo(() => {
        return (
            grandTotals.LAK +
            (grandTotals.USD * (exchangeRates.USD || 0)) +
            (grandTotals.THB * (exchangeRates.THB || 0)) +
            (grandTotals.CNY * (exchangeRates.CNY || 0))
        );
    }, [grandTotals, exchangeRates]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>ຄິດໄລ່ເປັນເງິນກີບ (LAK)</CardTitle>
                <CardDescription>ປ້ອນອັດຕາແລກປ່ຽນເພື່ອຄິດໄລ່ຕົ້ນທຶນລວມເປັນເງິນກີບ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rate-usd">USD to LAK</Label>
                        <Input id="rate-usd" type="number" value={exchangeRates.USD} onChange={e => setExchangeRates(prev => ({...prev, USD: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate-thb">THB to LAK</Label>
                        <Input id="rate-thb" type="number" value={exchangeRates.THB} onChange={e => setExchangeRates(prev => ({...prev, THB: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate-cny">CNY to LAK</Label>
                        <Input id="rate-cny" type="number" value={exchangeRates.CNY} onChange={e => setExchangeRates(prev => ({...prev, CNY: Number(e.target.value)}))} />
                    </div>
                </div>
                 <Card className="bg-muted">
                    <CardHeader>
                        <CardTitle className="text-center">ຕົ້ນທຶນລວມທັງໝົດ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">{formatNumber(totalInLAK)} ₭</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}

    