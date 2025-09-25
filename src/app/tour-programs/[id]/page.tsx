
import type { Metadata } from 'next';
import { getAllTourProgramIds, getTourProgram } from '@/services/tourProgramService';
import TourProgramClientPage from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamicParams = false;

// This function is required when using "output: export" in next.config.js
export async function generateStaticParams() {
  const ids = await getAllTourProgramIds();
  return ids;
}

// Optional: Generate metadata for each page
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
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
  const program = await getTourProgram(id);

  if (!program) {
    if (id === 'default') {
        return (
             <div className="flex justify-center items-center h-screen">
                <p>This is a default placeholder page. No programs found.</p>
            </div>
        )
    }
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Tour Program not found</h1>
        </div>
    );
  }

  return <TourProgramClientPage initialProgram={program} />;
}

    