
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
// We'd need a way to update stock. Let's assume a function exists in stockService
// For demonstration, this is a placeholder. A real implementation needs transactional updates.

const salesCollectionRef = collection(db, 'sales');

export const saveSale = async (invoiceData: any) => {
  try {
    const saleDocRef = doc(salesCollectionRef);
    const batch = writeBatch(db);

    batch.set(saleDocRef, {
      ...invoiceData,
      createdAt: Timestamp.now()
    });
    
    // Similar to debtors, stock updates should be transactional.
    // This is a simplified representation.
    for (const item of invoiceData.items) {
      const stockItemRef = doc(db, 'stockItems', item.id);
      // Fictional transactional decrement function
      // await decrementStock(item.id, item.quantity, batch);
    }

    await batch.commit();

    return { success: true, message: 'Sale recorded successfully. Stock update needs manual implementation.' };
  } catch (error: any) {
    console.error("Error saving sale: ", error);
    return { success: false, message: error.message };
  }
};
