
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

const summaryDocRef = doc(db, 'documents-accountSummary', 'latest');
const transactionsCollectionRef = collection(db, 'documents-transactions');

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

export const listenToDocumentAccountSummary = (callback: (summary: DocumentAccountSummary) => void) => {
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

export const updateDocumentAccountSummary = async (summary: Partial<Omit<DocumentAccountSummary, 'id'>>) => {
    await setDoc(summaryDocRef, summary, { merge: true });
};


// Transaction Functions
export const listenToDocumentTransactions = (callback: (items: Transaction[]) => void) => {
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

export const addDocumentTransaction = async (transaction: Omit<Transaction, 'id' | 'businessType'>) => {
    await runTransaction(db, async (t) => {
        const summarySnap = await t.get(summaryDocRef);
        const summaryData = summarySnap.exists() ? summarySnap.data() as DocumentAccountSummary : initialSummaryState;

        const newCash: CurrencyValues = { ...summaryData.cash };

        for (const key of Object.keys(initialCurrencyValues)) {
            const currency = key as keyof CurrencyValues;
            const amount = transaction[currency] || 0;
            if (transaction.type === 'income') {
                newCash[currency] += amount;
            } else { // expense
                newCash[currency] -= amount;
            }
        }
        
        // 1. Add transaction document
        const newTransactionRef = doc(transactionsCollectionRef);
        t.set(newTransactionRef, { 
            ...transaction, 
            businessType: 'documents',
            date: Timestamp.fromDate(transaction.date),
            createdAt: serverTimestamp()
        });
        
        // 2. Update summary document
        t.set(summaryDocRef, { ...summaryData, cash: newCash }, { merge: true });
    });
};

export const updateDocumentTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id'>>) => {
    const transactionDocRef = doc(transactionsCollectionRef, id);

    await runTransaction(db, async (t) => {
        const txSnap = await t.get(transactionDocRef);
        const summarySnap = await t.get(summaryDocRef);

        if (!txSnap.exists()) throw new Error("Transaction to update not found!");
        if (!summarySnap.exists()) throw new Error("Account summary not found!");

        const originalTx = txSnap.data() as Transaction;
        const summaryData = summarySnap.data() as DocumentAccountSummary;
        const finalUpdatedTx = { ...originalTx, ...updatedFields };

        const newCash: CurrencyValues = { ...summaryData.cash };

        for (const key of Object.keys(initialCurrencyValues)) {
            const currency = key as keyof CurrencyValues;
            const originalAmount = originalTx[currency] || 0;
            const updatedAmount = finalUpdatedTx[currency] || 0;

            // Revert original transaction
            if (originalTx.type === 'income') newCash[currency] -= originalAmount;
            else newCash[currency] += originalAmount;
            
            // Apply new transaction
            if (finalUpdatedTx.type === 'income') newCash[currency] += updatedAmount;
            else newCash[currency] -= updatedAmount;
        }

        // 1. Update the transaction itself
        const updateDataForFirestore = updatedFields.date 
            ? { ...updatedFields, date: Timestamp.fromDate(updatedFields.date) }
            : updatedFields;
        t.update(transactionDocRef, updateDataForFirestore);

        // 2. Update the summary
        t.update(summaryDocRef, { cash: newCash });
    });
};

export const deleteDocumentTransaction = async (id: string) => {
    const transactionDocRef = doc(transactionsCollectionRef, id);

    await runTransaction(db, async (t) => {
        const txSnap = await t.get(transactionDocRef);
        if (!txSnap.exists()) throw new Error("Transaction to delete not found!");
        
        const summarySnap = await t.get(summaryDocRef);
        if (!summarySnap.exists()) throw new Error("Account summary not found!");

        const txToDelete = txSnap.data() as Transaction;
        const summaryData = summarySnap.data() as DocumentAccountSummary;
        const newCash: CurrencyValues = { ...summaryData.cash };

        for (const key of Object.keys(initialCurrencyValues)) {
            const currency = key as keyof CurrencyValues;
            const amount = txToDelete[currency] || 0;
            if (txToDelete.type === 'income') {
                newCash[currency] -= amount;
            } else { // expense
                newCash[currency] += amount;
            }
        }
        
        // 1. Delete the transaction
        t.delete(transactionDocRef);
        
        // 2. Update the summary
        t.update(summaryDocRef, { cash: newCash });
    });
};
