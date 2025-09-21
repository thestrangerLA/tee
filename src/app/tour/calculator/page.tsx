

"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer needed as the user wants to go directly to the calculator.
// We redirect to create a new one.
export default function TourCalculationsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/tour/calculator/new');
    }, [router]);

    return null; 
}
