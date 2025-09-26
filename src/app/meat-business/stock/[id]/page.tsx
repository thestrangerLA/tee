
import type { Metadata } from 'next';
import { getAllMeatStockItemIds, getMeatStockItem } from '@/services/meatStockService';
import MeatStockClientPage from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamicParams = false;

// This function tells Next.js which pages to build at build time.
export async function generateStaticParams() {
  const ids = await getAllMeatStockItemIds();
  return ids;
}

// Optional: Generate metadata for each page
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
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
  const item = await getMeatStockItem(id);

  if (!item) {
    if (id === 'default') {
        return (
             <div className="flex justify-center items-center h-screen">
                <p>This is a default placeholder page. No stock items found.</p>
            </div>
        )
    }
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Stock Item not found</h1>
        </div>
    );
  }

  return <MeatStockClientPage initialItem={item} />;
}
