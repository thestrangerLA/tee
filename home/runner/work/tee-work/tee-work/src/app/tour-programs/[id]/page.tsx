
import type { Metadata } from 'next';
import { getAllTourProgramIds, getTourProgram } from '@/services/tourProgramService';
import TourProgramClientPage from './client-page';
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
  if (params.id === 'default') {
      return { title: 'Tour Program' };
  }

  const program = await getTourProgram(params.id);
  
  if (!program) {
    return {
      title: 'Tour Program Not Found',
    }
  }

  return {
    title: `Tour: ${program.programName}`,
    description: `Details for tour program: ${program.programName}`,
  }
}

// Page component
export default async function TourProgramPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = params;

  if (id === 'default') {
      return (
           <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-2xl font-semibold mb-4">Loading Program...</p>
                <p>Please wait while we fetch the details.</p>
            </div>
      )
  }
  
  const program = await getTourProgram(id);

  if (!program) {
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Tour Program not found</h1>
        </div>
    );
  }

  return <TourProgramClientPage initialProgram={program} />;
}

    
