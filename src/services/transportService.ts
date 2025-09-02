
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
    where,
    getDocs
} from 'firebase/firestore';
import { startOfDay } from 'date-fns';

const transportCollectionRef = collection(db, 'transportEntries');

const createInitialRowState = (type: 'ANS' | 'HAL' | 'MX', date: Date): Omit<TransportEntry, 'id' | 'createdAt'> => ({
    type: type,
    date: startOfDay(date), // Default to today
    detail: '',
    cost: 0,
    amount: 0,
    finished: false,
});


export const listenToTransportEntries = (callback: (items: TransportEntry[]) => void) => {
    const q = query(transportCollectionRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries: TransportEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp).toDate(),
                createdAt: (data.createdAt as Timestamp)?.toDate() 
            } as TransportEntry);
        });
        callback(entries);
    });
    return unsubscribe;
};

export const addTransportEntry = async (type: 'ANS' | 'HAL' | 'MX', date: Date) => {
    const newEntry = createInitialRowState(type, date);
    await addDoc(transportCollectionRef, {
        ...newEntry,
        date: Timestamp.fromDate(newEntry.date),
        createdAt: serverTimestamp()
    });
};

export const updateTransportEntry = async (id: string, updatedFields: Partial<Omit<TransportEntry, 'id' | 'createdAt'>>) => {
    const transportDoc = doc(db, 'transportEntries', id);
    
    if (updatedFields.date && updatedFields.date instanceof Date) {
        const { date, ...rest } = updatedFields;
        await updateDoc(transportDoc, { ...rest, date: Timestamp.fromDate(date) });
    } else {
        await updateDoc(transportDoc, updatedFields);
    }
};

export const deleteTransportEntry = async (id: string) => {
    const transportDoc = doc(db, 'transportEntries', id);
    await deleteDoc(transportDoc);
};
