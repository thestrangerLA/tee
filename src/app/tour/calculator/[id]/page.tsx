
import { getCalculation, getAllCalculations } from '@/services/tourCalculatorService';
import TourCalculatorClientPage from './client-page';
import { Suspense } from 'react';


// This allows Next.js to know all possible IDs at build time
export async function generateStaticParams() {
  const calculations = await getAllCalculations();
 
  return calculations.map((calc) => ({
    id: calc.id,
  }))
}

async function getCalculationData(id: string) {
    const calculation = await getCalculation(id);
    if (!calculation) {
        return null;
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
