
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, PlusCircle, MoreHorizontal, ChevronDown } from "lucide-react";
import { listenToTourPrograms, deleteTourProgram } from '@/services/tourProgramService';
import type { TourProgram } from '@/lib/types';
import { format, getYear, getMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const formatCurrency = (value: number | null | undefined, currency: string) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value) + ` ${currency}`;
};

export default function TourProgramsListPage() {
    const { toast } = useToast();
    const [allPrograms, setAllPrograms] = useState<TourProgram[]>([]);
    const [selectedYear, setSelectedYear] = useState(2025);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = listenToTourPrograms(setAllPrograms);
        return () => unsubscribe();
    }, []);

    const handleRowClick = (id: string) => {
        router.push(`/tour-programs/${id}`);
    };
    
    const yearlyPrograms = useMemo(() => {
        return allPrograms.filter(p => getYear(p.date) === selectedYear);
    }, [allPrograms, selectedYear]);

    const programsByMonth = useMemo(() => {
        return yearlyPrograms.reduce((acc, program) => {
            const month = getMonth(program.date); // 0-11
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(program);
            return acc;
        }, {} as Record<number, TourProgram[]>);
    }, [yearlyPrograms]);


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
    
    const YearSelector = () => {
        const currentYear = getYear(new Date());
        // Create a list of years, e.g., from 3 years ago to 2 years in the future, plus 2025
        const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);
        if (!years.includes(2025)) {
            years.push(2025);
        }
        const uniqueYears = [...new Set(years)].sort((a,b) => a - b);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <span>ปี {selectedYear + 543}</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {uniqueYears.map(year => (
                        <DropdownMenuItem key={year} onClick={() => setSelectedYear(year)}>
                            {year + 543}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };


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
                        <CardTitle>รายการโปรแกรมทัวร์ปี {selectedYear + 543}</CardTitle>
                        <CardDescription>
                            จัดการ สร้าง และแก้ไขโปรแกรมทัวร์สำหรับลูกค้า
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {Object.keys(programsByMonth).length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {Object.entries(programsByMonth).sort(([a], [b]) => Number(a) - Number(b)).map(([month, programs]) => (
                                    <AccordionItem value={`month-${month}`} key={month}>
                                        <AccordionTrigger className="bg-muted/50 px-4 rounded-md text-base font-semibold">
                                            {format(new Date(selectedYear, Number(month)), 'LLLL', { locale: th })}
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <div className="overflow-x-auto">
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
                                                            <TableCell onClick={() => handleRowClick(program.id)} className="cursor-pointer">{program.date ? format(program.date, 'dd/MM/yyyy') : '-'}</TableCell>
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
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                         ) : (
                            <div className="text-center text-muted-foreground py-16">
                                ไม่มีโปรแกรมทัวร์สำหรับปี {selectedYear + 543}
                            </div>
                         )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
