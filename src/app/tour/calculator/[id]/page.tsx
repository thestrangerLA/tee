
import { getCalculation, getAllCalculations } from '@/services/tourCalculatorService';
import TourCalculatorClientPage from './client-page';

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

    return <TourCalculatorClientPage initialCalculation={calculationData} />;
}
