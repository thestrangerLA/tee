// app/tour-programs/[id]/page.tsx

// Tell Next.js which dynamic routes to pre-render at build time
export async function generateStaticParams() {
    console.log('generateStaticParams called');
    // We'll use a static list for now to ensure the build passes.
    // The next step would be to fetch real program IDs here.
    return [
        { id: 'test-1' },
        { id: 'test-2' },
        { id: 'test-3' }
    ];
}

// Your page component
export default function TourProgramPage({ 
    params 
}: { 
    params: { id: string } 
}) {
    const { id } = params

    return (
        <div>
            <h1>Tour Program: {id}</h1>
            <p>This is a test page to confirm the build works.</p>
        </div>
    );
}
