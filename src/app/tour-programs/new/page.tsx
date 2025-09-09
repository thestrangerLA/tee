
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addTourProgram } from '@/services/tourProgramService';
import type { TourProgram } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from 'date-fns';
import { th } from 'date-fns/locale';


export default function NewTourProgramPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formData, setFormData] = useState<Omit<TourProgram, 'id' | 'createdAt' | 'date'>>({
        tourCode: '',
        programName: '',
        groupName: '',
        pax: 0,
        destination: '',
        durationDays: 0,
        priceKip: 0,
        priceUsd: 0,
        priceBaht: 0,
        priceCny: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !formData.programName) {
            toast({
                title: "ข้อมูลไม่ครบถ้วน",
                description: "กรุณาเลือกวันที่และใส่ชื่อโปรแกรม",
                variant: "destructive"
            });
            return;
        }

        try {
            const newProgramData: Omit<TourProgram, 'id' | 'createdAt'> = {
                ...formData,
                date: startOfDay(date),
            };
            const newProgramId = await addTourProgram(newProgramData);
            toast({
                title: "สร้างโปรแกรมทัวร์สำเร็จ",
                description: `โปรแกรม "${formData.programName}" ถูกสร้างแล้ว`,
            });
            router.push(`/tour-programs/${newProgramId}`);
        } catch (error) {
            console.error("Error adding tour program:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถสร้างโปรแกรมทัวร์ได้",
                variant: "destructive"
            });
        }
    };


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour-programs">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้ารายการโปรแกรม</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight font-headline">เพิ่มโปรแกรมทัวร์ใหม่</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>รายละเอียดโปรแกรมทัวร์</CardTitle>
                        <CardDescription>กรอกข้อมูลเพื่อสร้างโปรแกรมทัวร์ใหม่</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">วันที่</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={th} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tourCode">รหัสทัวร์</Label>
                                    <Input id="tourCode" name="tourCode" value={formData.tourCode} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="programName">ชื่อโปรแกรม</Label>
                                <Input id="programName" name="programName" value={formData.programName} onChange={handleChange} required />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="groupName">ชื่อกลุ่ม</Label>
                                    <Input id="groupName" name="groupName" value={formData.groupName} onChange={handleChange} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="pax">จำนวนคน (Pax)</Label>
                                    <Input id="pax" name="pax" type="number" value={formData.pax} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="destination">จุดหมาย</Label>
                                    <Input id="destination" name="destination" value={formData.destination} onChange={handleChange} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="durationDays">ระยะเวลา (วัน)</Label>
                                    <Input id="durationDays" name="durationDays" type="number" value={formData.durationDays} onChange={handleChange} />
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">ราคาต่อคน</CardTitle>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                     <div className="grid gap-2">
                                        <Label htmlFor="priceKip">กีบ</Label>
                                        <Input id="priceKip" name="priceKip" type="number" value={formData.priceKip} onChange={handleChange} placeholder="0" />
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="priceUsd">ดอลลาร์</Label>
                                        <Input id="priceUsd" name="priceUsd" type="number" value={formData.priceUsd} onChange={handleChange} placeholder="0" />
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="priceBaht">บาท</Label>
                                        <Input id="priceBaht" name="priceBaht" type="number" value={formData.priceBaht} onChange={handleChange} placeholder="0" />
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="priceCny">หยวน</Label>
                                        <Input id="priceCny" name="priceCny" type="number" value={formData.priceCny} onChange={handleChange} placeholder="0" />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.push('/tour-programs')}>ยกเลิก</Button>
                                <Button type="submit">บันทึก</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
