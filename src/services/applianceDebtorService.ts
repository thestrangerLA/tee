
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { updateApplianceStockQuantity } from './applianceStockService';

const debtorsCollectionRef = collection(db, 'applianceDebtors');

export const saveApplianceDebtor = async (invoiceData: any) => {
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

    for (const item of invoiceData.items) {
      await updateApplianceStockQuantity(item.id, -item.quantity, 'sale', `Debtor Invoice #${invoiceData.invoiceNumber || debtorDocRef.id}`);
    }

    return { success: true, message: 'Debtor created and stock updated successfully.' };
  } catch (error: any) {
    console.error("Error saving debtor: ", error);
    return { success: false, message: error.message };
  }
};
