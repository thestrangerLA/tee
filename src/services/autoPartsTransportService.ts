

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
    writeBatch
} from 'firebase/firestore';
import { startOfDay } from 'date-fns';

const transportCollectionRef = collection(db, 'autoparts-transportEntries');

export const listenToAutoPartsTransportEntries = (callback: (items: TransportEntry[]) => void) => {
    const q = query(transportCollectionRef, orderBy('date', 'desc'), orderBy('order', 'asc'));
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

export const addMultipleAutoPartsTransportEntries = async (entries: Omit<TransportEntry, 'id'|'createdAt'|'date'>[], entryDate: Date, company: 'ANS' | 'HAL' | 'MX', order: number) => {
    const batch = writeBatch(db);
    const date = startOfDay(entryDate);

    entries.forEach(entry => {
        const docRef = doc(transportCollectionRef);
        batch.set(docRef, {
            ...entry,
            date: Timestamp.fromDate(date),
            type: company,
            order: order,
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();
}

export const updateAutoPartsTransportEntry = async (id: string, updatedFields: Partial<Omit<TransportEntry, 'id' | 'createdAt'>>) => {
    const transportDoc = doc(db, 'autoparts-transportEntries', id);
    
    if (updatedFields.date && updatedFields.date instanceof Date) {
        const { date, ...rest } = updatedFields;
        await updateDoc(transportDoc, { ...rest, date: Timestamp.fromDate(date) });
    } else {
        await updateDoc(transportDoc, updatedFields);
    }
};

export const deleteAutoPartsTransportEntry = async (id: string) => {
    const transportDoc = doc(db, 'autoparts-transportEntries', id);
    await deleteDoc(transportDoc);
};

