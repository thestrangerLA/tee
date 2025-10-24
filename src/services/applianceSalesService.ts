
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { updateApplianceStockQuantity } from './applianceStockService';

const salesCollectionRef = collection(db, 'applianceSales');

export const saveApplianceSale = async (invoiceData: any) => {
  try {
    const saleDocRef = doc(salesCollectionRef);
    const batch = writeBatch(db);

    batch.set(saleDocRef, {
      ...invoiceData,
      createdAt: Timestamp.now()
    });

    for (const item of invoiceData.items) {
      await updateApplianceStockQuantity(item.id, -item.quantity, 'sale', `Invoice #${invoiceData.invoiceNumber || saleDocRef.id}`);
    }

    return { success: true, message: 'Sale recorded and stock updated successfully.' };
  } catch (error: any) {
    console.error("Error saving sale: ", error);
    return { success: false, message: error.message };
  }
};
