
"use client"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Trash2, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listenToTourCostItemsForProgram, addTourCostItemForProgram, updateTourCostItem, deleteTourCostItem, getTourProgram } from '@/services/tourProgramService';
import type { TourCostItem, TourProgram } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value);
};

const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, '')) || 0;
};

export default function TourProgramDetailPage({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const [program, setProgram] = useState<TourProgram | null>(null);
    const [costItems, setCostItems] = useState<TourCostItem[]>([]);
    const programId = params.id;

    useEffect(() => {
        if (!programId) return;

        const fetchProgram = async () => {
            const programData = await getTourProgram(programId);
            setProgram(programData);
        };

        fetchProgram();
        const unsubscribeCosts = listenToTourCostItemsForProgram(programId, setCostItems);
        
        return () => {
            unsubscribeCosts();
        };
    }, [programId]);

    const handleAddItem = async () => {
        try {
            await addTourCostItemForProgram(programId);
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาดในการเพิ่มรายการ", variant: "destructive" });
        }
    };

    const handleUpdateItem = async (id: string, field: keyof Omit<TourCostItem, 'id' | 'createdAt' | 'programId'>, value: any) => {
        try {
            if (field === 'date' && !(value instanceof Date)) {
                return; 
            }
            await updateTourCostItem(id, { [field]: value });
        } catch (error) {
            console.error(`Error updating item ${id}:`, error)
            toast({ title: "เกิดข้อผิดพลาดในการอัปเดต", variant: "destructive" });
        }
    };
    
    const handleDeleteItem = async (id: string) => {
         if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
        try {
            await deleteTourCostItem(id);
            toast({title: "ลบรายการสำเร็จ"});
        } catch (error) {
             toast({ title: "เกิดข้อผิดพลาดในการลบ", variant: "destructive" });
        }
    };

    const totals = useMemo(() => {
        return costItems.reduce((acc, item) => {
            acc.kip += item.kip || 0;
            acc.baht += item.baht || 0;
            acc.usd += item.usd || 0;
            acc.cny += item.cny || 0;
            return acc;
        }, { kip: 0, baht: 0, usd: 0, cny: 0 });
    }, [costItems]);


    if (!program) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>กำลังโหลดโปรแกรมทัวร์...</p>
             </div>
        )
    }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/tour-programs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">กลับไปหน้ารายการ</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">{program.programName || 'รายละเอียดโปรแกรมทัวร์'}</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>ตารางคำนวณต้นทุน</CardTitle>
                    <CardDescription>
                        เพิ่ม ลบ และแก้ไขรายละเอียดต้นทุนสำหรับโปรแกรม "{program.programName}"
                    </CardDescription>
                </div>
                <Button size="sm" onClick={handleAddItem}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    เพิ่มรายการต้นทุน
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">ວັນທີ (Date)</TableHead>
                                <TableHead>ລາຍລະອຽດ (Description)</TableHead>
                                <TableHead className="text-right">KIP</TableHead>
                                <TableHead className="text-right">BAHT</TableHead>
                                <TableHead className="text-right">USD</TableHead>
                                <TableHead className="text-right">CNY</TableHead>
                                <TableHead className="w-[50px]"><span className="sr-only">ลบ</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="p-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal h-8 text-xs">
                                                     <CalendarIcon className="mr-1 h-3 w-3" />
                                                    {item.date ? format(item.date, "dd/MM/yy") : <span>เลือกวันที่</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={item.date || undefined}
                                                    onSelect={(date) => handleUpdateItem(item.id, 'date', date || new Date())}
                                                    initialFocus
                                                    locale={th}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input 
                                            defaultValue={item.detail || ''} 
                                            onBlur={(e) => handleUpdateItem(item.id, 'detail', e.target.value)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.kip)}
                                            onBlur={(e) => handleUpdateItem(item.id, 'kip', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.baht)}
                                            onBlur={(e) => handleUpdateItem(item.id, 'baht', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.usd)}
                                            onBlur={(e) => handleUpdateItem(item.id, 'usd', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                     <TableCell className="p-1">
                                        <Input
                                            type="text"
                                            defaultValue={formatCurrency(item.cny)}
                                            onBlur={(e) => handleUpdateItem(item.id, 'cny', parseFormattedNumber(e.target.value))}
                                            className="h-8 text-right"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1 text-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted font-bold">
                                <TableCell colSpan={2} className="text-right">ລວມ (Total)</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.kip)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.baht)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.usd)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.cny)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
