
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc, getDoc, runTransaction, serverTimestamp, query, where, orderBy, onSnapshot, endAt, startAt, deleteDoc } from 'firebase/firestore';
import type { Sale } from '@/lib/types';

const salesCollectionRef = collection(db, 'applianceSales');

export const saveApplianceSale = async (invoiceData: any): Promise<string> => {
  const saleDocRef = doc(salesCollectionRef);
  
  await runTransaction(db, async (transaction) => {
    const stockItemsToUpdate: { ref: any, currentStock: number }[] = [];

    // 1. READ all necessary stock documents first
    for (const item of invoiceData.items) {
      const itemDocRef = doc(db, 'applianceStockItems', item.id);
      const itemDoc = await transaction.get(itemDocRef);

      if (!itemDoc.exists()) {
        throw new Error(`Item ${item.name} not found.`);
      }
      
      const currentStock = itemDoc.data().currentStock;
      if (currentStock < item.quantity) {
          throw new Error(`Not enough stock for ${item.name}. Only ${currentStock} left.`);
      }

      stockItemsToUpdate.push({ ref: itemDocRef, currentStock });
    }

    // 2. Now perform all WRITE operations
    // Set the sale document
    transaction.set(saleDocRef, {
      ...invoiceData,
      createdAt: serverTimestamp()
    });

    // Update stock and create logs for all items
    for (let i = 0; i < invoiceData.items.length; i++) {
        const item = invoiceData.items[i];
        const stockInfo = stockItemsToUpdate[i];
        const newStock = stockInfo.currentStock - item.quantity;

        transaction.update(stockInfo.ref, { currentStock: newStock });

        const logDocRef = doc(collection(db, 'applianceStockLogs'));
        transaction.set(logDocRef, {
            itemId: item.id,
            change: -item.quantity,
            newStock: newStock,
            type: 'sale',
            detail: `Invoice #${saleDocRef.id.substring(0, 5)}...`,
            createdAt: serverTimestamp(),
        });
    }
  });

  return saleDocRef.id;
};

export const getApplianceSale = async (saleId: string) => {
    const saleDocRef = doc(db, 'applianceSales', saleId);
    const docSnap = await getDoc(saleDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        };
    }
    return null;
};

export const listenToApplianceSalesByDate = (date: Date, callback: (sales: Sale[]) => void) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const q = query(
        salesCollectionRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
        const salesData: Sale[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            salesData.push({
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as Sale);
        });
        callback(salesData);
    });
};

export const deleteApplianceSale = async (saleId: string) => {
    const saleDocRef = doc(db, 'applianceSales', saleId);
    // Note: This does not currently revert stock changes. A more complex transaction would be needed.
    await deleteDoc(saleDocRef);
};
