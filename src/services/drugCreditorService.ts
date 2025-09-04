
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
    where,
    startAt,
    endAt,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { startOfDay, startOfMonth, endOfMonth } from 'date-fns';

const collectionRef = collection(db, 'drugCreditorEntries');

export const listenToAllDrugCreditorEntries = (callback: (items: DrugCreditorEntry[]) => void) => {
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

export const listenToDrugCreditorEntries = (callback: (items: DrugCreditorEntry[]) => void, month: Date) => {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);

    const q = query(
        collectionRef, 
        orderBy("date"),
        startAt(Timestamp.fromDate(startDate)),
        endAt(Timestamp.fromDate(endDate))
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
        callback(entries);
    });
    return unsubscribe;
};

export const addDrugCreditorEntry = async (entry: Omit<DrugCreditorEntry, 'id' | 'createdAt' | 'date' | 'isPaid'>, date: Date) => {
    const entryWithTimestamp = {
        ...entry,
        date: Timestamp.fromDate(startOfDay(date)),
        isPaid: false,
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


export const updateOrderStatus = async (date: Date, order: number, isPaid: boolean) => {
    // Query for all documents with the specific date and order number
    const q = query(
        collectionRef, 
        where("date", "==", Timestamp.fromDate(startOfDay(date))),
        where("order", "==", order)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`No entries found for date ${date} and order ${order}`);
        return;
    }

    // Use a batch write to update all found documents
    const batch = writeBatch(db);
    querySnapshot.forEach(docSnap => {
        const docRef = doc(db, 'drugCreditorEntries', docSnap.id);
        batch.update(docRef, { isPaid: isPaid });
    });

    // Commit the batch
    await batch.commit();
};
