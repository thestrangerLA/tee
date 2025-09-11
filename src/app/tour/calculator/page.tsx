
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calculator, Save, Download, MapPin, Calendar as CalendarIcon, BedDouble, Truck, Plane, TrainFront, PlusCircle, Camera, UtensilsCrossed, Users, FileText } from "lucide-react";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const CostCategoryCard = ({ title, icon, buttonText, buttonColor, iconColor, href }: { title: string, icon: React.ReactNode, buttonText: string, buttonColor: string, iconColor: string, href: string }) => (
    <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-md ${iconColor} bg-opacity-10`}>
                    {icon}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <Button asChild className={`${buttonColor}`}>
                <Link href={href}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {buttonText}
                </Link>
            </Button>
        </CardContent>
    </Card>
);


export default function TourCalculatorPage() {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

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
                 <Card className="w-full max-w-6xl mx-auto">
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
                                <Input id="mou-contact" placeholder="ຊື່ຜູ້ຕິດຕໍ່" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="group-code">Group Code:</Label>
                                <Input id="group-code" placeholder="ລະຫັດກຸ່ມ" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="destination-country">ປະເທດປາຍທາງ:</Label>
                                <Input id="destination-country" placeholder="ປະເທດປາຍທາງ" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="program">ໂປຣແກຣມ:</Label>
                                <Input id="program" placeholder="ລະບຸໂປຣແກຣມ" />
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
                                                {startDate ? format(startDate, "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={th} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                     <Label htmlFor="travel-date-end" className="text-transparent hidden md:block">-</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className="justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "dd/MM/yyyy") : <span>mm/dd/yyyy</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={th} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="num-days">ຈຳນວນວັນ:</Label>
                                    <Input id="num-days" type="number" placeholder="1" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="num-nights">ຈຳນວນຄືນ:</Label>
                                    <Input id="num-nights" type="number" placeholder="0" />
                                </div>
                           </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="num-people">ຈຳນວນຄົນ:</Label>
                                <Input id="num-people" type="number" placeholder="1" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="traveler-info">ຂໍ້ມູນຜູ້ຮ່ວມເດີນທາງ:</Label>
                                <Textarea id="traveler-info" placeholder="ຕົວຢ່າງ ກຸ່ມຄອບຄົວ, ຄູ່ຮັກ, ຜູ້ສູງອາຍຸ" className="min-h-[40px]" />
                            </div>
                        </div>
                    </CardContent>
                 </Card>

                 <Card className="w-full max-w-6xl mx-auto">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-6 w-6 text-primary" />
                            ຄຳນວນຄ່າໃຊ້ຈ່າຍ
                        </CardTitle>
                        <CardDescription>ເພີ່ມ ແລະ ຈັດການຄ່າໃຊ້ຈ່າຍຕ່າງໆ ສໍາລັບໂປຣແກຣມທົວນີ້</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <CostCategoryCard 
                            href="/tour/accommodation"
                            title="ຄ່າທີ່ພັກ" 
                            icon={<BedDouble className="h-6 w-6 text-purple-600" />} 
                            buttonText="ເພີ່ມຄ່າທີ່ພັກ"
                            buttonColor="bg-purple-600 hover:bg-purple-700"
                            iconColor="bg-purple-100"
                        />
                        <CostCategoryCard 
                            href="/tour/transport"
                            title="ຄ່າຂົນສົ່ງ" 
                            icon={<Truck className="h-6 w-6 text-green-600" />} 
                            buttonText="ເພີ່ມຄ່າຂົນສົ່ງ"
                            buttonColor="bg-green-600 hover:bg-green-700"
                            iconColor="bg-green-100"
                        />
                         <CostCategoryCard 
                            href="/tour/flights"
                            title="ຄ່າປີ້ຍົນ" 
                            icon={<Plane className="h-6 w-6 text-orange-600" />} 
                            buttonText="ເພີ່ມຄ່າປີ້ຍົນ"
                            buttonColor="bg-orange-600 hover:bg-orange-700"
                            iconColor="bg-orange-100"
                        />
                         <CostCategoryCard 
                            href="/tour/train-tickets"
                            title="ຄ່າປີ້ລົດໄຟ" 
                            icon={<TrainFront className="h-6 w-6 text-red-600" />} 
                            buttonText="ເພີ່ມຄ່າປີ້ລົດໄຟ"
                            buttonColor="bg-red-600 hover:bg-red-700"
                            iconColor="bg-red-100"
                        />
                        <CostCategoryCard 
                            href="/tour/entrance-fees"
                            title="ຄ່າເຂົ້າຊົມສະຖານທີ່" 
                            icon={<Camera className="h-6 w-6 text-pink-600" />} 
                            buttonText="ເພີ່ມຄ່າເຂົ້າຊົມ"
                            buttonColor="bg-pink-600 hover:bg-pink-700"
                            iconColor="bg-pink-100"
                        />
                        <CostCategoryCard 
                            href="/tour/meals"
                            title="ຄ່າອາຫານ" 
                            icon={<UtensilsCrossed className="h-6 w-6 text-yellow-600" />} 
                            buttonText="ເພີ່ມຄ່າອາຫານ"
                            buttonColor="bg-yellow-600 hover:bg-yellow-700 text-black"
                            iconColor="bg-yellow-100"
                        />
                        <CostCategoryCard 
                            href="/tour/guides"
                            title="ຄ່າໄກด์" 
                            icon={<Users className="h-6 w-6 text-blue-600" />} 
                            buttonText="ເພີ່ມຄ່າໄກด์"
                            buttonColor="bg-blue-600 hover:bg-blue-700"
                            iconColor="bg-blue-100"
                        />
                        <CostCategoryCard 
                            href="/tour/documents"
                            title="ຄ່າເອກະສານ" 
                            icon={<FileText className="h-6 w-6 text-slate-600" />} 
                            buttonText="ເພີ່ມຄ່າເອກະສານ"
                            buttonColor="bg-slate-600 hover:bg-slate-700"
                            iconColor="bg-slate-100"
                        />
                    </CardContent>
                 </Card>
            </main>
        </div>
    );
}
