
import { db } from '@/lib/firebase';
import type { DrugCreditorEntry } from '@/lib/types';
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
    where
} from 'firebase/firestore';
import { startOfDay } from 'date-fns';

const collectionRef = collection(db, 'drugCreditorEntries');

export const listenToDrugCreditorEntries = (callback: (items: DrugCreditorEntry[]) => void, date: Date) => {
    const q = query(
        collectionRef, 
        where("date", "==", Timestamp.fromDate(startOfDay(date)))
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries: DrugCreditorEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp).toDate(),
                createdAt: (data.createdAt as Timestamp)?.toDate()
            } as DrugCreditorEntry);
        });
        // Sort on the client-side to avoid needing a composite index
        const sortedEntries = entries.sort((a, b) => a.order - b.order);
        callback(sortedEntries);
    });
    return unsubscribe;
};

export const addDrugCreditorEntry = async (entry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date'>, date: Date) => {
    const entryWithTimestamp = {
        ...entry,
        date: Timestamp.fromDate(startOfDay(date)),
        createdAt: serverTimestamp()
    };
    await addDoc(collectionRef, entryWithTimestamp);
};

export const updateDrugCreditorEntry = async (id: string, updatedFields: Partial<Omit<DrugCreditorEntry, 'id' | 'createdAt'>>) => {
    const entryDoc = doc(db, 'drugCreditorEntries', id);
     if (updatedFields.date && updatedFields.date instanceof Date) {
        const { date, ...rest } = updatedFields;
        const newDate = startOfDay(date as Date);
        await updateDoc(entryDoc, { ...rest, date: Timestamp.fromDate(newDate) });
    } else {
        await updateDoc(entryDoc, updatedFields);
    }
};

export const deleteDrugCreditorEntry = async (id: string) => {
    const entryDoc = doc(db, 'drugCreditorEntries', id);
    await deleteDoc(entryDoc);
};
