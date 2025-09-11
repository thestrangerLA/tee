
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator } from 'lucide-react';

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';
const allCurrencies: Currency[] = ['USD', 'THB', 'LAK', 'CNY'];

const currencySymbols: Record<Currency, string> = {
    USD: '$',
    THB: '฿',
    LAK: '₭',
    CNY: '¥',
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const costCategories = [
    'accommodations', 'trips', 'flights', 'trainTickets',
    'entranceFees', 'meals', 'guides', 'documents'
];

export function TotalCostCard() {
    const [totalCosts, setTotalCosts] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });
    const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({
        USD: 1,
        THB: 36.5,
        LAK: 21700,
        CNY: 7.25,
    });

    useEffect(() => {
        const calculateTotal = () => {
            let totals: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
            
            costCategories.forEach(category => {
                try {
                    const storedData = localStorage.getItem(category);
                    if (storedData) {
                        const items = JSON.parse(storedData);
                        items.forEach((item: any) => {
                            const currency = item.currency as Currency;
                            let itemTotal = 0;
                            if (category === 'accommodations' && item.rooms) {
                                itemTotal = item.rooms.reduce((acc: number, room: any) => acc + (room.numRooms * room.numNights * room.price), 0);
                            } else if (category === 'trips' && item.numVehicles) {
                                itemTotal = item.numVehicles * item.numDays * item.pricePerVehicle;
                            } else if (category === 'flights' && item.pricePerPerson) {
                                itemTotal = item.pricePerPerson * item.numPeople;
                            } else if (category === 'trainTickets' && item.pricePerTicket) {
                                itemTotal = item.pricePerTicket * item.numTickets;
                            } else if (category === 'entranceFees' && item.price) {
                                itemTotal = item.pax * item.numLocations * item.price;
                            } else if (category === 'meals' && item.pricePerMeal) {
                                itemTotal = (item.breakfast + item.lunch + item.dinner) * item.pricePerMeal;
                            } else if (category === 'guides' && item.pricePerDay) {
                                itemTotal = item.numGuides * item.numDays * item.pricePerDay;
                            } else if (category === 'documents' && item.price) {
                                itemTotal = item.pax * item.price;
                            }

                            if (currency && totals.hasOwnProperty(currency)) {
                                totals[currency] += itemTotal;
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error processing category ${category}:`, error);
                }
            });

            setTotalCosts(totals);
        };

        calculateTotal();

        const handleStorageChange = () => {
            calculateTotal();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        costCategories.forEach(category => {
             window.addEventListener(`${category}Update`, handleStorageChange);
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            costCategories.forEach(category => {
                window.removeEventListener(`${category}Update`, handleStorageChange);
            });
        };

    }, []);

    const totalInDisplayCurrency = useMemo(() => {
        return Object.entries(totalCosts).reduce((sum, [currency, amount]) => {
            const amountInUsd = amount / exchangeRates[currency as Currency];
            return sum + (amountInUsd * exchangeRates[displayCurrency]);
        }, 0);
    }, [totalCosts, displayCurrency, exchangeRates]);
    
    return (
        <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calculator className="h-6 w-6" />
                    <CardTitle className="text-xl">ຄ່າໃຊ້ຈ່າຍລວມທັງໝົດ</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">ສະແດງຜົນເປັນ:</span>
                    <Select value={displayCurrency} onValueChange={(v) => setDisplayCurrency(v as Currency)}>
                        <SelectTrigger className="w-[100px] bg-white/20 border-white/30 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {allCurrencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="text-center p-6">
                <div className="text-6xl font-bold tracking-tighter">
                    {currencySymbols[displayCurrency]}{formatNumber(totalInDisplayCurrency)}
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                    <div>
                        <p className="text-sm opacity-80">ກີບ (LAK)</p>
                        <p className="text-lg font-semibold">{currencySymbols.LAK}{formatNumber(totalCosts.LAK)}</p>
                    </div>
                     <div>
                        <p className="text-sm opacity-80">ບາດ (THB)</p>
                        <p className="text-lg font-semibold">{currencySymbols.THB}{formatNumber(totalCosts.THB)}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-80">ดอลลาร์ (USD)</p>
                        <p className="text-lg font-semibold">{currencySymbols.USD}{formatNumber(totalCosts.USD)}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-80">หยวน (CNY)</p>
                        <p className="text-lg font-semibold">{currencySymbols.CNY}{formatNumber(totalCosts.CNY)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
    