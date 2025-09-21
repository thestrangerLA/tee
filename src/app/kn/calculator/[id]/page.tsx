

import { getCalculation, getAllCalculations } from '@/services/knCalculatorService';
import KNCalculatorClientPage from './client-page';
import { Suspense } from 'react';

// This tells Next.js to always render this page dynamically on the server
export const dynamic = 'force-dynamic';

// This allows Next.js to know all possible IDs at build time for initial generation
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

export default async function KNProgramPage({ params }: { params: { id: string } }) {
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
            <KNCalculatorClientPage initialCalculation={calculationData} />
        </Suspense>
    );
}
