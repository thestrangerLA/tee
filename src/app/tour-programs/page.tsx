
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, PlusCircle, MoreHorizontal } from "lucide-react";
import { listenToTourPrograms, deleteTourProgram } from '@/services/tourProgramService';
import type { TourProgram } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


const formatCurrency = (value: number | null | undefined, currency: string) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(value) + ` ${currency}`;
};

export default function TourProgramsListPage() {
    const { toast } = useToast();
    const [programs, setPrograms] = useState<TourProgram[]>([]);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = listenToTourPrograms(setPrograms);
        return () => unsubscribe();
    }, []);

    const handleRowClick = (id: string) => {
        router.push(`/tour-programs/${id}`);
    };

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
                                        <TableHead>Group Code</TableHead>
                                        <TableHead>Tour Program</TableHead>
                                        <TableHead>Nationality</TableHead>
                                        <TableHead>จุดหมาย</TableHead>
                                        <TableHead className="text-right">จำนวนคน</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programs.length > 0 ? (
                                        programs.map(program => (
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
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">
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
