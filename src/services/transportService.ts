
import { db } from '@/lib/firebase';
import type { TransportEntry } from '@/lib/types';
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
    getDocs
} from 'firebase/firestore';

const transportCollectionRef = collection(db, 'transportEntries');

const initialRowState: Omit<TransportEntry, 'id' | 'createdAt'> = {
    ans_date: '', ans_cost: 0, ans_amount: 0, ans_finished: false,
    hal_date: '', hal_cost: 0, hal_amount: 0, hal_finished: false,
    mx_date: '', mx_cost: 0, mx_amount: 0, mx_finished: false,
};

// Function to ensure at least one entry exists
const ensureInitialEntry = async () => {
    const snapshot = await getDocs(query(transportCollectionRef));
    if (snapshot.empty) {
        await addDoc(transportCollectionRef, {
            ...initialRowState,
            createdAt: serverTimestamp()
        });
    }
};

export const listenToTransportEntries = (callback: (items: TransportEntry[]) => void) => {
    // Ensure there's an initial entry before listening
    ensureInitialEntry();

    const q = query(transportCollectionRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries: TransportEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({ 
                id: doc.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() // Convert Firestore Timestamp to JS Date
            } as TransportEntry);
        });
        callback(entries);
    });
    return unsubscribe;
};

export const addTransportEntry = async () => {
    await addDoc(transportCollectionRef, {
        ...initialRowState,
        createdAt: serverTimestamp()
    });
};

export const updateTransportEntry = async (id: string, updatedFields: Partial<Omit<TransportEntry, 'id' | 'createdAt'>>) => {
    const transportDoc = doc(db, 'transportEntries', id);
    await updateDoc(transportDoc, updatedFields);
};

export const deleteTransportEntry = async (id: string) => {
    const transportDoc = doc(db, 'transportEntries', id);
    await deleteDoc(transportDoc);
};
