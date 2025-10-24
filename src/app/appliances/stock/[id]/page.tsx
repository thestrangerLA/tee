
import type { Metadata } from 'next';
import { getAllApplianceStockItemIds, getApplianceStockItem } from '@/services/applianceStockService';
import ApplianceStockClientPage from './client-page';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const ids = await getAllApplianceStockItemIds();
    if (ids.length === 0) {
      return [{ id: 'default' }];
    }
    return ids;
  } catch (error) {
    console.error("Error fetching static params for appliance stock:", error);
    return [{ id: 'default' }];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (params.id === 'default') {
      return { title: 'Stock Item' };
  }
  const item = await getApplianceStockItem(params.id);
  
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

export default async function ApplianceStockDetailPage({ 
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
  
  const item = await getApplianceStockItem(id);

  if (!item) {
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Stock Item not found</h1>
        </div>
    );
  }

  return <ApplianceStockClientPage initialItem={item} />;
}
