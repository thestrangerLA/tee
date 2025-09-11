
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
import { ArrowLeft, Calculator, Save, Download, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function TourCalculatorPage() {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-primary px-4 text-primary-foreground sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/tour">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้าแดชบอร์ด</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight">ระบบจองทัวร์และคำนวณค่าใช้จ่าย</h1>
                    <p className="text-sm text-primary-foreground/80">จัดการข้อมูลทัวร์และคำนวณค่าใช้จ่ายแบบครบวงจร</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                        <Save className="mr-2 h-4 w-4" />
                        บันทึก
                    </Button>
                    <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                        <Download className="mr-2 h-4 w-4" />
                        โหลด
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4 md:gap-8 bg-muted/40">
                 <Card className="w-full max-w-6xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-primary" />
                            ข้อมูลทัวร์
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="mou-contact">MOU Contact:</Label>
                                <Input id="mou-contact" placeholder="ชื่อผู้ติดต่อ" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="group-code">Group Code:</Label>
                                <Input id="group-code" placeholder="รหัสกลุ่ม" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="destination-country">ประเทศปลายทาง:</Label>
                                <Input id="destination-country" placeholder="ประเทศปลายทาง" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="program">โปรแกรม:</Label>
                                <Input id="program" placeholder="ระบุโปรแกรม" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 items-end">
                           <div className="grid grid-cols-2 gap-2">
                               <div className="grid gap-2">
                                    <Label htmlFor="travel-date-start">วันที่เดินทาง:</Label>
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
                                    <Label htmlFor="num-days">จำนวนวัน:</Label>
                                    <Input id="num-days" type="number" placeholder="1" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="num-nights">จำนวนคืน:</Label>
                                    <Input id="num-nights" type="number" placeholder="0" />
                                </div>
                           </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="num-people">จำนวนคน:</Label>
                                <Input id="num-people" type="number" placeholder="1" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="traveler-info">ข้อมูลผู้ร่วมทริป:</Label>
                                <Textarea id="traveler-info" placeholder="เช่น กลุ่มครอบครัว, คู่รัก, ผู้สูงอายุ" className="min-h-[40px]" />
                            </div>
                        </div>

                    </CardContent>
                 </Card>
            </main>
        </div>
    );
}
