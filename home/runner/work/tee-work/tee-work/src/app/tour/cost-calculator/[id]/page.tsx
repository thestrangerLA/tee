
import type { Metadata } from 'next';
import { getTourCostCalculation } from '@/services/tourProgramService';
import TourCalculatorClientPage from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamicParams = true; // Allow new pages to be generated on demand

export async function generateStaticParams() {
  // We will only pre-build a 'default' page.
  // Other pages will be generated on-demand at request time.
  return [{ id: 'default' }];
}

// Optional: Generate metadata for each page
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  if (params.id === 'default') {
      return { title: 'Tour Calculation' };
  }

  const calculation = await getTourCostCalculation(params.id);
  
  if (!calculation) {
    return {
      title: 'Calculation Not Found',
    }
  }

  return {
    title: `Calculation: ${calculation.tourInfo?.groupCode || 'Untitled'}`,
    description: `Cost calculation for tour: ${calculation.tourInfo?.program || ''}`,
  }
}

// Page component (Server Component)
export default async function TourCalculatorPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = params;

  // Handle the 'default' case for static export, which doesn't fetch data
  if (id === 'default') {
      return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-2xl font-semibold mb-4">Loading Calculation...</p>
                <p>Please wait while we fetch the details.</p>
            </div>
      )
  }
  
  const calculation = await getTourCostCalculation(id);

  if (!calculation) {
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Calculation not found</h1>
        </div>
    );
  }

  return <TourCalculatorClientPage initialCalculation={calculation} />;
}
