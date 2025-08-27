
import { db } from '@/lib/firebase';
import type { CashCalculatorState } from '@/lib/types';
import { 
    doc, 
    onSnapshot, 
    setDoc,
    getDoc
} from 'firebase/firestore';

const calculatorStateDocRef = doc(db, 'cashCalculatorState', 'latest');

const denominations = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
const initialCounts: Record<string, number> = { baht: 0, rate: 0 };
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

export const listenToCalculatorState = (callback: (state: CashCalculatorState) => void) => {
    ensureInitialState();
    
    const unsubscribe = onSnapshot(calculatorStateDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            callback({ id: docSnapshot.id, ...docSnapshot.data() } as CashCalculatorState);
        } else {
             callback({ id: 'latest', ...initialCalculatorState });
        }
    });
    return unsubscribe;
};

export const updateCalculatorState = async (newState: Partial<CashCalculatorState>) => {
    await setDoc(calculatorStateDocRef, newState, { merge: true });
};
