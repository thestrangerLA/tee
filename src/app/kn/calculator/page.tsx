
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator, PlusCircle, MoreHorizontal, ChevronDown, Calendar as CalendarIcon, Filter, Trash2 } from "lucide-react";
import { listenToSavedCalculations, deleteCalculation } from '@/services/knCalculatorService';
import type { SavedCalculation } from '@/lib/types';
import { format } from 'date-fns';
import { lo } from 'date-fns/locale';
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
import { Input } from '@/components/ui/input';

export default function KNCalculationsListPage() {
    const { toast } = useToast();
    const [allCalculations, setAllCalculations] = useState<SavedCalculation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = listenToSavedCalculations(setAllCalculations);
        return () => unsubscribe();
    }, []);

    const handleRowClick = (id: string) => {
        router.push(`/kn/calculator/${id}`);
    };
    
    const filteredCalculations = useMemo(() => {
        return allCalculations.filter(p =>
            (p.tourInfo.program?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (p.tourInfo.groupCode?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    }, [allCalculations, searchQuery]);


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
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/kn">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">ກັບໄປໜ້າຫຼັກ</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight font-headline">ລາຍການຄຳນວນທັງໝົດ (KN)</h1>
                </div>
                 <div className="ml-auto flex items-center gap-4">
                    <Input 
                        placeholder="Search by Program or Group Code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Link href="/kn/calculator/new">
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
                         {filteredCalculations.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Saved At</TableHead>
                                        <TableHead>Program Name</TableHead>
                                        <TableHead>Group Code</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead className="text-right">Pax</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {filteredCalculations.map(calc => (
                                    <TableRow key={calc.id} onClick={() => handleRowClick(calc.id)} className="cursor-pointer">
                                        <TableCell>{format(calc.savedAt, "dd MMM yyyy, HH:mm")}</TableCell>
                                        <TableCell className="font-medium">{calc.tourInfo.program}</TableCell>
                                        <TableCell>{calc.tourInfo.groupCode}</TableCell>
                                        <TableCell>{calc.tourInfo.destinationCountry}</TableCell>
                                        <TableCell className="text-right">{calc.tourInfo.numPeople}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleRowClick(calc.id)}>View/Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCalculation(calc.id, calc.tourInfo.program);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                         ) : (
                            <div className="text-center text-muted-foreground py-16">
                                <p>No calculations found.</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

    