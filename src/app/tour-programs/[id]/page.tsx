// app/tour-programs/[id]/page.tsx
// Replace your entire file with this minimal version first

export async function generateStaticParams() {
    console.log('generateStaticParams called');
    return [
        { id: 'test-1' },
        { id: 'test-2' },
        { id: 'test-3' }
    ];
}

export default function TourProgramPage({ 
    params 
}: { 
    params: { id: string } 
}) {
    return (
        <div>
            <h1>Tour Program: {params.id}</h1>
            <p>This is a test page</p>
        </div>
    );
}
