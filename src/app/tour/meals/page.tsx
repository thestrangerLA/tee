
"use client"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UtensilsCrossed, Copy, Trash2, PlusCircle } from "lucide-react";

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

type MealCost = {
    id: string;
    name: string;
    pax: number;
    breakfast: number;
    lunch: number;
    dinner: number;
    pricePerMeal: number;
    currency: Currency;
};

const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('en-US', options).format(num);
};

const LOCAL_STORAGE_KEY = 'tour-meals';

export default function MealsPage() {
    const [mealCosts, setMealCosts] = useState<MealCost[]>([]);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                setMealCosts(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Failed to load meals data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mealCosts));
            window.dispatchEvent(new CustomEvent('mealsUpdate'));
        } catch (error) {
            console.error("Failed to save meals data to localStorage", error);
        }
    }, [mealCosts]);

    const handleReset = () => {
        if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນທັງໝົດໃນໜ້ານີ້?")) {
            setMealCosts([]);
        }
    };


    const addMealCost = () => {
        const newMealCost: MealCost = {
            id: uuidv4(),
            name: '',
            pax: 1,
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            pricePerMeal: 0,
            currency: 'LAK'
        };
        setMealCosts(prev => [...prev, newMealCost]);
    };

    const updateMealCost = (costId: string, field: keyof MealCost, value: any) => {
        setMealCosts(prev => prev.map(cost => cost.id === costId ? { ...cost, [field]: value } : cost));
    };
    
    const duplicateMealCost = (costId: string) => {
        const costToCopy = mealCosts.find(c => c.id === costId);
        if (costToCopy) {
            setMealCosts(prev => [...prev, { ...costToCopy, id: uuidv4() }]);
        }
    };

    const deleteMealCost = (costId: string) => {
        setMealCosts(prev => prev.filter(c => c.id !== costId));
    };

    const mealTotals = useMemo(() => {
        const totals: Record<string, { total: number, perPerson: number }> = {};
        mealCosts.forEach(cost => {
            const totalMeals = cost.breakfast + cost.lunch + cost.dinner;
            const totalCost = totalMeals * cost.pricePerMeal;
            const costPerPerson = cost.pax > 0 ? totalCost / cost.pax : 0;
            totals[cost.id] = { total: totalCost, perPerson: costPerPerson };
        });
        return totals;
    }, [mealCosts]);
    
    const grandTotal = useMemo(() => {
        const newGrandTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        mealCosts.forEach((cost) => {
            const total = (mealTotals[cost.id]?.total || 0);
            newGrandTotal[cost.currency] += total;
        });
        return newGrandTotal;
    }, [mealCosts, mealTotals]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/calculator">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄ່າອາຫານ</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                     <Button variant="destructive" size="sm" onClick={handleReset}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        ລ້າງຂໍ້ມູນ
                    </Button>
                    <Button onClick={addMealCost} className="bg-yellow-600 hover:bg-yellow-700 text-black">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມຄ່າອາຫານ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {mealCosts.map((cost, index) => (
                        <Card key={cost.id}>
                            <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">ຄ່າອາຫານ #{index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => duplicateMealCost(cost.id)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMealCost(cost.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor={`name-${cost.id}`}>ຊື່ມື້ອາຫານ/ຮ້ານອາຫານ</Label>
                                    <Input id={`name-${cost.id}`} placeholder="ເຊັ່ນ: ອາຫານເຢັນທີ່ຮ້ານ..." value={cost.name} onChange={e => updateMealCost(cost.id, 'name', e.target.value)} />
                                </div>
                                
                                <div className="grid md:grid-cols-4 gap-6">
                                     <div className="space-y-2">
                                        <Label htmlFor={`pax-${cost.id}`}>Pax</Label>
                                        <Input id={`pax-${cost.id}`} type="number" min="1" value={cost.pax} onChange={e => updateMealCost(cost.id, 'pax', parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`breakfast-${cost.id}`}>ເຊົ້າ</Label>
                                        <Input id={`breakfast-${cost.id}`} type="number" min="0" value={cost.breakfast} onChange={e => updateMealCost(cost.id, 'breakfast', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`lunch-${cost.id}`}>ກາງວັນ</Label>
                                        <Input id={`lunch-${cost.id}`} type="number" min="0" value={cost.lunch} onChange={e => updateMealCost(cost.id, 'lunch', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`dinner-${cost.id}`}>ເຢັນ</Label>
                                        <Input id={`dinner-${cost.id}`} type="number" min="0" value={cost.dinner} onChange={e => updateMealCost(cost.id, 'dinner', parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor={`pricePerMeal-${cost.id}`}>ລາຄາ/ມື້</Label>
                                        <Input id={`pricePerMeal-${cost.id}`} type="number" min="0" value={cost.pricePerMeal} onChange={e => updateMealCost(cost.id, 'pricePerMeal', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ສະກຸນເງິນ</Label>
                                        <Select value={cost.currency} onValueChange={(v) => updateMealCost(cost.id, 'currency', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>ລວມ</Label>
                                        <div className="h-10 flex items-center px-3 rounded-md border bg-muted">
                                            {formatNumber(mealTotals[cost.id]?.total || 0, { minimumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>ລວມ/ຄົນ</Label>
                                        <div className="h-10 flex items-center px-3 rounded-md border bg-muted">
                                            {`${cost.currency} ${formatNumber(mealTotals[cost.id]?.perPerson || 0)}`}
                                        </div>
                                    </div>
                                </div>


                                <div className="mt-4 p-4 bg-yellow-100 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-lg text-yellow-800">ລວມຄ່າອາຫານນີ້:</span>
                                    <div className="text-right font-bold text-lg text-yellow-800">
                                       {formatNumber(mealTotals[cost.id]?.total || 0)} {cost.currency}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {mealCosts.length > 0 && (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຄ່າອາຫານທັງໝົດ</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-4">
                             {(Object.keys(grandTotal) as Currency[]).filter(c => grandTotal[c] > 0).map(c => (
                                <div key={c} className="p-4 bg-primary/10 rounded-lg">
                                    <p className="text-sm text-primary/80">ລວມ ({c})</p>
                                    <p className="text-2xl font-bold text-primary">{formatNumber(grandTotal[c])} {c}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
