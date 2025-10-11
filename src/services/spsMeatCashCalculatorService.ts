
"use client"

import { db } from '@/lib/firebase';
import type { CashCalculatorState } from '@/lib/types';
import { 
    doc, 
    onSnapshot, 
    setDoc,
    getDoc
} from 'firebase/firestore';

const calculatorStateDocRef = doc(db, 'sps-meat-cashCalculatorState', 'latest');

const denominations = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
const initialCounts: Record<string, number> = { baht: 0, rate: 0, usd: 0, usd_rate: 0 };
denominations.forEach(d => initialCounts[d] = 0);

const initialCalculatorState: Omit<CashCalculatorState, 'id'> = {
    counts: initialCounts
};


// Function to ensure an initial state exists
const ensureInitialState = async () => {
    const docSnap = await getDoc(calculatorStateDocRef);
    if (!docSnap.exists()) {
        await setDoc(calculatorStateDocRef, initialCalculatorState);
    }
};

export const listenToSpsMeatCalculatorState = (callback: (state: CashCalculatorState) => void) => {
    // Call this once at the start to make sure the doc exists if it's the first run.
    ensureInitialState(); 
    
    const unsubscribe = onSnapshot(calculatorStateDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            // Ensure new fields exist
            if (!data.counts.usd) data.counts.usd = 0;
            if (!data.counts.usd_rate) data.counts.usd_rate = 0;
            callback({ id: docSnapshot.id, ...data } as CashCalculatorState);
        } else {
             // This case should ideally not happen after calling ensureInitialState, but it's good practice for resilience.
             callback({ id: 'latest', ...initialCalculatorState });
        }
    });
    return unsubscribe;
};

export const updateSpsMeatCalculatorState = async (newState: Partial<Omit<CashCalculatorState, 'id'>>) => {
    await setDoc(calculatorStateDocRef, newState, { merge: true });
};
