
import { getTourProgram, getAllTourPrograms } from '@/services/tourProgramService';
import TourProgramClientPage from './client-page';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const programs = await getAllTourPrograms();
 
  return programs.map((program) => ({
    id: program.id,
  }))
}

async function getProgramData(id: string) {
    const program = await getTourProgram(id);
    if (!program) {
        // In a real app, you might want to return notFound() from 'next/navigation'
        // For static export, we assume all params generate a valid page.
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
