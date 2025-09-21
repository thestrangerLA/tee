
import { getCalculation, getAllCalculations, saveCalculation } from '@/services/tourCalculatorService';
import TourCalculatorClientPage from './client-page';
import { Suspense } from 'react';
import type { SavedCalculation } from '@/lib/types';


// This tells Next.js to always render this page dynamically on the server
export const dynamic = 'force-dynamic';

// This allows Next.js to know all possible IDs at build time for initial generation
export async function generateStaticParams() {
  const calculations = await getAllCalculations();
 
  const staticParams = calculations.map((calc) => ({
    id: calc.id,
  }));

  // Ensure the 'default' param is always included
  if (!staticParams.some(p => p.id === 'default')) {
      staticParams.push({ id: 'default' });
  }
  
  return staticParams;
}

async function getCalculationData(id: string) {
    let calculation = await getCalculation(id);
    if (!calculation && id === 'default') {
        const newCalculationData: Omit<SavedCalculation, 'id'| 'savedAt'> = {
            tourInfo: {
                mouContact: '',
                groupCode: 'Default Group',
                destinationCountry: '',
                program: 'Default Calculation',
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
        // The saveCalculation function in the original service returns the new ID,
        // but we need to create it with a *specific* ID ('default').
        // This requires a modification to how we save, or we assume it exists.
        // For now, we'll return the new structure and the client page will handle it.
        // A better approach would be a `getOrCreate` service function.
        // Let's create it on the fly.
        await saveCalculation(newCalculationData, 'default');
        calculation = await getCalculation(id);
    }
    return calculation;
}

function LoadingFallback() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading Calculation...</p>
        </div>
    );
}

export default async function TourProgramPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const calculationData = await getCalculationData(id);

    if (!calculationData) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>ບໍ່ພົບຂໍ້ມູນການຄຳນວນ</p>
             </div>
        )
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <TourCalculatorClientPage initialCalculation={calculationData} />
        </Suspense>
    );
}
