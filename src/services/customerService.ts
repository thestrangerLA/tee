
import { db } from '@/lib/firebase';
import type { Customer } from '@/lib/types';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

const customersCollectionRef = collection(db, 'customers');

export const listenToCustomers = (callback: (customers: Customer[]) => void) => {
  const q = query(customersCollectionRef, orderBy('name'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() } as Customer);
    });
    callback(customers);
  });
  return unsubscribe;
};
