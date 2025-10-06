
import type { Metadata } from 'next';
import { getAllMeatStockItemIds, getMeatStockItem } from '@/services/meatStockService';
import MeatStockClientPage from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamicParams = true; // Allow new pages to be generated on demand

// This function tells Next.js which pages to build at build time.
export async function generateStaticParams() {
  // We will only pre-build a 'default' page.
  // Other pages will be generated on-demand at request time.
  return [{ id: 'default' }];
}

// Optional: Generate metadata for each page
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  // Avoid fetching data here if it's for a 'default' build page
  if (params.id === 'default') {
    return { title: 'Stock Item' };
  }
  
  const item = await getMeatStockItem(params.id);
  
  if (!item) {
    return {
      title: 'Stock Item Not Found',
    }
  }

  return {
    title: `Stock: ${item.name}`,
    description: `Details for stock item: ${item.name}`,
  }
}

// Page component (Server Component)
export default async function MeatStockPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = params;

  // Handle the 'default' case for static export
  if (id === 'default') {
      return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-2xl font-semibold mb-4">Loading Stock Item...</p>
                <p>Please wait while we fetch the details.</p>
            </div>
      )
  }
  
  const item = await getMeatStockItem(id);

  if (!item) {
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Stock Item not found</h1>
        </div>
    );
  }

  return <MeatStockClientPage initialItem={item} />;
}
