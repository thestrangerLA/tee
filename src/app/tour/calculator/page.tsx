
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator, PlusCircle, MoreHorizontal, Trash2, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { listenToSavedCalculations, deleteCalculation } from '@/services/tourCalculatorService';
import type { SavedCalculation } from '@/lib/types';
import { format, getYear, getMonth } from 'date-fns';

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
import { useClientRouter } from '@/hooks/useClientRouter';
import StaticExportWrapper from '@/components/StaticExportWrapper';

function TourCalculationsListPageComponent() {
    const { toast } = useToast();
    const [allCalculations, setAllCalculations] = useState<SavedCalculation[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
    const router = useClientRouter();

    useEffect(() => {
        const unsubscribe = listenToSavedCalculations(setAllCalculations);
        return () => unsubscribe();
    }, []);

    const handleRowClick = (id: string) => {
        router.push(`/tour/calculator/${id}`);
    };
    
    const calculationsByMonth = useMemo(() => {
        const filtered = allCalculations.filter(c => selectedYear === null || getYear(c.savedAt) === selectedYear);
        return filtered.reduce((acc, calc) => {
            const month = getMonth(calc.savedAt);
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(calc);
            return acc;
        }, {} as Record<number, SavedCalculation[]>);
    }, [allCalculations, selectedYear]);

    const handleDeleteCalculation = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the calculation "${name}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await deleteCalculation(id);
            toast({
                title: "Calculation Deleted",
                description: `Successfully deleted "${name}".`,
            });
        } catch (error) {
            console.error("Error deleting calculation:", error);
            toast({
                title: "Error",
                description: "Could not delete the calculation.",
                variant: "destructive",
            });
        }
    };
    
    const YearSelector = () => {
        const years = [...new Set(allCalculations.map(c => getYear(c.savedAt)))].sort((a,b) => b-a);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{selectedYear ? `ປີ ${selectedYear + 543}` : 'ທຸກໆປີ'}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => setSelectedYear(null)}>
                        ທຸກໆປີ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {years.map(year => (
                        <DropdownMenuItem key={year} onClick={() => setSelectedYear(year)}>
                            {`ປີ ${year + 543}`}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const renderCalculationRows = (calculations: SavedCalculation[]) => (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ວັນທີບັນທຶກ</TableHead>
                    <TableHead>Group Code</TableHead>
                    <TableHead>ໂປຣແກຣມ</TableHead>
                    <TableHead>ຈຸດໝາຍ</TableHead>
                    <TableHead className="text-right">ຈຳນວນຄົນ</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {calculations.map(calc => (
                <TableRow key={calc.id} className="group cursor-pointer" onClick={() => handleRowClick(calc.id)}>
                    <TableCell>
                        {calc.savedAt ? format(calc.savedAt, "dd/MM/yyyy HH:mm") : 'N/A'}
                    </TableCell>
                    <TableCell>{calc.tourInfo.groupCode}</TableCell>
                    <TableCell className="font-medium">{calc.tourInfo.program}</TableCell>
                    <TableCell>{calc.tourInfo.destinationCountry}</TableCell>
                    <TableCell className="text-right">{calc.tourInfo.numPeople}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>ການດຳເນີນການ</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleRowClick(calc.id)}>
                                    ເບິ່ງ/ແກ້ໄຂ
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCalculation(calc.id, calc.tourInfo.groupCode)
                                    }}
                                >
                                    ລົບ
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
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight font-headline">ລາຍການຄຳນວນທັງໝົດ</h1>
                </div>
                 <div className="ml-auto flex items-center gap-4">
                    <YearSelector />
                    <Link href="/tour/calculator/new">
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            ເພີ່ມການຄຳນວນໃໝ່
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardContent className="p-0">
                         {Object.keys(calculationsByMonth).length > 0 ? (
                            <Accordion type="single" collapsible className="w-full" defaultValue="month-0">
                                {Object.entries(calculationsByMonth)
                                .sort(([a], [b]) => Number(b) - Number(a))
                                .map(([month, calcs]) => (
                                <AccordionItem value={`month-${month}`} key={month}>
                                    <AccordionTrigger className="bg-muted/50 px-4 rounded-md text-base font-semibold">
                                        {format(new Date(selectedYear || 0, Number(month)), 'LLLL yyyy')}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {renderCalculationRows(calcs)}
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>
                         ) : (
                            <div className="text-center text-muted-foreground py-16">
                                <p>No calculations found for the selected year.</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default function TourCalculationsListPage() {
    return (
        <StaticExportWrapper>
            <TourCalculationsListPageComponent />
        </StaticExportWrapper>
    )
}

    