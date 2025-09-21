

import { getTourProgram, getAllTourPrograms } from '@/services/tourProgramService';
import TourProgramClientPage from './client-page';

// export const dynamic = 'force-static';
export const revalidate = 0; // Revalidate every 0 seconds (on every request)

export async function generateStaticParams() {
  // This function is still useful for initial builds, 
  // but revalidate=0 ensures new pages also work.
  const programs = await getAllTourPrograms();
 
  return programs.map((program) => ({
    id: program.id,
  }))
}

async function getProgramData(id: string) {
    const program = await getTourProgram(id);
    if (!program) {
        return null;
    }
    return program;
}

export default async function TourProgramPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const programData = await getProgramData(id);

    if (!programData) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <p>ບໍ່ພົບຂໍ້ມູນໂປຣແກຣມທົວ</p>
             </div>
        )
    }

    return <TourProgramClientPage initialProgram={programData} />;
}
