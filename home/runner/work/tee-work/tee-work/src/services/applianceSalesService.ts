
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

const salesCollectionRef = collection(db, 'applianceSales');

export const saveApplianceSale = async (invoiceData: any): Promise<string> => {
  const saleDocRef = doc(salesCollectionRef);
  
  await runTransaction(db, async (transaction) => {
    // 1. Set the sale document
    transaction.set(saleDocRef, {
      ...invoiceData,
      createdAt: Timestamp.now()
    });

    // 2. Iterate through items to update stock and create logs
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

      const newStock = currentStock - item.quantity;
      
      // Update stock
      transaction.update(itemDocRef, { currentStock: newStock });
      
      // Create log
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
