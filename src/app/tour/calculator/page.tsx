

"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Save, Download, MapPin, Calendar as CalendarIcon, BedDouble, Truck, Plane, TrainFront, PlusCircle, Camera, UtensilsCrossed, Users, FileText, Trash2, Copy, Clock } from "lucide-react";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { TotalCostCard } from '@/components/tour/TotalCostCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Types
type Currency = 'USD' | 'THB' | 'LAK' | 'CNY';

const currencySymbols: Record<Currency, string> = {
    USD: '$ (ດอลລาร์)',
    THB: '฿ (ບາດ)',
    LAK: '₭ (ກີບ)',
    CNY: '¥ (ຢວນ)',
};

const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', options).format(num);

// --- Accommodation Types ---
type Room = { id: string; type: string; numRooms: number; numNights: number; price: number; currency: Currency; };
type Accommodation = { id: string; name: string; type: 'hotel' | 'guesthouse'; checkInDate?: Date; rooms: Room[]; };

// --- Transport Types ---
type Trip = { id: string; location: string; route: string; vehicleType: string; numVehicles: number; numDays: number; pricePerVehicle: number; currency: Currency; };

// --- Flight Types ---
type Flight = { id: string; from: string; to: string; departureDate?: Date; departureTime: string; pricePerPerson: number; numPeople: number; currency: Currency; };

// --- Train Types ---
type TrainTicket = { id: string; from: string; to: string; departureDate?: Date; departureTime: string; ticketClass: string; numTickets: number; pricePerTicket: number; currency: Currency; };

// --- Entrance Fee Types ---
type EntranceFee = { id: string; locationName: string; pax: number; numLocations: number; price: number; currency: Currency; };

// --- Meal Types ---
type MealCost = { id: string; name: string; pax: number; breakfast: number; lunch: number; dinner: number; pricePerMeal: number; currency: Currency; };

// --- Guide Types ---
type GuideFee = { id: string; guideName: string; numGuides: number; numDays: number; pricePerDay: number; currency: Currency; };

// --- Document Types ---
type DocumentFee = { id: string; documentName: string; pax: number; price: number; currency: Currency; };

// --- Main State Type ---
interface TourCosts {
    accommodations: Accommodation[];
    trips: Trip[];
    flights: Flight[];
    trainTickets: TrainTicket[];
    entranceFees: EntranceFee[];
    meals: MealCost[];
    guides: GuideFee[];
    documents: DocumentFee[];
}

const LOCAL_STORAGE_KEY_PREFIX = 'tour-';

const costCategories: Array<keyof TourCosts> = [
    'accommodations', 'trips', 'flights', 'trainTickets',
    'entranceFees', 'meals', 'guides', 'documents'
];


const CostCategoryContent = ({ title, children }: { title: string, children: React.ReactNode }) => (
     <AccordionItem value={title.toLowerCase().replace(/\s/g, '-')}>
        <AccordionTrigger className="text-lg font-semibold">{title}</AccordionTrigger>
        <AccordionContent>
            {children}
        </AccordionContent>
    </AccordionItem>
);


export default function TourCalculatorPage() {
    const [tourInfo, setTourInfo] = useState({
        mouContact: '',
        groupCode: '',
        destinationCountry: '',
        program: '',
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        numDays: 1,
        numNights: 0,
        numPeople: 1,
        travelerInfo: ''
    });

    const [allCosts, setAllCosts] = useState<TourCosts>({
        accommodations: [],
        trips: [],
        flights: [],
        trainTickets: [],
        entranceFees: [],
        meals: [],
        guides: [],
        documents: [],
    });

    // Generic state update function
    const updateCosts = useCallback(<T extends keyof TourCosts>(category: T, data: TourCosts[T]) => {
        setAllCosts(prev => ({ ...prev, [category]: data }));
    }, []);

    // Effect to save to localStorage and dispatch events after state has been updated
    useEffect(() => {
        costCategories.forEach(category => {
            try {
                localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${category}`, JSON.stringify(allCosts[category]));
                window.dispatchEvent(new CustomEvent(`${category}Update`));
            } catch (error) {
                console.error(`Failed to save ${category} to localStorage`, error);
            }
        });
    }, [allCosts]);


    // Load all data from localStorage on initial render
    useEffect(() => {
        const loadedCosts: Partial<TourCosts> = {};
        costCategories.forEach(category => {
            try {
                const savedData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${category}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData, (key, value) => {
                         if ((key === 'checkInDate' || key === 'departureDate') && typeof value === 'string') {
                            return new Date(value);
                        }
                        return value;
                    });
                    loadedCosts[category] = parsedData;
                }
            } catch (error) {
                console.error(`Failed to load ${category} from localStorage`, error);
            }
        });
        setAllCosts(prev => ({...prev, ...loadedCosts}));
    }, []);

    // Generic CRUD operations
    const addItem = <T extends keyof TourCosts>(category: T, newItem: any) => {
        const currentItems = allCosts[category] as any[];
        updateCosts(category, [...currentItems, newItem]);
    };

    const updateItem = <T extends keyof TourCosts>(category: T, itemId: string, field: string, value: any) => {
        const currentItems = allCosts[category] as any[];
        const updatedItems = currentItems.map(item => item.id === itemId ? { ...item, [field]: value } : item);
        updateCosts(category, updatedItems as TourCosts[T]);
    };
    
    const duplicateItem = <T extends keyof TourCosts>(category: T, itemId: string) => {
        const currentItems = allCosts[category] as any[];
        const itemToCopy = currentItems.find(item => item.id === itemId);
        if (itemToCopy) {
            addItem(category, { ...itemToCopy, id: uuidv4() });
        }
    };

    const deleteItem = <T extends keyof TourCosts>(category: T, itemId: string) => {
        const currentItems = allCosts[category] as any[];
        updateCosts(category, currentItems.filter(item => item.id !== itemId) as TourCosts[T]);
    };

    const handleReset = (category: keyof TourCosts) => {
        if (window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນທັງໝົດໃນໝວດນີ້?`)) {
            updateCosts(category, []);
        }
    };


    // Specific Component Logic
    const addAccommodation = () => addItem('accommodations', { id: uuidv4(), name: '', type: 'hotel', rooms: [{ id: uuidv4(), type: 'เตียงเดี่ยว', numRooms: 1, numNights: 1, price: 0, currency: 'USD' }] });
    const addRoom = (accId: string) => {
        const accommodations = allCosts.accommodations.map(acc => {
            if (acc.id === accId) {
                const newRoom = { id: uuidv4(), type: 'เตียงเดี่ยว', numRooms: 1, numNights: 1, price: 0, currency: 'USD' };
                return { ...acc, rooms: [...acc.rooms, newRoom] };
            }
            return acc;
        });
        updateCosts('accommodations', accommodations);
    };
    const updateRoom = (accId: string, roomId: string, field: keyof Room, value: any) => {
         const accommodations = allCosts.accommodations.map(acc => {
            if (acc.id === accId) {
                const updatedRooms = acc.rooms.map(room => room.id === roomId ? { ...room, [field]: value } : room);
                return { ...acc, rooms: updatedRooms };
            }
            return acc;
        });
        updateCosts('accommodations', accommodations);
    };
    const deleteRoom = (accId: string, roomId: string) => {
         const accommodations = allCosts.accommodations.map(acc => {
            if (acc.id === accId) {
                return { ...acc, rooms: acc.rooms.filter(room => room.id !== roomId) };
            }
            return acc;
        });
        updateCosts('accommodations', accommodations);
    };

    const addTrip = () => addItem('trips', { id: uuidv4(), location: '', route: '', vehicleType: 'ລົດຕູ້ທຳມະດາ', numVehicles: 1, numDays: 1, pricePerVehicle: 0, currency: 'USD' });
    const addFlight = () => addItem('flights', { id: uuidv4(), from: '', to: '', departureTime: '08:00', pricePerPerson: 0, numPeople: 1, currency: 'USD' });
    const addTrainTicket = () => addItem('trainTickets', { id: uuidv4(), from: '', to: '', departureTime: '08:00', ticketClass: '', numTickets: 1, pricePerTicket: 0, currency: 'LAK' });
    const addEntranceFee = () => addItem('entranceFees', { id: uuidv4(), locationName: '', pax: 1, numLocations: 1, price: 0, currency: 'LAK' });
    const addMealCost = () => addItem('meals', { id: uuidv4(), name: '', pax: 1, breakfast: 0, lunch: 0, dinner: 0, pricePerMeal: 0, currency: 'LAK' });
    const addGuideFee = () => addItem('guides', { id: uuidv4(), guideName: '', numGuides: 1, numDays: 1, pricePerDay: 0, currency: 'LAK' });
    const addDocumentFee = () => addItem('documents', { id: uuidv4(), documentName: '', pax: 1, price: 0, currency: 'LAK' });

    // Memoized totals for performance
    const accommodationTotals = useMemo(() => allCosts.accommodations.reduce((acc, accommodation) => {
        acc[accommodation.id] = accommodation.rooms.reduce((roomTotal, room) => {
            const total = room.numRooms * room.numNights * room.price;
            if (!roomTotal[room.currency]) roomTotal[room.currency] = 0;
            roomTotal[room.currency] += total;
            return roomTotal;
        }, {} as Record<Currency, number>);
        return acc;
    }, {} as Record<string, Record<Currency, number>>), [allCosts.accommodations]);
    
    const simpleTotals = <T extends {id: string, currency: Currency}>(items: T[], priceLogic: (item: T) => number) => useMemo(() => {
        const itemTotals: Record<string, number> = {};
        const grandTotals: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
        items.forEach(item => {
            const total = priceLogic(item);
            itemTotals[item.id] = total;
            grandTotals[item.currency] += total;
        });
        return { itemTotals, grandTotals };
    }, [items]);

    const tripsTotals = simpleTotals(allCosts.trips, item => item.numVehicles * item.numDays * item.pricePerVehicle);
    const flightsTotals = simpleTotals(allCosts.flights, item => item.pricePerPerson * item.numPeople);
    const trainTotals = simpleTotals(allCosts.trainTickets, item => item.pricePerTicket * item.numTickets);
    const entranceTotals = simpleTotals(allCosts.entranceFees, item => item.pax * item.numLocations * item.price);
    const mealTotals = useMemo(() => {
        const itemTotals: Record<string, { total: number, perPerson: number }> = {};
        const grandTotals: Record<Currency, number> = { USD: 0, THB: 0, LAK: 0, CNY: 0 };
         allCosts.meals.forEach(cost => {
            const totalMeals = cost.breakfast + cost.lunch + cost.dinner;
            const totalCost = totalMeals * cost.pricePerMeal;
            itemTotals[cost.id] = { total: totalCost, perPerson: cost.pax > 0 ? totalCost / cost.pax : 0 };
            grandTotals[cost.currency] += totalCost;
        });
        return { itemTotals, grandTotals };
    }, [allCosts.meals]);
    const guideTotals = simpleTotals(allCosts.guides, item => item.numGuides * item.numDays * item.pricePerDay);
    const documentTotals = simpleTotals(allCosts.documents, item => item.pax * item.price);


    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-primary px-4 text-primary-foreground sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/tour">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າແດຊ໌ບອດ</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight">ລະບົບຈອງທົວ ແລະ ຄຳນວນຄ່າໃຊ້ຈ່າຍ</h1>
                    <p className="text-sm text-primary-foreground/80">ຈັດການຂໍ້ມູນທົວ ແລະ ຄຳນວນຄ່າໃຊ້ຈ່າຍແບບຄົບວົງຈອນ</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                        <Save className="mr-2 h-4 w-4" />
                        ບັນທຶກ
                    </Button>
                    <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                        <Download className="mr-2 h-4 w-4" />
                        ໂຫຼດ
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4 md:gap-8 bg-muted/40">
                 <TotalCostCard />

                 <div className="grid md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
                    {/* Left Column */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    ຂໍ້ມູນທົວ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="mou-contact">MOU Contact:</Label>
                                        <Input id="mou-contact" placeholder="ຊື່ຜູ້ຕິດຕໍ່" value={tourInfo.mouContact} onChange={e => setTourInfo({...tourInfo, mouContact: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="group-code">Group Code:</Label>
                                        <Input id="group-code" placeholder="ລະຫັດກຸ່ມ" value={tourInfo.groupCode} onChange={e => setTourInfo({...tourInfo, groupCode: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="destination-country">ປະເທດປາຍທາງ:</Label>
                                        <Input id="destination-country" placeholder="ປະເທດປາຍທາງ" value={tourInfo.destinationCountry} onChange={e => setTourInfo({...tourInfo, destinationCountry: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="program">ໂປຣແກຣມ:</Label>
                                        <Input id="program" placeholder="ລະບຸໂປຣແກຣມ" value={tourInfo.program} onChange={e => setTourInfo({...tourInfo, program: e.target.value})} />
                                    </div>
                                </div>
                                 <div className="grid md:grid-cols-2 gap-6 items-end">
                                   <div className="grid grid-cols-2 gap-2">
                                       <div className="grid gap-2">
                                            <Label htmlFor="travel-date-start">ວັນທີເດີນທາງ:</Label>
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className="justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {tourInfo.startDate ? format(tourInfo.startDate, "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={tourInfo.startDate} onSelect={date => setTourInfo({...tourInfo, startDate: date})} initialFocus locale={th} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid gap-2">
                                             <Label htmlFor="travel-date-end" className="text-transparent hidden md:block">-</Label>
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className="justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {tourInfo.endDate ? format(tourInfo.endDate, "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={tourInfo.endDate} onSelect={date => setTourInfo({...tourInfo, endDate: date})} initialFocus locale={th} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="num-days">ຈຳນວນວັນ:</Label>
                                            <Input id="num-days" type="number" placeholder="1" value={tourInfo.numDays} onChange={e => setTourInfo({...tourInfo, numDays: Number(e.target.value) || 1})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="num-nights">ຈຳນວນຄືນ:</Label>
                                            <Input id="num-nights" type="number" placeholder="0" value={tourInfo.numNights} onChange={e => setTourInfo({...tourInfo, numNights: Number(e.target.value) || 0})} />
                                        </div>
                                   </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="num-people">ຈຳນວນຄົນ:</Label>
                                        <Input id="num-people" type="number" placeholder="1" value={tourInfo.numPeople} onChange={e => setTourInfo({...tourInfo, numPeople: Number(e.target.value) || 1})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="traveler-info">ຂໍ້ມູນຜູ້ຮ່ວມເດີນທາງ:</Label>
                                        <Textarea id="traveler-info" placeholder="ຕົວຢ່າງ ກຸ່ມຄອບຄົວ, ຄູ່ຮັກ, ຜູ້ສູງອາຍຸ" className="min-h-[40px]" value={tourInfo.travelerInfo} onChange={e => setTourInfo({...tourInfo, travelerInfo: e.target.value})} />
                                    </div>
                                </div>
                            </CardContent>
                         </Card>
                    </div>
                     {/* Right Column */}
                    <div className="md:col-span-1">
                         <Card>
                            <CardHeader>
                                <CardTitle>ຄຳນວນຄ່າໃຊ້ຈ່າຍ</CardTitle>
                                <CardDescription>ເພີ່ມ ແລະ ຈັດການຄ່າໃຊ້ຈ່າຍຕ່າງໆ</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="multiple" className="w-full space-y-2">
                                    {/* Accommodation */}
                                    <CostCategoryContent title="ຄ່າທີ່ພັກ">
                                         <div className="space-y-4 pt-2">
                                            {allCosts.accommodations.map((acc, index) => (
                                                <Card key={acc.id} className="bg-muted/30">
                                                    <CardHeader className="flex-row items-center justify-between p-3 bg-muted/50">
                                                        <CardTitle className="text-base">ທີ່ພັກ #{index + 1}</CardTitle>
                                                        <div>
                                                            <Button variant="ghost" size="icon" onClick={() => duplicateItem('accommodations', acc.id)}><Copy className="h-4 w-4"/></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => deleteItem('accommodations', acc.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 space-y-4">
                                                        {/* Acc Fields */}
                                                         <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>ຊື່ທີ່ພັກ</Label>
                                                                <Input placeholder="ຊື່ທີ່ພັກ" value={acc.name} onChange={e => updateItem('accommodations', acc.id, 'name', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>ວັນທີເຊັກອິນ</Label>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                                            {acc.checkInDate ? format(new Date(acc.checkInDate), "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0">
                                                                        <Calendar mode="single" selected={acc.checkInDate} onSelect={(date) => updateItem('accommodations', acc.id, 'checkInDate', date)} initialFocus />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                         </div>
                                                        {/* Rooms */}
                                                        {acc.rooms.map((room, roomIndex) => (
                                                            <div key={room.id} className="p-3 border rounded-md relative bg-background">
                                                                <Label className="absolute -top-2 left-2 bg-background px-1 text-xs text-muted-foreground">ຫ້ອງ #{roomIndex+1}</Label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                     <div className="space-y-1">
                                                                        <Label className="text-xs">ປະເພດ</Label>
                                                                        <Select value={room.type} onValueChange={(v) => updateRoom(acc.id, room.id, 'type', v)}>
                                                                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="เตียงเดี่ยว">ຕຽງດ່ຽວ</SelectItem>
                                                                                <SelectItem value="เตียงคู่">ຕຽງຄູ່</SelectItem>
                                                                                <SelectItem value="ห้องสวีท">ຫ້ອງສະວີດ</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                     <div className="space-y-1">
                                                                        <Label className="text-xs">ຈຳນວນຫ້ອງ</Label>
                                                                        <Input type="number" min="1" value={room.numRooms} onChange={e => updateRoom(acc.id, room.id, 'numRooms', parseInt(e.target.value) || 1)} className="h-8" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">ຈຳນວນຄືນ</Label>
                                                                        <Input type="number" min="1" value={room.numNights} onChange={e => updateRoom(acc.id, room.id, 'numNights', parseInt(e.target.value) || 1)} className="h-8" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">ລາຄາ/ຫ້ອງ/ຄືນ</Label>
                                                                        <Input type="number" min="0" value={room.price} onChange={e => updateRoom(acc.id, room.id, 'price', parseFloat(e.target.value) || 0)} className="h-8" />
                                                                    </div>
                                                                     <div className="space-y-1 col-span-2">
                                                                        <Label className="text-xs">ສະກຸນເງິນ</Label>
                                                                        <Select value={room.currency} onValueChange={(v) => updateRoom(acc.id, room.id, 'currency', v)}>
                                                                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {(Object.keys(currencySymbols) as Currency[]).map(c => (
                                                                                    <SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                {acc.rooms.length > 1 && <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => deleteRoom(acc.id, room.id)}><Trash2 className="h-3 w-3 text-red-400"/></Button>}
                                                            </div>
                                                        ))}
                                                        <Button size="sm" variant="outline" onClick={() => addRoom(acc.id)}><PlusCircle className="mr-2 h-4 w-4" />ເພີ່ມຫ້ອງ</Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            <div className="flex gap-2 mt-2">
                                                <Button onClick={addAccommodation} className="flex-1"><PlusCircle className="mr-2 h-4 w-4" />ເພີ່ມຄ່າທີ່ພັກ</Button>
                                                <Button onClick={() => handleReset('accommodations')} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                         </div>
                                    </CostCategoryContent>
                                    
                                     {/* Transport */}
                                    <CostCategoryContent title="ຄ່າຂົນສົ່ງ">
                                        <div className="space-y-4 pt-2">
                                            {allCosts.trips.map((trip, index) => (
                                                <Card key={trip.id} className="bg-muted/30">
                                                    <CardHeader className="flex-row items-center justify-between p-3 bg-muted/50">
                                                        <CardTitle className="text-base">ການເດີນທາງ #{index + 1}</CardTitle>
                                                        <div>
                                                            <Button variant="ghost" size="icon" onClick={() => duplicateItem('trips', trip.id)}><Copy className="h-4 w-4"/></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => deleteItem('trips', trip.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                             <div className="space-y-2">
                                                                <Label>ສະຖານທີ່</Label>
                                                                <Input placeholder="ສະຖານທີ່" value={trip.location} onChange={e => updateItem('trips', trip.id, 'location', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>ເສັ້ນທາງ</Label>
                                                                <Input placeholder="ວຽງຈັນ - ວັງວຽງ" value={trip.route} onChange={e => updateItem('trips', trip.id, 'route', e.target.value)} />
                                                            </div>
                                                            <div className="col-span-2 space-y-2">
                                                                <Label>ປະເພດລົດ</Label>
                                                                <Input placeholder="ລົດຕູ້ທຳມະດາ" value={trip.vehicleType} onChange={e => updateItem('trips', trip.id, 'vehicleType', e.target.value)} />
                                                            </div>
                                                        </div>
                                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                             <div className="space-y-1">
                                                                <Label className="text-xs">ຈຳນວນຄັນ</Label>
                                                                <Input type="number" min="1" value={trip.numVehicles} onChange={e => updateItem('trips', trip.id, 'numVehicles', parseInt(e.target.value) || 1)} className="h-8"/>
                                                            </div>
                                                             <div className="space-y-1">
                                                                <Label className="text-xs">ຈຳນວນວັນ</Label>
                                                                <Input type="number" min="1" value={trip.numDays} onChange={e => updateItem('trips', trip.id, 'numDays', parseInt(e.target.value) || 1)} className="h-8"/>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">ລາຄາ/ຄັນ</Label>
                                                                <Input type="number" min="0" value={trip.pricePerVehicle} onChange={e => updateItem('trips', trip.id, 'pricePerVehicle', parseFloat(e.target.value) || 0)} className="h-8"/>
                                                            </div>
                                                             <div className="space-y-1">
                                                                <Label className="text-xs">ສະກຸນເງິນ</Label>
                                                                <Select value={trip.currency} onValueChange={(v) => updateItem('trips', trip.id, 'currency', v)}>
                                                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {(Object.keys(currencySymbols) as Currency[]).map(c => (<SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            <div className="flex gap-2 mt-2">
                                                <Button onClick={addTrip} className="flex-1"><PlusCircle className="mr-2 h-4 w-4" />ເພີ່ມຄ່າຂົນສົ່ງ</Button>
                                                <Button onClick={() => handleReset('trips')} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </CostCategoryContent>
                                     {/* Flights */}
                                    <CostCategoryContent title="ຄ່າປີ້ຍົນ">
                                         <div className="space-y-4 pt-2">
                                             {allCosts.flights.map((flight, index) => (
                                                 <Card key={flight.id} className="bg-muted/30">
                                                    <CardHeader className="flex-row items-center justify-between p-3 bg-muted/50">
                                                        <CardTitle className="text-base">ປີ້ຍົນ #{index + 1}</CardTitle>
                                                        <div>
                                                            <Button variant="ghost" size="icon" onClick={() => duplicateItem('flights', flight.id)}><Copy className="h-4 w-4"/></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => deleteItem('flights', flight.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>ເສັ້ນທາງ</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Input placeholder="ຈາກ" value={flight.from} onChange={e => updateItem('flights', flight.id, 'from', e.target.value)} />
                                                                    <span>ໄປ</span>
                                                                    <Input placeholder="ໄປ" value={flight.to} onChange={e => updateItem('flights', flight.id, 'to', e.target.value)} />
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
                                                                            <Calendar mode="single" selected={flight.departureDate} onSelect={(date) => updateItem('flights', flight.id, 'departureDate', date)} initialFocus />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                    <div className="relative">
                                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                        <Input type="time" value={flight.departureTime} onChange={e => updateItem('flights', flight.id, 'departureTime', e.target.value)} className="pl-10" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                         <div className="grid grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>ລາຄາ/ຄົນ</Label>
                                                                <Input type="number" min="0" value={flight.pricePerPerson} onChange={e => updateItem('flights', flight.id, 'pricePerPerson', parseFloat(e.target.value) || 0)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>ຈຳນວນຄົນ</Label>
                                                                <Input type="number" min="1" value={flight.numPeople} onChange={e => updateItem('flights', flight.id, 'numPeople', parseInt(e.target.value) || 1)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>ສະກຸນເງິນ</Label>
                                                                <Select value={flight.currency} onValueChange={(v) => updateItem('flights', flight.id, 'currency', v)}>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                    <SelectContent>{(Object.keys(currencySymbols) as Currency[]).map(c => (<SelectItem key={c} value={c}>{currencySymbols[c]}</SelectItem>))}</SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                 </Card>
                                             ))}
                                            <div className="flex gap-2 mt-2">
                                                <Button onClick={addFlight} className="flex-1"><PlusCircle className="mr-2 h-4 w-4" />ເພີ່ມຄ່າປີ້ຍົນ</Button>
                                                 <Button onClick={() => handleReset('flights')} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                         </div>
                                    </CostCategoryContent>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                 </div>
            </main>
        </div>
    );

    

    