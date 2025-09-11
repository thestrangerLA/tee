
"use client"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BedDouble, Calendar as CalendarIcon, Copy, Trash2, PlusCircle } from "lucide-react";
import { format } from 'date-fns';

type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

type Room = {
    id: string;
    type: string;
    numRooms: number;
    numNights: number;
    price: number;
    currency: Currency;
};

type Accommodation = {
    id: string;
    name: string;
    type: 'hotel' | 'guesthouse';
    checkInDate?: Date;
    rooms: Room[];
};

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

const LOCAL_STORAGE_KEY = 'tour-accommodation';

export default function AccommodationPage() {
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [grandTotal, setGrandTotal] = useState<Record<Currency, number>>({ USD: 0, THB: 0, LAK: 0, CNY: 0 });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData, (key, value) => {
                    if (key === 'checkInDate' && typeof value === 'string') {
                        return new Date(value);
                    }
                    return value;
                });
                setAccommodations(parsedData);
            }
        } catch (error) {
            console.error("Failed to load accommodation data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accommodations));
            window.dispatchEvent(new CustomEvent('accommodationsUpdate'));
        } catch (error) {
            console.error("Failed to save accommodation data to localStorage", error);
        }
    }, [accommodations]);
    
    const handleReset = () => {
        if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນທັງໝົດໃນໜ້ານີ້?")) {
            setAccommodations([]);
        }
    };


    const addAccommodation = () => {
        const newAcc: Accommodation = {
            id: uuidv4(),
            name: '',
            type: 'hotel',
            rooms: [{
                id: uuidv4(),
                type: 'เตียงเดี่ยว',
                numRooms: 1,
                numNights: 1,
                price: 0,
                currency: 'USD'
            }]
        };
        setAccommodations(prev => [...prev, newAcc]);
    };

    const updateAccommodation = <K extends keyof Accommodation>(accId: string, field: K, value: Accommodation[K]) => {
        setAccommodations(prev => prev.map(acc => acc.id === accId ? { ...acc, [field]: value } : acc));
    };

    const duplicateAccommodation = (accId: string) => {
        const accToCopy = accommodations.find(acc => acc.id === accId);
        if (accToCopy) {
            const newAcc = { ...accToCopy, id: uuidv4(), rooms: accToCopy.rooms.map(r => ({...r, id: uuidv4()})) };
            setAccommodations(prev => [...prev, newAcc]);
        }
    };
    
    const deleteAccommodation = (accId: string) => {
        setAccommodations(prev => prev.filter(acc => acc.id !== accId));
    };

    const addRoom = (accId: string) => {
        const newRoom: Room = {
            id: uuidv4(),
            type: 'เตียงเดี่ยว',
            numRooms: 1,
            numNights: 1,
            price: 0,
            currency: 'USD'
        };
        setAccommodations(prev => prev.map(acc => acc.id === accId ? { ...acc, rooms: [...acc.rooms, newRoom] } : acc));
    };

    const updateRoom = (accId: string, roomId: string, field: keyof Room, value: any) => {
        setAccommodations(prev => prev.map(acc => {
            if (acc.id === accId) {
                const updatedRooms = acc.rooms.map(room => room.id === roomId ? { ...room, [field]: value } : room);
                return { ...acc, rooms: updatedRooms };
            }
            return acc;
        }));
    };

    const deleteRoom = (accId: string, roomId: string) => {
        setAccommodations(prev => prev.map(acc => {
            if (acc.id === accId) {
                return { ...acc, rooms: acc.rooms.filter(room => room.id !== roomId) };
            }
            return acc;
        }));
    };

    const accommodationTotals = useMemo(() => {
        const totals: Record<string, Record<Currency, number>> = {};
        accommodations.forEach(acc => {
            const accTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
            acc.rooms.forEach(room => {
                const roomTotal = room.numRooms * room.numNights * room.price;
                accTotal[room.currency] += roomTotal;
            });
            totals[acc.id] = accTotal;
        });
        return totals;
    }, [accommodations]);
    
    useMemo(() => {
        const newGrandTotal: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        Object.values(accommodationTotals).forEach(accTotal => {
            (Object.keys(newGrandTotal) as Currency[]).forEach(currency => {
                newGrandTotal[currency] += accTotal[currency];
            });
        });
        setGrandTotal(newGrandTotal);
    }, [accommodationTotals]);


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour/calculator">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <BedDouble className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ຄ່າທີ່ພັກ</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                     <Button variant="destructive" size="sm" onClick={handleReset}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        ລ້າງຂໍ້ມູນ
                    </Button>
                    <Button onClick={addAccommodation}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມຄ່າທີ່ພັກ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-6">
                    {accommodations.map((acc, index) => (
                        <Card key={acc.id}>
                             <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                                <CardTitle className="text-lg">ທີ່ພັກ #{index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => duplicateAccommodation(acc.id)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteAccommodation(acc.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-6">
                               <div className="grid md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <Label htmlFor={`acc-name-${acc.id}`}>ຊື່ທີ່ພັກ</Label>
                                        <Input id={`acc-name-${acc.id}`} placeholder="ຊື່ທີ່ພັກ" value={acc.name} onChange={e => updateAccommodation(acc.id, 'name', e.target.value)} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>ປະເພດທີ່ພັກ</Label>
                                            <RadioGroup value={acc.type} onValueChange={(v) => updateAccommodation(acc.id, 'type', v as 'hotel' | 'guesthouse')} className="flex items-center space-x-4 pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="hotel" id={`hotel-${acc.id}`} />
                                                    <Label htmlFor={`hotel-${acc.id}`}>ໂຮງແຮມ</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="guesthouse" id={`guesthouse-${acc.id}`} />
                                                    <Label htmlFor={`guesthouse-${acc.id}`}>Guest House</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor={`checkin-date-${acc.id}`}>ວັນທີເຊັກອິນ</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {acc.checkInDate ? format(new Date(acc.checkInDate), "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={acc.checkInDate} onSelect={(date) => updateAccommodation(acc.id, 'checkInDate', date)} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                               </div>

                               <Card className="bg-slate-50/50">
                                    <CardHeader className="flex-row items-center justify-between p-4">
                                        <CardTitle className="text-md">ປະເພດຫ້ອງ</CardTitle>
                                        <Button size="sm" variant="outline" onClick={() => addRoom(acc.id)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            ເພີ່ມຫ້ອງ
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 pt-0">
                                        {acc.rooms.map((room, roomIndex) => {
                                            const roomTotal = room.numRooms * room.numNights * room.price;
                                            return (
                                            <div key={room.id} className="p-4 border rounded-lg bg-white relative">
                                                <h4 className="font-semibold mb-4">ຫ້ອງແບບທີ່ {roomIndex + 1}</h4>
                                                {acc.rooms.length > 1 && (
                                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => deleteRoom(acc.id, room.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-400" />
                                                    </Button>
                                                )}
                                                <div className="grid md:grid-cols-3 gap-4">
                                                     <div className="space-y-2">
                                                        <Label>ປະເພດ</Label>
                                                        <Select value={room.type} onValueChange={(v) => updateRoom(acc.id, room.id, 'type', v)}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="เตียงเดี่ยว">ຕຽງດ່ຽວ</SelectItem>
                                                                <SelectItem value="เตียงคู่">ຕຽງຄູ່</SelectItem>
                                                                <SelectItem value="ห้องสวีท">ຫ້ອງສະວີດ</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>ຈຳນວນຫ້ອງ</Label>
                                                        <Input type="number" min="1" value={room.numRooms} onChange={e => updateRoom(acc.id, room.id, 'numRooms', parseInt(e.target.value) || 1)} />
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label>ຈຳນວນຄືນ</Label>
                                                        <Input type="number" min="1" value={room.numNights} onChange={e => updateRoom(acc.id, room.id, 'numNights', parseInt(e.target.value) || 1)} />
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-3 gap-4 mt-4">
                                                    <div className="space-y-2">
                                                        <Label>ລາຄາ/ຫ້ອງ/ຄືນ</Label>
                                                        <Input type="number" min="0" value={room.price} onChange={e => updateRoom(acc.id, room.id, 'price', parseFloat(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>ສະກຸນເງິນ</Label>
                                                        <Select value={room.currency} onValueChange={(v) => updateRoom(acc.id, room.id, 'currency', v)}>
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
                                                            {formatNumber(roomTotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </CardContent>
                               </Card>
                                <div className="mt-4 p-4 bg-purple-100 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-lg text-purple-800">ລວມຄ່າທີ່ພັກນີ້ທັງໝົດ:</span>
                                    <div className="text-right">
                                        {(Object.keys(accommodationTotals[acc.id] || {}) as Currency[]).filter(c => accommodationTotals[acc.id][c] > 0).map(c => (
                                            <p key={c} className="font-bold text-lg text-purple-800">
                                                {formatNumber(accommodationTotals[acc.id][c])} {c}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {accommodations.length > 0 && (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ສະຫຼຸບຄ່າທີ່ພັກທັງໝົດ</CardTitle>
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
