
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy,
    Timestamp
} from 'firebase/firestore';

const transactionsCollectionRef = collection(db, 'autoparts-transactions');

export const listenToAllAutoPartsTransactions = (
    callback: (items: Transaction[]) => void,
    onError?: (error: Error) => void
) => {
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp)?.toDate(),
                amount: data.amount || 0
            } as Transaction);
        });
        callback(transactions);
    },
    (error) => {
        console.error("Error in auto parts transaction listener:", error);
        if (onError) {
            onError(error);
        }
    });
    return unsubscribe;
};

    