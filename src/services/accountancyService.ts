
import { db } from '@/lib/firebase';
import type { Transaction, AccountSummary } from '@/lib/types';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    doc, 
    updateDoc, 
    deleteDoc, 
    orderBy,
    limit,
    getDoc,
    setDoc
} from 'firebase/firestore';

const transactionsCollectionRef = collection(db, 'transactions');
const accountSummaryDocRef = doc(db, 'accountSummary', 'latest');

// Transaction Functions
export const listenToTransactions = (callback: (items: Transaction[]) => void) => {
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({ 
                id: doc.id, 
                ...data,
                date: data.date.toDate() // Convert Firestore Timestamp to JS Date
            } as Transaction);
        });
        callback(transactions);
    });
    return unsubscribe;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await addDoc(transactionsCollectionRef, transaction);
};

export const updateTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id'>>) => {
    const transactionDoc = doc(db, 'transactions', id);
    await updateDoc(transactionDoc, updatedFields);
};

export const deleteTransaction = async (id: string) => {
    const transactionDoc = doc(db, 'transactions', id);
    await deleteDoc(transactionDoc);
};

// Account Summary Functions
export const listenToAccountSummary = (callback: (summary: AccountSummary | null) => void) => {
    const unsubscribe = onSnapshot(accountSummaryDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            callback({ id: docSnapshot.id, ...docSnapshot.data() } as AccountSummary);
        } else {
            callback(null);
        }
    });
    return unsubscribe;
};

export const updateAccountSummary = async (summary: Omit<AccountSummary, 'id'>) => {
    await setDoc(accountSummaryDocRef, summary, { merge: true });
};
