
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { updateStockItem } from './stockService'; // Assuming this updates stock

const debtorsCollectionRef = collection(db, 'debtors');

export const saveDebtor = async (invoiceData: any) => {
  try {
    const debtorDocRef = doc(debtorsCollectionRef);
    const batch = writeBatch(db);

    batch.set(debtorDocRef, {
      customer: invoiceData.customer,
      items: invoiceData.items,
      amount: invoiceData.subtotal,
      date: invoiceData.date,
      invoiceNumber: invoiceData.invoiceNumber || debtorDocRef.id,
      isPaid: false,
      createdAt: Timestamp.now()
    });

    // This part is tricky without a dedicated stock update function that uses transactions
    // For now, we'll call updateStockItem which might not be transactional
    for (const item of invoiceData.items) {
        // This is a simplified update, a real app should handle this transactionally
        const stockItemRef = doc(db, 'stockItems', item.id);
        // You would need a function here that safely decrements the stock
        // For example: await decrementStock(item.id, item.quantity, batch);
    }
    
    // As we don't have transactional stock updates in stockService,
    // we'll just commit the debtor part for now.
    // In a real scenario, stock updates should be part of this transaction.
    await batch.commit();

    return { success: true, message: 'Debtor created successfully. Stock update needs manual implementation for safety.' };
  } catch (error: any) {
    console.error("Error saving debtor: ", error);
    return { success: false, message: error.message };
  }
};
