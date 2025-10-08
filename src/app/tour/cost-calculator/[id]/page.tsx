
import type { Metadata } from 'next';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SavedCalculation } from './client-page';
import TourCalculatorClientPage from './client-page';

export const dynamic = "force-static";
export const dynamicParams = true;

async function getTourCostCalculation(id: string): Promise<SavedCalculation | null> {
    const firestore = getFirestore(db.app);
    const docRef = doc(firestore, 'tourCalculations', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Timestamps to serializable format (ISO string)
        const tourInfo = data.tourInfo || {};
        if (tourInfo.startDate) tourInfo.startDate = tourInfo.startDate.toDate().toISOString();
        if (tourInfo.endDate) tourInfo.endDate = tourInfo.endDate.toDate().toISOString();

        const allCosts = data.allCosts || {};
        const processDateFields = (items: any[]) => {
          return items?.map(item => {
            if (item.checkInDate) item.checkInDate = item.checkInDate.toDate().toISOString();
            if (item.departureDate) item.departureDate = item.departureDate.toDate().toISOString();
            return item;
          }) || [];
        }
        allCosts.accommodations = processDateFields(allCosts.accommodations);
        allCosts.flights = processDateFields(allCosts.flights);
        allCosts.trainTickets = processDateFields(allCosts.trainTickets);

        return {
            id: docSnap.id,
            tourInfo,
            allCosts,
            exchangeRates: data.exchangeRates,
            profitPercentage: data.profitPercentage,
            savedAt: data.savedAt?.toDate().toISOString(),
        } as SavedCalculation;
    } else {
        return null;
    }
}


export async function generateStaticParams() {
  try {
    const firestore = getFirestore(db.app);
    const calculationsColRef = collection(firestore, 'tourCalculations');
    const snapshot = await getDocs(calculationsColRef);
    const ids = snapshot.docs.map(doc => ({ id: doc.id }));
    
    // Add a 'default' param if no calculations are found to avoid build errors.
    if (ids.length === 0) {
      return [{ id: 'default' }];
    }
    return ids;
  } catch (error) {
    console.error("Error fetching static params for tour calculations:", error);
    return [{ id: 'default' }];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (params.id === 'default') {
      return { title: 'Tour Calculation' };
  }

  const calculation = await getTourCostCalculation(params.id);
  
  if (!calculation) {
    return { title: 'Calculation Not Found' };
  }

  return {
    title: `Calculation: ${calculation.tourInfo?.groupCode || 'Untitled'}`,
    description: `Cost calculation for tour: ${calculation.tourInfo?.program || ''}`,
  };
}

export default async function TourCalculatorPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (id === 'default') {
      return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-2xl font-semibold mb-4">Loading Calculation...</p>
                <p>This is a placeholder page for static export.</p>
            </div>
      );
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
