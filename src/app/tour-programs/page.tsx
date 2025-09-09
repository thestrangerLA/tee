
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, PlusCircle } from "lucide-react";
import { listenToTourPrograms } from '@/services/tourProgramService';
import type { TourProgram } from '@/lib/types';
import { format } from 'date-fns';

const formatCurrency = (value: number | null | undefined, currency: string) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value) + ` ${currency}`;
};

export default function TourProgramsListPage() {
    const [programs, setPrograms] = useState<TourProgram[]>([]);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = listenToTourPrograms(setPrograms);
        return () => unsubscribe();
    }, []);

    const handleRowClick = (id: string) => {
        router.push(`/tour-programs/${id}`);
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
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>รายการโปรแกรมทัวร์</CardTitle>
                            <CardDescription>
                                จัดการ สร้าง และแก้ไขโปรแกรมทัวร์สำหรับลูกค้า
                            </CardDescription>
                        </div>
                        <Link href="/tour-programs/new">
                            <Button size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                เพิ่มโปรแกรมทัวร์ใหม่
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>วันที่</TableHead>
                                        <TableHead>รหัสทัวร์</TableHead>
                                        <TableHead>ชื่อโปรแกรม</TableHead>
                                        <TableHead>ชื่อกลุ่ม</TableHead>
                                        <TableHead>จุดหมาย</TableHead>
                                        <TableHead className="text-right">จำนวนคน</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programs.length > 0 ? (
                                        programs.map(program => (
                                            <TableRow key={program.id} onClick={() => handleRowClick(program.id)} className="cursor-pointer">
                                                <TableCell>{program.date ? format(program.date, 'dd/MM/yyyy') : '-'}</TableCell>
                                                <TableCell>{program.tourCode}</TableCell>
                                                <TableCell className="font-medium">{program.programName}</TableCell>
                                                <TableCell>{program.groupName}</TableCell>
                                                <TableCell>{program.destination}</TableCell>
                                                <TableCell className="text-right">{program.pax}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                ยังไม่มีโปรแกรมทัวร์, เริ่มโดยการสร้างโปรแกรมใหม่
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
