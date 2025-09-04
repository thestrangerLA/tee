
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
    Timestamp
} from 'firebase/firestore';
import { startOfDay } from 'date-fns';

const collectionRef = collection(db, 'drugCreditorEntries');

export const listenToDrugCreditorEntries = (callback: (items: DrugCreditorEntry[]) => void) => {
    const q = query(collectionRef, orderBy('date', 'desc'));
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
        callback(entries);
    });
    return unsubscribe;
};

export const addDrugCreditorEntry = async (entry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'isPaid'>) => {
    const entryWithTimestamp = {
        ...entry,
        cost: entry.cost || 0,
        sellingPrice: entry.sellingPrice || 0,
        isPaid: false,
        date: Timestamp.fromDate(entry.date),
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

    
