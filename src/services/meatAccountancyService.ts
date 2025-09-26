
import { db } from '@/lib/firebase';
import type { DocumentAccountSummary, Transaction, CurrencyValues } from '@/lib/types';
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
    runTransaction,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';

const summaryDocRef = doc(db, 'meat-business-accountSummary', 'latest');
const transactionsCollectionRef = collection(db, 'meat-business-transactions');

const initialCurrencyValues: CurrencyValues = { kip: 0, baht: 0, usd: 0, cny: 0 };

const initialSummaryState: Omit<DocumentAccountSummary, 'id'> = {
    capital: { ...initialCurrencyValues },
    cash: { ...initialCurrencyValues },
    transfer: { ...initialCurrencyValues },
};

// Function to ensure an initial state exists
const ensureInitialState = async () => {
    const docSnap = await getDoc(summaryDocRef);
    if (!docSnap.exists()) {
        await setDoc(summaryDocRef, initialSummaryState);
    }
};

export const listenToMeatAccountSummary = (callback: (summary: DocumentAccountSummary) => void) => {
    ensureInitialState();
    
    const unsubscribe = onSnapshot(summaryDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback({
                id: docSnapshot.id,
                capital: data.capital || { ...initialCurrencyValues },
                cash: data.cash || { ...initialCurrencyValues },
                transfer: data.transfer || { ...initialCurrencyValues },
            });
        } else {
            callback({ id: 'latest', ...initialSummaryState });
        }
    });
    return unsubscribe;
};

export const updateMeatAccountSummary = async (summary: Partial<Omit<DocumentAccountSummary, 'id'>>) => {
    await setDoc(summaryDocRef, summary, { merge: true });
};


// Transaction Functions
export const listenToMeatTransactions = (callback: (items: Transaction[]) => void) => {
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp).toDate()
            } as Transaction);
        });
        callback(transactions);
    });
    return unsubscribe;
};

export const addMeatTransaction = async (transaction: Omit<Transaction, 'id' | 'businessType'>) => {
    const newTransactionRef = doc(transactionsCollectionRef);
    await setDoc(newTransactionRef, { 
        ...transaction, 
        businessType: 'meat-business',
        date: Timestamp.fromDate(transaction.date),
        createdAt: serverTimestamp()
    });
};

export const updateMeatTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id'>>) => {
    const transactionDocRef = doc(transactionsCollectionRef, id);
    const updateDataForFirestore = updatedFields.date 
        ? { ...updatedFields, date: Timestamp.fromDate(updatedFields.date) }
        : updatedFields;
    await updateDoc(transactionDocRef, updateDataForFirestore);
};

export const deleteMeatTransaction = async (id: string) => {
    const transactionDocRef = doc(transactionsCollectionRef, id);
    await deleteDoc(transactionDocRef);
};

    