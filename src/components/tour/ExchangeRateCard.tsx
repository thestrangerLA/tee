
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from 'lucide-react';

export type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';
export type ExchangeRates = {
  [K in Currency]?: { [T in Currency]?: number };
};

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລár)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', options).format(num);

interface ExchangeRateCardProps {
    grandTotals: Record<Currency, number>;
    rates: ExchangeRates;
    onRatesChange: (rates: ExchangeRates) => void;
    profitPercentage: number;
    onProfitPercentageChange: (percentage: number) => void;
}

export function ExchangeRateCard({ grandTotals, rates, onRatesChange, profitPercentage, onProfitPercentageChange }: ExchangeRateCardProps) {
    const [targetCurrency, setTargetCurrency] = useState<Currency>('LAK');

    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);


    const handleRateChange = (from: Currency, to: Currency, value: string) => {
        const numericValue = parseFloat(value) || 0;
        
        onRatesChange({
            ...rates,
            [from]: { ...rates[from], [to]: numericValue },
        });
    };
    
    const convertedTotal = useMemo(() => {
        return (Object.keys(grandTotals) as Currency[]).reduce((acc, currency) => {
            const amount = grandTotals[currency];
            if (currency === targetCurrency) {
                return acc + amount;
            }
            // Find a path, for simplicity, we assume direct conversion or via USD
            const rate = rates[currency]?.[targetCurrency];
            if (rate) {
                return acc + (amount * rate);
            }
             // Fallback via USD if direct rate is missing
            const rateToUsd = rates[currency]?.USD;
            const rateFromUsd = rates['USD']?.[targetCurrency];
            if (rateToUsd && rateFromUsd) {
                return acc + (amount * rateToUsd * rateFromUsd);
            }
            return acc; // Return accumulator if no conversion path found
        }, 0);

    }, [grandTotals, rates, targetCurrency]);

    const finalSalePrice = useMemo(() => {
        return convertedTotal * (1 + profitPercentage / 100);
    }, [convertedTotal, profitPercentage]);

    const profit = useMemo(() => {
        return finalSalePrice - convertedTotal;
    }, [finalSalePrice, convertedTotal]);
    
    if (!isClient) {
        return null;
    }

    return (
        <>
            <div className="print:hidden">
                <Card>
                    <CardHeader>
                        <CardTitle>ອັດຕາແລກປ່ຽນ</CardTitle>
                        <CardDescription>ສະຫຼຸບລວມຍອດຄ່າໃຊ້ຈ່າຍທັງໝົດ ແລະ ໃສ່ອັດຕາແລກປ່ຽນ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div>
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded-md">
                                    <Label className="md:col-span-3 font-semibold">1 USD =</Label>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.USD?.THB?.toFixed(4) || ''} onChange={e => handleRateChange('USD', 'THB', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">THB</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.USD?.LAK?.toFixed(0) || ''} onChange={e => handleRateChange('USD', 'LAK', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">LAK</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.USD?.CNY?.toFixed(4) || ''} onChange={e => handleRateChange('USD', 'CNY', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">CNY</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded-md">
                                    <Label className="md:col-span-3 font-semibold">1 THB =</Label>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.THB?.USD?.toFixed(4) || ''} onChange={e => handleRateChange('THB', 'USD', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">USD</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.THB?.LAK?.toFixed(0) || ''} onChange={e => handleRateChange('THB', 'LAK', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">LAK</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.THB?.CNY?.toFixed(4) || ''} onChange={e => handleRateChange('THB', 'CNY', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">CNY</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded-md">
                                    <Label className="md:col-span-3 font-semibold">1 CNY =</Label>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.CNY?.USD?.toFixed(4) || ''} onChange={e => handleRateChange('CNY', 'USD', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">USD</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.CNY?.THB?.toFixed(4) || ''} onChange={e => handleRateChange('CNY', 'THB', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">THB</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.CNY?.LAK?.toFixed(0) || ''} onChange={e => handleRateChange('CNY', 'LAK', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">LAK</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded-md">
                                    <Label className="md:col-span-3 font-semibold">1 LAK =</Label>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.LAK?.USD?.toFixed(6) || ''} onChange={e => handleRateChange('LAK', 'USD', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">USD</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.LAK?.THB?.toFixed(6) || ''} onChange={e => handleRateChange('LAK', 'THB', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">THB</Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" value={rates.LAK?.CNY?.toFixed(6) || ''} onChange={e => handleRateChange('LAK', 'CNY', e.target.value)} className="h-8"/>
                                        <Label className="text-xs">CNY</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Converted Total Section */}
                        <Card className="border-dashed border-2">
                            <CardContent className="p-4 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <Label htmlFor="target-currency">ເລືອກສະກຸນເງິນທີ່ຕ້ອງການຂາຍ</Label>
                                        <Select value={targetCurrency} onValueChange={(v: Currency) => setTargetCurrency(v)}>
                                            <SelectTrigger id="target-currency">
                                                <SelectValue placeholder="ເລືອກສະກຸນເງິນ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="whitespace-nowrap">ກຳໄລ %</Label>
                                        <Input 
                                            type="number" 
                                            value={profitPercentage}
                                            onChange={e => onProfitPercentageChange(parseFloat(e.target.value) || 0)}
                                            className="w-[100px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>

            {/* Sale Price Calculation */}
            <div className="grid md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-2 print:pt-2">
                <Card>
                    <CardHeader className="print:p-2">
                        <CardTitle className="text-lg print:text-sm">ຍອດລວມທີ່ແປງແລ້ວ</CardTitle>
                        <CardDescription className="text-xs print:hidden">ຍອດລວມທັງໝົດໃນສະກຸນເງິນດຽວ</CardDescription>
                    </CardHeader>
                    <CardContent className="print:p-2">
                        <div className="text-xl print:text-base font-bold text-primary p-4 print:p-2 border bg-muted rounded-md text-center">
                            <p className="text-sm print:text-xs font-medium text-muted-foreground">ຍອດລວມ</p>
                            <span>{formatNumber(convertedTotal)}</span>
                            <span className="text-sm print:text-xs font-medium text-muted-foreground ml-2">{targetCurrency}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="print:p-2">
                        <CardTitle className="text-lg print:text-sm">ລາຄາຂາຍ</CardTitle>
                        <CardDescription className="text-xs print:hidden">ຄຳນວນລາຄາຂາຍໂດຍອີງໃສ່ເປີເຊັນທີ່ເພີ່ມຂຶ້ນ</CardDescription>
                    </CardHeader>
                    <CardContent className="print:p-2">
                        <div className="text-xl print:text-base font-bold text-green-600 p-4 print:p-2 border bg-green-50 rounded-md text-center">
                            <p className="text-sm print:text-xs font-medium text-muted-foreground">ລາຄາຂາຍສຸດທິ</p>
                            <span>{formatNumber(finalSalePrice)}</span>
                            <span className="text-sm print:text-xs font-medium text-muted-foreground ml-2">{targetCurrency}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="print:p-2">
                        <CardTitle className="flex items-center gap-2 text-lg print:text-sm"><LineChart className="h-5 w-5 print:hidden"/>ກຳໄລ</CardTitle>
                        <CardDescription className="text-xs print:hidden">ກຳໄລຈາກເປີເຊັນທີ່ເພີ່ມຂຶ້ນ</CardDescription>
                    </CardHeader>
                    <CardContent className="print:p-2">
                        <div className="text-xl print:text-base font-bold text-blue-600 p-4 print:p-2 border bg-blue-50 rounded-md text-center">
                            <p className="text-sm print:text-xs font-medium text-muted-foreground">ກຳໄລ</p>
                            <span>{formatNumber(profit)}</span>
                            <span className="text-sm print:text-xs font-medium text-muted-foreground ml-2">{targetCurrency}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
