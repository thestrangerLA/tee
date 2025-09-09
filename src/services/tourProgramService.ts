
import { db } from '@/lib/firebase';
import type { TourCostItem } from '@/lib/types';
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

const collectionRef = collection(db, 'tourCostItems');

export const listenToTourCostItems = (callback: (items: TourCostItem[]) => void) => {
    const q = query(collectionRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: TourCostItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp)?.toDate() || null,
                createdAt: (data.createdAt as Timestamp)?.toDate()
            } as TourCostItem);
        });
        callback(items);
    });
    return unsubscribe;
};

export const addTourCostItem = async () => {
    const newItem: Omit<TourCostItem, 'id' | 'createdAt'> = {
        date: new Date(),
        detail: '',
        kip: 0,
        baht: 0,
        usd: 0,
        cny: 0,
    };
    await addDoc(collectionRef, {
        ...newItem,
        createdAt: serverTimestamp()
    });
};

export const updateTourCostItem = async (id: string, updatedFields: Partial<Omit<TourCostItem, 'id' | 'createdAt'>>) => {
    const itemDoc = doc(db, 'tourCostItems', id);
    
    // Convert Date to Timestamp before updating
    if (updatedFields.date && updatedFields.date instanceof Date) {
        await updateDoc(itemDoc, {
            ...updatedFields,
            date: Timestamp.fromDate(updatedFields.date)
        });
    } else {
        await updateDoc(itemDoc, updatedFields);
    }
};

export const deleteTourCostItem = async (id: string) => {
    const itemDoc = doc(db, 'tourCostItems', id);
    await deleteDoc(itemDoc);
};
