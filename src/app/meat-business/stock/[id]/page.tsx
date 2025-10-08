
import type { Metadata } from 'next';
import { getAllMeatStockItemIds, getMeatStockItem } from '@/services/meatStockService';
import MeatStockClientPage from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-static';
export const dynamicParams = true;

// This function tells Next.js which pages to build at build time.
export async function generateStaticParams() {
  try {
    const ids = await getAllMeatStockItemIds();
    if (ids.length === 0) {
      return [{ id: 'default' }];
    }
    return ids;
  } catch (error) {
    console.error("Error fetching static params for meat stock:", error);
    return [{ id: 'default' }];
  }
}

// Optional: Generate metadata for each page
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
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

  if (id === 'default') {
      return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-2xl font-semibold mb-4">Loading Stock Item...</p>
                <p>This is a placeholder page for static export.</p>
            </div>
      );
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
