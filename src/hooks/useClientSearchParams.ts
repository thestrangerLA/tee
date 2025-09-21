
"use client";

import { useState, useEffect } from 'react';

export const useClientSearchParams = () => {
    const [params, setParams] = useState(new URLSearchParams());

    useEffect(() => {
        // This code runs only on the client, after the component has mounted.
        setParams(new URLSearchParams(window.location.search));
    }, []);

    return params;
};
