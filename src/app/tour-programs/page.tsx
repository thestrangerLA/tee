
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, PlusCircle, MoreHorizontal, ChevronDown, Calendar as CalendarIcon, Filter } from "lucide-react";
import { listenToTourPrograms, deleteTourProgram, updateTourProgram } from '@/services/tourProgramService';
import type { TourProgram } from '@/lib/types';
import { format, getYear, getMonth, startOfDay } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const formatCurrency = (value: number | null | undefined, currency: string) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value) + ` ${currency}`;
};

export default function TourProgramsListPage() {
    const { toast } = useToast();
    const [allPrograms, setAllPrograms] = useState<TourProgram[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(2025);
    const [selectedGroupCode, setSelectedGroupCode] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = listenToTourPrograms(setAllPrograms);
        return () => unsubscribe();
    }, []);

    const handleRowClick = (id: string) => {
        router.push(`/tour-programs/${id}`);
    };
    
    const filteredPrograms = useMemo(() => {
        return allPrograms.filter(p => {
            // If selectedYear is null, don't filter by year
            const isYearMatch = selectedYear === null || getYear(p.date) === selectedYear;
            const isGroupCodeMatch = !selectedGroupCode || p.tourCode === selectedGroupCode;
            return isYearMatch && isGroupCodeMatch;
        });
    }, [allPrograms, selectedYear, selectedGroupCode]);

    const programsByMonth = useMemo(() => {
        if (selectedYear === null) {
            // When "All Years" is selected, group by year first, then by month
            return filteredPrograms.reduce((acc, program) => {
                const year = getYear(program.date);
                const month = getMonth(program.date);
                const key = `${year}-${month}`;
                if (!acc[key]) {
                    acc[key] = { year, month, programs: [] };
                }
                acc[key].programs.push(program);
                return acc;
            }, {} as Record<string, { year: number, month: number, programs: TourProgram[] }>);
        }
        // Original logic: group by month for a selected year
        return filteredPrograms.reduce((acc, program) => {
            const month = getMonth(program.date); // 0-11
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(program);
            return acc;
        }, {} as Record<number, TourProgram[]>);

    }, [filteredPrograms, selectedYear]);
    
    const allGroupCodes = useMemo(() => {
        const codes = allPrograms
            .map(p => p.tourCode)
            .filter((code, index, self) => code && self.indexOf(code) === index);
        return codes.sort();
    }, [allPrograms]);


    const handleDeleteProgram = async (programId: string, programName: string) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโปรแกรม "${programName}"? การกระทำนี้จะลบรายรับและรายจ่ายทั้งหมดที่เกี่ยวข้องด้วยและไม่สามารถย้อนกลับได้`)) {
            return;
        }
        try {
            await deleteTourProgram(programId);
            toast({
                title: "ลบโปรแกรมสำเร็จ",
                description: `โปรแกรม "${programName}" ถูกลบแล้ว`,
            });
        } catch (error) {
            console.error("Error deleting program:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบโปรแกรมได้",
                variant: "destructive",
            });
        }
    };
    
     const handleUpdateProgramDate = async (programId: string, newDate: Date | undefined) => {
        if (!newDate) return;
        try {
            await updateTourProgram(programId, { date: startOfDay(newDate) });
            toast({
                title: "อัปเดตวันที่สำเร็จ",
            });
        } catch (error) {
            console.error("Error updating program date:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถอัปเดตวันที่ได้",
                variant: "destructive",
            });
        }
    };
    
    const YearSelector = () => {
        const years = [2025, 2024];

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{selectedYear ? `ปี ${selectedYear + 543}` : 'ทุกปี'}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => setSelectedYear(null)}>
                        ทุกปี
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {years.map(year => (
                        <DropdownMenuItem key={year} onClick={() => setSelectedYear(year)}>
                            {`ปี ${year + 543}`}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };


    const GroupCodeSelector = () => (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>{selectedGroupCode || 'All Codes'}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedGroupCode(null)}>
                    All Codes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {allGroupCodes.map(code => (
                    <DropdownMenuItem key={code} onClick={() => setSelectedGroupCode(code)}>
                        {code}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
    
    const renderProgramRows = (programs: TourProgram[]) => (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>Group Code</TableHead>
                    <TableHead>Tour Program</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>จุดหมาย</TableHead>
                    <TableHead className="text-right">จำนวนคน</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {programs.map(program => (
                <TableRow key={program.id} className="group">
                    <TableCell>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-[150px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {program.date ? format(program.date, "dd/MM/yyyy") : <span>เลือกวันที่</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={program.date}
                                    onSelect={(date) => handleUpdateProgramDate(program.id, date)}
                                    initialFocus
                                    locale={th}
                                />
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(program.id)} className="cursor-pointer">{program.tourCode}</TableCell>
                    <TableCell onClick={() => handleRowClick(program.id)} className="cursor-pointer font-medium">{program.programName}</TableCell>
                    <TableCell onClick={() => handleRowClick(program.id)} className="cursor-pointer">{program.groupName}</TableCell>
                    <TableCell onClick={() => handleRowClick(program.id)} className="cursor-pointer">{program.destination}</TableCell>
                    <TableCell onClick={() => handleRowClick(program.id)} className="cursor-pointer text-right">{program.pax}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleRowClick(program.id)}>
                                    ดู/แก้ไข
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProgram(program.id, program.programName)
                                    }}
                                >
                                    ลบ
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    );


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/tour">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">กลับไปหน้าหลัก</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight font-headline">โปรแกรมทัวร์ทั้งหมด</h1>
                </div>
                 <div className="ml-auto flex items-center gap-4">
                    <YearSelector />
                    <GroupCodeSelector />
                    <Link href="/tour-programs/new">
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            เพิ่มโปรแกรมทัวร์
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>รายการโปรแกรมทัวร์ {selectedYear ? `ปี ${selectedYear + 543}` : 'ทั้งหมด'}</CardTitle>
                        <CardDescription>
                            จัดการ สร้าง และแก้ไขโปรแกรมทัวร์สำหรับลูกค้า
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {filteredPrograms.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                                {selectedYear !== null ? 
                                    Object.entries(programsByMonth).sort(([a], [b]) => Number(a) - Number(b)).map(([month, programs]) => (
                                        <AccordionItem value={`month-${month}`} key={month}>
                                            <AccordionTrigger className="bg-muted/50 px-4 rounded-md text-base font-semibold">
                                                {format(new Date(selectedYear, Number(month)), 'LLLL', { locale: th })}
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2">
                                                <div className="overflow-x-auto">
                                                    {renderProgramRows(programs as TourProgram[])}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))
                                : // When "All Years" is selected
                                    Object.values(programsByMonth as Record<string, { year: number, month: number, programs: TourProgram[] }>)
                                    .sort((a,b) => (b.year - a.year) || (b.month - a.month))
                                    .map(({year, month, programs}) => (
                                        <AccordionItem value={`${year}-${month}`} key={`${year}-${month}`}>
                                            <AccordionTrigger className="bg-muted/50 px-4 rounded-md text-base font-semibold">
                                                  {format(new Date(year, month), 'LLLL yyyy', { locale: th })}
                                            </AccordionTrigger>
                                             <AccordionContent className="pt-2">
                                                <div className="overflow-x-auto">
                                                    {renderProgramRows(programs)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))
                                }
                            </Accordion>
                         ) : (
                            <div className="text-center text-muted-foreground py-16">
                                ไม่มีโปรแกรมทัวร์สำหรับ {selectedYear ? `ปี ${selectedYear + 543}`: 'ตัวกรองที่เลือก'}
                            </div>
                         )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

    