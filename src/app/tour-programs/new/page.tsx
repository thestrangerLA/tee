
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addTourProgram } from '@/services/tourProgramService';
import type { TourProgram, Currency } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const currencies: Currency[] = ['KIP', 'BAHT', 'USD', 'CNY'];

const CurrencyInput = ({ label, amount, currency, onAmountChange, onCurrencyChange }: {
    label: string;
    amount: number;
    currency: Currency;
    onAmountChange: (value: number) => void;
    onCurrencyChange: (value: Currency) => void;
}) => (
    <div className="grid gap-2">
        <Label htmlFor={label.toLowerCase()}>{label}</Label>
        <div className="flex gap-2">
            <Input
                id={label.toLowerCase()}
                type="number"
                value={amount || ''}
                onChange={(e) => onAmountChange(Number(e.target.value))}
                className="w-2/3"
            />
            <Select value={currency} onValueChange={(v) => onCurrencyChange(v as Currency)}>
                <SelectTrigger className="w-1/3">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    </div>
);


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
        tourDates: '',
        durationDays: 0,
        price: 0,
        priceCurrency: 'KIP',
        bankCharge: 0,
        bankChargeCurrency: 'KIP',
        totalPrice: 0, // This will be handled by service or derived
    });

    const handleFormValueChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({...prev, [field]: value}));
    }

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
                totalPrice: formData.priceCurrency === formData.bankChargeCurrency ? formData.price + formData.bankCharge : formData.price,
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
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">วันที่สร้าง</Label>
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
                                    <Label htmlFor="tourCode">Group Code</Label>
                                    <Input id="tourCode" name="tourCode" value={formData.tourCode} onChange={(e) => handleFormValueChange('tourCode', e.target.value)} />
                                </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="programName">Tour Program</Label>
                                    <Input id="programName" name="programName" value={formData.programName} onChange={(e) => handleFormValueChange('programName', e.target.value)} required />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="tourDates">วันที่เดินทาง (Tour Dates)</Label>
                                <Textarea id="tourDates" name="tourDates" value={formData.tourDates} onChange={(e) => handleFormValueChange('tourDates', e.target.value)} placeholder="เช่น 30/08/2025-31/08/2025&#10;06/09/2025-07/09/2025" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="groupName">Nationality</Label>
                                    <Input id="groupName" name="groupName" value={formData.groupName} onChange={(e) => handleFormValueChange('groupName', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="pax">จำนวนคน (Pax)</Label>
                                    <Input id="pax" name="pax" type="number" value={formData.pax} onChange={(e) => handleFormValueChange('pax', Number(e.target.value))} />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="destination">จุดหมาย</Label>
                                    <Input id="destination" name="destination" value={formData.destination} onChange={(e) => handleFormValueChange('destination', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="durationDays">ระยะเวลา (วัน)</Label>
                                    <Input id="durationDays" name="durationDays" type="number" value={formData.durationDays} onChange={(e) => handleFormValueChange('durationDays', Number(e.target.value))} />
                                </div>
                            </div>

                             <div className="grid md:grid-cols-2 gap-6">
                                 <CurrencyInput 
                                    label="Price"
                                    amount={formData.price}
                                    currency={formData.priceCurrency}
                                    onAmountChange={(v) => handleFormValueChange('price', v)}
                                    onCurrencyChange={(v) => handleFormValueChange('priceCurrency', v)}
                                 />
                                 <CurrencyInput 
                                    label="Bank Charge"
                                    amount={formData.bankCharge}
                                    currency={formData.bankChargeCurrency}
                                    onAmountChange={(v) => handleFormValueChange('bankCharge', v)}
                                    onCurrencyChange={(v) => handleFormValueChange('bankChargeCurrency', v)}
                                 />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.push('/tour-programs')}>ยกเลิก</Button>
                                <Button type="submit">บันทึกและไปต่อ</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
