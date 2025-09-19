
"use client"

import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { saveCalculation } from '@/services/tourCalculatorService';
import type { SavedCalculation } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';

// This is a server-side action page to create a new calculation
// It immediately creates a new record in the database and then redirects
// the user to the specific page for that calculation.
export default function NewCalculationPage() {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const createNewCalculation = async () => {
            const newCalculationData: Omit<SavedCalculation, 'id'| 'savedAt'> = {
                tourInfo: {
                    mouContact: '',
                    groupCode: `NewCalc-${uuidv4().substring(0, 4)}`,
                    destinationCountry: '',
                    program: 'New Calculation',
                    startDate: new Date(),
                    endDate: new Date(),
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
                }
            };
            
            try {
                const newId = await saveCalculation(newCalculationData);
                 toast({
                    title: "ສ້າງລາຍການຄຳນວນໃໝ່ສຳເລັດ",
                    description: "ກຳລັງໄປທີ່ໜ້າລາຍລະອຽດ...",
                });
                router.replace(`/tour/calculator/${newId}`);
            } catch (error) {
                 toast({
                    title: "ເກີດຂໍ້ຜິດພາດ",
                    description: "ບໍ່ສາມາດສ້າງລາຍການຄຳນວນໃໝ່ໄດ້",
                    variant: "destructive",
                });
                console.error("Failed to create new calculation:", error);
                router.back();
            }
        };

        createNewCalculation();
    }, [router, toast]);
    
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <p>ກຳລັງສ້າງລາຍການຄຳນວນໃໝ່...</p>
        </div>
    );
}
