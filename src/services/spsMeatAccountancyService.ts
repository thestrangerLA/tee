
import { db } from '@/lib/firebase';
import type { DocumentAccountSummary, Transaction } from '@/lib/types';
import { 
    doc, 
    onSnapshot, 
    setDoc,
    getDoc,
    collection,
    query,
    orderBy,
    addDoc,
    Timestamp,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';

const summaryDocRef = doc(db, 'sps-meat-business-accountSummary', 'latest');
const transactionsCollectionRef = collection(db, 'sps-meat-business-transactions');

const initialSummaryState: Omit<DocumentAccountSummary, 'id'> = {
    capital: 0,
    cash: 0,
    transfer: 0,
};

// Function to ensure an initial state exists
const ensureInitialState = async () => {
    const docSnap = await getDoc(summaryDocRef);
    if (!docSnap.exists()) {
        await setDoc(summaryDocRef, initialSummaryState);
    }
};

export const listenToSpsMeatAccountSummary = (callback: (summary: DocumentAccountSummary) => void) => {
    ensureInitialState();
    
    const unsubscribe = onSnapshot(summaryDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback({
                id: docSnapshot.id,
                capital: data.capital || 0,
                cash: data.cash || 0,
                transfer: data.transfer || 0,
            });
        } else {
            callback({ id: 'latest', ...initialSummaryState });
        }
    });
    return unsubscribe;
};

export const updateSpsMeatAccountSummary = async (summary: Partial<Omit<DocumentAccountSummary, 'id'>>) => {
    await setDoc(summaryDocRef, summary, { merge: true });
};


// Transaction Functions
export const listenToSpsMeatTransactions = (callback: (items: Transaction[]) => void) => {
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp).toDate(),
                amount: data.kip || 0
            } as Transaction);
        });
        callback(transactions);
    });
    return unsubscribe;
};

export const addSpsMeatTransaction = async (transaction: Omit<Transaction, 'id' | 'businessType'>) => {
    const newTransactionRef = doc(transactionsCollectionRef);
    await setDoc(newTransactionRef, { 
        description: transaction.description,
        type: transaction.type,
        kip: transaction.amount,
        businessType: 'meat-business',
        subType: 'sps',
        date: Timestamp.fromDate(transaction.date),
        createdAt: serverTimestamp()
    });
};

export const updateSpsMeatTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id'>>) => {
    const transactionDocRef = doc(transactionsCollectionRef, id);
    const dataToUpdate: any = {
        description: updatedFields.description,
        type: updatedFields.type,
        kip: updatedFields.amount,
    };
    if (updatedFields.date) {
        dataToUpdate.date = Timestamp.fromDate(updatedFields.date);
    }
    await updateDoc(transactionDocRef, dataToUpdate);
};

export const deleteSpsMeatTransaction = async (id: string) => {
    const transactionDocRef = doc(transactionsCollectionRef, id);
    await deleteDoc(transactionDocRef);
};
