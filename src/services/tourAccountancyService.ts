
import { db } from '@/lib/firebase';
import type { TourAccountSummary } from '@/lib/types';
import { 
    doc, 
    onSnapshot, 
    setDoc,
    getDoc
} from 'firebase/firestore';

const summaryDocRef = doc(db, 'tour-accountSummary', 'latest');

const initialSummaryState: Omit<TourAccountSummary, 'id'> = {
    capital: { kip: 0, baht: 0, usd: 0, cny: 0 },
    balance: { kip: 0, baht: 0, usd: 0, cny: 0 },
};

// Function to ensure an initial state exists
const ensureInitialState = async () => {
    const docSnap = await getDoc(summaryDocRef);
    if (!docSnap.exists()) {
        await setDoc(summaryDocRef, initialSummaryState);
    }
};

export const listenToTourAccountSummary = (callback: (summary: TourAccountSummary | null) => void) => {
    ensureInitialState();
    
    const unsubscribe = onSnapshot(summaryDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback({
                id: docSnapshot.id,
                capital: data.capital || { kip: 0, baht: 0, usd: 0, cny: 0 },
                balance: data.balance || { kip: 0, baht: 0, usd: 0, cny: 0 },
            });
        } else {
            callback({ id: 'latest', ...initialSummaryState });
        }
    });
    return unsubscribe;
};

export const updateTourAccountSummary = async (summary: Partial<Omit<TourAccountSummary, 'id'>>) => {
    await setDoc(summaryDocRef, summary, { merge: true });
};
