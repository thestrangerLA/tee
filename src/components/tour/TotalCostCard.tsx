

"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator } from 'lucide-react';

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$',
    THB: '฿',
    LAK: '₭',
    CNY: '¥',
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

const costCategories = [
    'tour-accommodations', 'tour-trips', 'tour-flights', 'tour-trainTickets',
    'tour-entrance-fees', 'tour-meals', 'tour-guides', 'tour-documents'
];

export function TotalCostCard() {
    const [totalCosts, setTotalCosts] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    useEffect(() => {
        const calculateTotal = () => {
            let totals: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
            
            costCategories.forEach(category => {
                try {
                    const storedData = localStorage.getItem(category);
                    if (storedData) {
                        const items = JSON.parse(storedData);
                        items.forEach((item: any) => {
                            let itemCurrency: Currency | undefined;
                            let itemTotal = 0;

                            if (category === 'tour-accommodations' && item.rooms) {
                                 item.rooms.forEach((room: any) => {
                                    const roomTotal = (room.numRooms || 0) * (room.numNights || 0) * (room.price || 0);
                                    if (room.currency && totals.hasOwnProperty(room.currency)) {
                                        totals[room.currency as Currency] += roomTotal;
                                    }
                                });
                                return; // Continue to next item
                            } else if (category === 'tour-trips' && item.numVehicles) {
                                itemTotal = (item.numVehicles || 0) * (item.numDays || 0) * (item.pricePerVehicle || 0);
                                itemCurrency = item.currency;
                            } else if (category === 'tour-flights' && item.pricePerPerson) {
                                itemTotal = (item.pricePerPerson || 0) * (item.numPeople || 0);
                                itemCurrency = item.currency;
                            } else if (category === 'tour-train-tickets' && item.pricePerTicket) {
                                itemTotal = (item.pricePerTicket || 0) * (item.numTickets || 0);
                                itemCurrency = item.currency;
                            } else if (category === 'tour-entrance-fees' && item.price) {
                                itemTotal = (item.pax || 0) * (item.numLocations || 0) * (item.price || 0);
                                itemCurrency = item.currency;
                            } else if (category === 'tour-meals' && item.pricePerMeal) {
                                itemTotal = ((item.breakfast || 0) + (item.lunch || 0) + (item.dinner || 0)) * (item.pricePerMeal || 0);
                                itemCurrency = item.currency;
                            } else if (category === 'tour-guides' && item.pricePerDay) {
                                itemTotal = (item.numGuides || 0) * (item.numDays || 0) * (item.pricePerDay || 0);
                                itemCurrency = item.currency;
                            } else if (category === 'tour-documents' && item.price) {
                                itemTotal = (item.pax || 0) * (item.price || 0);
                                itemCurrency = item.currency;
                            }

                            if (itemCurrency && totals.hasOwnProperty(itemCurrency)) {
                                totals[itemCurrency] += itemTotal;
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

        const handleStorageChange = (e: StorageEvent | CustomEvent) => {
            if ('key' in e && e.key && !costCategories.includes(e.key)) return;
            calculateTotal();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        costCategories.forEach(category => {
            const eventName = category.replace('tour-', '') + 'Update';
            window.addEventListener(eventName, handleStorageChange);
        });


        return () => {
            window.removeEventListener('storage', handleStorageChange);
            costCategories.forEach(category => {
                const eventName = category.replace('tour-', '') + 'Update';
                window.removeEventListener(eventName, handleStorageChange);
            });
        };

    }, []);
    
    return (
        <Card className="w-full max-w-7xl mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calculator className="h-6 w-6" />
                    <CardTitle className="text-xl">ຄ່າໃຊ້ຈ່າຍລວມທັງໝົດ</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-sm opacity-80">ກີບ (LAK)</p>
                        <p className="text-2xl font-semibold">{currencySymbols.LAK}{formatNumber(totalCosts.LAK)}</p>
                    </div>
                     <div>
                        <p className="text-sm opacity-80">ບາດ (THB)</p>
                        <p className="text-2xl font-semibold">{currencySymbols.THB}{formatNumber(totalCosts.THB)}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-80">ດອນລ້າ (USD)</p>
                        <p className="text-2xl font-semibold">{currencySymbols.USD}{formatNumber(totalCosts.USD)}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-80">ຢວນ (CNY)</p>
                        <p className="text-2xl font-semibold">{currencySymbols.CNY}{formatNumber(totalCosts.CNY)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
