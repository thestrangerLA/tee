
"use client";

import { useCallback } from 'react';

// This is a simplified router for static export that uses the window.location object.
export const useClientRouter = () => {
    const push = useCallback((path: string) => {
        // For static export, direct navigation is needed.
        // In a standard Next.js app, you would use next/navigation.
        if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    }, []);

    const replace = useCallback((path: string) => {
        if (typeof window !== 'undefined') {
            window.location.replace(path);
        }
    }, []);

    return { push, replace };
};
