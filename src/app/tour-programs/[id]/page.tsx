

import { getTourProgram, getAllTourPrograms } from '@/services/tourProgramService';
import TourProgramClientPage from './client-page';
import StaticExportWrapper from '@/components/StaticExportWrapper';

export async function generateStaticParams() {
    const programs = await getAllTourPrograms();
    return programs.map((program) => ({
        id: program.id,
    }));
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

    return (
        <StaticExportWrapper>
            <TourProgramClientPage initialProgram={programData} />
        </StaticExportWrapper>
    )
}
