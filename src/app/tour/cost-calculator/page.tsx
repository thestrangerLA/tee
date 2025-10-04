
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Calendar as CalendarIcon, Calculator, Pencil, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define the shape of a calculation document from Firestore
export interface SavedCalculation {
    id: string;
    savedAt: any; // Firestore Timestamp
    tourInfo: {
        mouContact?: string;
        groupCode?: string;
        destinationCountry?: string;
        program?: string;
        startDate?: any;
        endDate?: any;
        numDays?: number;
        numNights?: number;
        numPeople?: number;
        travelerInfo?: string;
    };
    allCosts?: any;
}


export default function TourCostCalculatorListPage() {
    const router = useRouter();
    const { toast } = useToast();
    const firestore = getFirestore(db.app);

    const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
    const [calculationsLoading, setCalculationsLoading] = useState(true);

    const [groupedCalculations, setGroupedCalculations] = useState<Record<string, SavedCalculation[]>>({});
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        if (!firestore) return;

        setCalculationsLoading(true);
        const calculationsColRef = collection(firestore, 'tourCalculations');
        const q = query(calculationsColRef, orderBy('savedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const calcs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedCalculation));
            setSavedCalculations(calcs);
            setCalculationsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    const toDate = (date: any): Date | undefined => {
      if (!date) return undefined;
      if (date instanceof Timestamp) {
        return date.toDate();
      }
      return date as Date;
    };

    useEffect(() => {
        if (savedCalculations && savedCalculations.length > 0) {
            const years = [...new Set(savedCalculations.map(c => {
                const savedAtDate = toDate(c.savedAt);
                return savedAtDate ? new Date(savedAtDate).getFullYear().toString() : '';
            }).filter(Boolean))];
            
            const currentYear = new Date().getFullYear().toString();
            if (!years.includes(currentYear)) {
                years.push(currentYear);
            }
            setAvailableYears(years.sort((a, b) => parseInt(b) - parseInt(a)));
        } else {
             setAvailableYears([new Date().getFullYear().toString()]);
        }
    }, [savedCalculations]);

    useEffect(() => {
        if (savedCalculations) {
            const filtered = savedCalculations.filter(c => {
                const savedAtDate = toDate(c.savedAt);
                return savedAtDate ? new Date(savedAtDate).getFullYear().toString() === selectedYear : false;
            });

            const grouped = filtered.reduce((acc, calc) => {
                const savedAtDate = toDate(calc.savedAt);
                if (!savedAtDate) return acc;
                const month = format(new Date(savedAtDate), 'MMMM yyyy');
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push(calc);
                // Calculations are already sorted by Firestore query
                return acc;
            }, {} as Record<string, SavedCalculation[]>);

            const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
                // Sort by date object to handle month and year sorting correctly
                return new Date(b).getTime() - new Date(a).getTime();
            });

            const sortedGroupedCalculations: Record<string, SavedCalculation[]> = {};
            for(const key of sortedGroupKeys) {
                sortedGroupedCalculations[key] = grouped[key];
            }

            setGroupedCalculations(sortedGroupedCalculations);
        } else {
            setGroupedCalculations({});
        }
    }, [savedCalculations, selectedYear]);

    const handleAddNewCalculation = async () => {
        if (!firestore) {
            toast({
                title: "Firestore not available",
                description: "Please try again later.",
                variant: "destructive"
            });
            return;
        }

        const newCalculationData = {
            savedAt: serverTimestamp(),
            tourInfo: {
                mouContact: '',
                groupCode: `LTH${format(new Date(),'yyyyMMddHHmmss')}`,
                destinationCountry: '',
                program: '',
                startDate: null,
                endDate: null,
                numDays: 1,
                numNights: 0,
                numPeople: 1,
                travelerInfo: ''
            },
            allCosts: {
                accommodations: [],
                trips: [],
                flights: [],
                trainTickets: [],
                entranceFees: [],
                meals: [],
                guides: [],
                documents: [],
            },
        };
        const calculationsColRef = collection(firestore, 'tourCalculations');
        const newDocRef = await addDoc(calculationsColRef, newCalculationData);
        if(newDocRef){
          router.push(`/tour/cost-calculator/${newDocRef.id}`);
        }
    };
    
    const navigateToCalculation = (id: string) => {
        router.push(`/tour/cost-calculator/${id}`);
    }
    
    const handleDeleteCalculation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click event
        if (!firestore) {
             toast({ title: "Error", description: "Firestore not available.", variant: "destructive" });
             return;
        }
        if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນການຄຳນວນນີ້?")) {
            const docRef = doc(firestore, 'tourCalculations', id);
            await deleteDoc(docRef);
            toast({
                title: "ລຶບຂໍ້ມູນສຳເລັດ",
                description: "ການຄຳນວນໄດ້ຖືກລຶບອອກແລ້ວ."
            });
        }
    };


    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
             <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-primary px-4 text-primary-foreground sm:px-6">
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Calculator className="h-6 w-6"/>
                        ລາຍການຄຳນວນຕົ້ນທຶນທັງໝົດ
                    </h1>
                </div>
                 <div className="flex items-center gap-2">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5"/>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[120px] bg-primary text-primary-foreground border-primary-foreground">
                                <SelectValue placeholder="ເລືອກປີ" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year}>ປີ {parseInt(year) + 543}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                    <Button onClick={handleAddNewCalculation}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ເພີ່ມການຄຳນວນໃໝ່
                    </Button>
                </div>
            </header>
            <main className="flex w-full flex-1 flex-col gap-8 p-4 sm:px-6 sm:py-4">
                 <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-4">
                     {calculationsLoading ? (
                        <Card>
                            <CardContent className="p-10 text-center text-muted-foreground">
                                <p>Loading calculations...</p>
                            </CardContent>
                        </Card>
                     ) : Object.keys(groupedCalculations).length > 0 ? (
                        <Accordion type="multiple" defaultValue={Object.keys(groupedCalculations)} className="w-full space-y-4">
                            {Object.entries(groupedCalculations).map(([month, calcs]) => (
                                <AccordionItem value={month} key={month} className="border-none">
                                     <Card className="overflow-hidden">
                                        <AccordionTrigger className="px-6 py-4 bg-card hover:no-underline">
                                            <h2 className="text-lg font-semibold">{month}</h2>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/50">
                                                        <tr className="text-left">
                                                            <th className="p-3 font-medium">ວັນທີບັນທຶກ</th>
                                                            <th className="p-3 font-medium">Group Code</th>
                                                            <th className="p-3 font-medium">ໂປຣແກຣມ</th>
                                                            <th className="p-3 font-medium">ຈຸດໝາຍ</th>
                                                            <th className="p-3 font-medium">ຈຳນວນຄົນ</th>
                                                            <th className="p-3 font-medium text-right">ການກະທຳ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {calcs.map(calc => {
                                                            const savedAtDate = toDate(calc.savedAt);
                                                            return (
                                                            <tr key={calc.id} className="border-b border-muted/50 last:border-b-0 cursor-pointer hover:bg-muted/30" onClick={() => navigateToCalculation(calc.id)}>
                                                                <td className="p-3">{savedAtDate ? format(savedAtDate, 'dd/MM/yyyy') : '...'}</td>
                                                                <td className="p-3">{calc.tourInfo?.groupCode}</td>
                                                                <td className="p-3">{calc.tourInfo?.program}</td>
                                                                <td className="p-3">{calc.tourInfo?.destinationCountry}</td>
                                                                <td className="p-3">{calc.tourInfo?.numPeople}</td>
                                                                <td className="p-3 text-right">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigateToCalculation(calc.id); }}>
                                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDeleteCalculation(e, calc.id)}>
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                         <Card>
                            <CardContent className="p-10 text-center text-muted-foreground">
                                <p>ບໍ່ມີຂໍ້ມູນການຄຳນວນໃນປີ {parseInt(selectedYear) + 543}.</p>
                                <p>ກົດ "ເພີ່ມການຄຳນວນໃໝ່" ເພື່ອເລີ່ມຕົ້ນ.</p>
                             </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
