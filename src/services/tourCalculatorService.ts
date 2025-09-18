import { db } from '@/lib/firebase';
import type { SavedCalculation } from '@/lib/types';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    doc, 
    updateDoc, 
    deleteDoc, 
    orderBy,
    serverTimestamp,
    Timestamp,
    getDoc
} from 'firebase/firestore';

const calculationsCollectionRef = collection(db, 'tourCalculations');

// Helper to convert Firestore timestamps in nested objects to JS Dates
const convertTimestampsToDates = (data: any): any => {
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            convertTimestampsToDates(data[key]);
        }
    }
    return data;
};

export const listenToSavedCalculations = (callback: (items: SavedCalculation[]) => void) => {
    const q = query(calculationsCollectionRef, orderBy('savedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: SavedCalculation[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const convertedData = convertTimestampsToDates(data);
            items.push({ 
                id: doc.id,
                ...convertedData,
            } as SavedCalculation);
        });
        callback(items);
    });
    return unsubscribe;
};

export const getCalculation = async (id: string): Promise<SavedCalculation | null> => {
    const docRef = doc(calculationsCollectionRef, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const convertedData = convertTimestampsToDates(data);
        return { id: docSnap.id, ...convertedData } as SavedCalculation;
    }
    return null;
}

export const saveCalculation = async (calculation: Omit<SavedCalculation, 'id' | 'savedAt'>): Promise<string> => {
    // A more robust implementation might check if a calculation with the same group code exists and update it instead.
    // For now, we add a new one each time.
    const docRef = await addDoc(calculationsCollectionRef, {
        ...calculation,
        savedAt: serverTimestamp()
    });
    return docRef.id;
};

export const deleteCalculation = async (id: string) => {
    const docRef = doc(calculationsCollectionRef, id);
    await deleteDoc(docRef);
};
