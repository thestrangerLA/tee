
import { db } from '@/lib/firebase';
import type { StockItem } from '@/lib/types';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

const stockCollectionRef = collection(db, 'autoparts-stockItems');

export const listenToAutoPartsStockItems = (callback: (items: StockItem[]) => void) => {
    const q = query(stockCollectionRef, orderBy('name'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: StockItem[] = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as StockItem);
        });
        callback(items);
    });
    return unsubscribe;
};

export const addAutoPartsStockItem = async (item: Omit<StockItem, 'id'>) => {
    await addDoc(stockCollectionRef, item);
};

export const updateAutoPartsStockItem = async (id: string, updatedFields: Partial<StockItem>) => {
    const stockItemDoc = doc(db, 'autoparts-stockItems', id);
    await updateDoc(stockItemDoc, updatedFields);
};

export const deleteAutoPartsStockItem = async (id: string) => {
    const stockItemDoc = doc(db, 'autoparts-stockItems', id);
    await deleteDoc(stockItemDoc);
};
