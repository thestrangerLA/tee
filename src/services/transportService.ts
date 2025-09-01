
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

const createInitialRowState = (type: 'ANS' | 'HAL' | 'MX'): Omit<TransportEntry, 'id' | 'createdAt'> => ({
    type: type,
    date: '',
    cost: 0,
    amount: 0,
    finished: false,
});


export const listenToTransportEntries = (callback: (items: TransportEntry[]) => void) => {
    const q = query(transportCollectionRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries: TransportEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({ 
                id: doc.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() 
            } as TransportEntry);
        });
        callback(entries);
    });
    return unsubscribe;
};

export const addTransportEntry = async (type: 'ANS' | 'HAL' | 'MX') => {
    await addDoc(transportCollectionRef, {
        ...createInitialRowState(type),
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
