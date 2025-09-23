
import { getCalculation, getAllCalculations, saveCalculation } from '@/services/knCalculatorService';
import KNCalculatorClientPage from './client-page';
import type { SavedCalculation } from '@/lib/types';
import StaticExportWrapper from '@/components/StaticExportWrapper';

export const dynamicParams = true; // Allow new pages to be generated

export async function generateStaticParams() {
    const calculations = await getAllCalculations();
    const params = calculations.map((calc) => ({
        id: calc.id,
    }));
    // Ensure 'new' is not treated as a static param if it's a route
    return params.filter(p => p.id !== 'new');
}


async function getCalculationData(id: string): Promise<SavedCalculation | null> {
    if (id === 'new') {
        return null;
    }
    let calculation = await getCalculation(id);
    if (!calculation) {
        // You might want to return null and handle the "not found" case in the page component
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
    
    if (id === 'new') {
        // This case should be handled by the `new` page route, but as a fallback
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>Redirecting to create a new calculation...</p>
             </div>
        )
    }

    const calculationData = await getCalculationData(id);

    if (!calculationData) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>ບໍ່ພົບຂໍ້ມູນການຄຳນວນ</p>
             </div>
        )
    }

    return (
        <StaticExportWrapper fallback={<LoadingFallback/>}>
            <KNCalculatorClientPage initialCalculation={calculationData} />
        </StaticExportWrapper>
    );
}
