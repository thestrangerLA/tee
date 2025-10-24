
import { db } from '@/lib/firebase';
import type { ApplianceCustomer } from '@/lib/types';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

const customersCollectionRef = collection(db, 'applianceCustomers');

export const listenToApplianceCustomers = (callback: (customers: ApplianceCustomer[]) => void) => {
  const q = query(customersCollectionRef, orderBy('name'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const customers: ApplianceCustomer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() } as ApplianceCustomer);
    });
    callback(customers);
  });
  return unsubscribe;
};
