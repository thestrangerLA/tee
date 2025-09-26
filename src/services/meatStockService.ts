
import { db } from '@/lib/firebase';
import type { MeatStockItem } from '@/lib/types';
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
    runTransaction,
    writeBatch
} from 'firebase/firestore';

const meatStockCollectionRef = collection(db, 'meatStockItems');
const meatStockLogCollectionRef = collection(db, 'meatStockLogs');

export const listenToMeatStockItems = (callback: (items: MeatStockItem[]) => void) => {
    const q = query(meatStockCollectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: MeatStockItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ 
                id: doc.id, 
                ...data,
                expiryDate: (data.expiryDate as Timestamp)?.toDate() || null,
                createdAt: (data.createdAt as Timestamp)?.toDate()
            } as MeatStockItem);
        });
        callback(items);
    });
    return unsubscribe;
};

export const addMeatStockItem = async (item: Omit<MeatStockItem, 'id' | 'createdAt'>) => {
    await addDoc(meatStockCollectionRef, {
        ...item,
        expiryDate: item.expiryDate ? Timestamp.fromDate(item.expiryDate) : null,
        createdAt: serverTimestamp()
    });
};

export const updateMeatStockItem = async (id: string, updatedFields: Partial<Omit<MeatStockItem, 'id' | 'createdAt'>>) => {
    const itemDoc = doc(db, 'meatStockItems', id);
    const dataToUpdate: any = { ...updatedFields };

    if (updatedFields.expiryDate && updatedFields.expiryDate instanceof Date) {
        dataToUpdate.expiryDate = Timestamp.fromDate(updatedFields.expiryDate as Date);
    } else if (updatedFields.expiryDate === null) {
        dataToUpdate.expiryDate = null;
    }

    await updateDoc(itemDoc, dataToUpdate);
};

export const deleteMeatStockItem = async (id: string) => {
    await deleteDoc(doc(db, 'meatStockItems', id));
};

export const updateStockQuantity = async (id: string, change: number, type: 'stock-in' | 'sale', detail: string) => {
    const itemDocRef = doc(db, 'meatStockItems', id);

    await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemDocRef);
        if (!itemDoc.exists()) {
            throw new Error("Item does not exist!");
        }

        const newStock = itemDoc.data().currentStock + change;
        if (newStock < 0) {
            throw new Error("Stock cannot be negative!");
        }

        transaction.update(itemDocRef, { currentStock: newStock });

        const logRef = doc(meatStockLogCollectionRef);
        transaction.set(logRef, {
            itemId: id,
            change: change,
            newStock: newStock,
            type: type,
            detail: detail,
            createdAt: serverTimestamp()
        });
    });
};
