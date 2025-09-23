
"use client";

import { useCallback } from 'react';

// This is a simplified router for static export that uses the window.location object.
export const useClientRouter = () => {
    const push = useCallback((path: string) => {
        window.location.href = path;
    }, []);

    const replace = useCallback((path: string) => {
        window.location.replace(path);
    }, []);

    return { push, replace };
};
