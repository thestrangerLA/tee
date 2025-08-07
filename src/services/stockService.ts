
import { db } from '@/lib/firebase';
import type { StockItem } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

const stockCollectionRef = collection(db, 'stockItems');

export const listenToStockItems = (callback: (items: StockItem[]) => void) => {
    const q = query(stockCollectionRef);
    return onSnapshot(q, (querySnapshot) => {
        const items: StockItem[] = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as StockItem);
        });
        callback(items);
    });
};

export const addStockItem = async (item: Omit<StockItem, 'id'>) => {
    try {
        const docRef = await addDoc(stockCollectionRef, item);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return null;
    }
};

export const updateStockItem = async (id: string, updatedFields: Partial<StockItem>) => {
    const stockItemDoc = doc(db, 'stockItems', id);
    try {
        await updateDoc(stockItemDoc, updatedFields);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
};

export const deleteStockItem = async (id: string) => {
    const stockItemDoc = doc(db, 'stockItems', id);
    try {
        await deleteDoc(stockItemDoc);
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
};
