
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
    setDoc,
    Timestamp,
    runTransaction
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
                date: (data.date as Timestamp).toDate() // Convert Firestore Timestamp to JS Date
            } as Transaction);
        });
        callback(transactions);
    });
    return unsubscribe;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const transactionWithTimestamp = { ...transaction, date: Timestamp.fromDate(transaction.date) };

    await runTransaction(db, async (t) => {
        // --- READS FIRST ---
        const summarySnap = await t.get(accountSummaryDocRef);

        // --- PREPARE WRITES ---
        const summaryExists = summarySnap.exists();
        let summaryData = summaryExists ? (summarySnap.data() as Omit<AccountSummary, 'id'>) : { cash: 0, transfer: 0, capital: 0, workingCapital: 0 };
        
        const updates: Partial<Omit<AccountSummary, 'id'>> = {};

        const currentCash = summaryData.cash || 0;
        if (transaction.type === 'income') {
            updates.cash = currentCash + transaction.amount;
        } else { // 'expense'
            updates.cash = currentCash - transaction.amount;
        }

        // --- WRITES SECOND ---
        // 1. Add the new transaction document
        const newTransactionRef = doc(collection(db, "transactions"));
        t.set(newTransactionRef, transactionWithTimestamp);

        // 2. Update the account summary
        if (summaryExists) {
            if (Object.keys(updates).length > 0) {
                 t.update(accountSummaryDocRef, updates);
            }
        } else {
            // If summary doesn't exist, create it with the calculated changes.
            const initialSummary: Omit<AccountSummary, 'id'> = {
                cash: updates.cash ?? 0,
                transfer: 0,
                capital: 0,
                workingCapital: 0,
            };
            t.set(accountSummaryDocRef, initialSummary);
        }
    });
};

export const updateTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id'>>) => {
    const transactionDocRef = doc(db, 'transactions', id);

    await runTransaction(db, async (t) => {
        // --- Step 1: READ all necessary documents ---
        const txSnap = await t.get(transactionDocRef);
        const summarySnap = await t.get(accountSummaryDocRef);

        if (!txSnap.exists()) {
            throw new Error("Transaction to update not found!");
        }
        if (!summarySnap.exists()) {
             throw new Error("Account summary not found! Cannot update transaction.");
        }

        const originalTxData = txSnap.data() as Omit<Transaction, 'id' | 'date'> & { date: Timestamp };
        const summaryData = summarySnap.data() as Omit<AccountSummary, 'id'>;
        
        const finalUpdatedTx = { ...originalTxData, ...updatedFields };

        // --- Step 2: CALCULATE the changes ---
        let cashChange = 0;

        // Revert the effect of the original transaction amount
        cashChange += originalTxData.type === 'income' ? -originalTxData.amount : originalTxData.amount;
        
        // Apply the effect of the new (updated) transaction amount
        cashChange += finalUpdatedTx.type === 'income' ? finalUpdatedTx.amount : -finalUpdatedTx.amount;

        const summaryUpdate: Partial<AccountSummary> = {};
        if (cashChange !== 0) {
            summaryUpdate.cash = (summaryData.cash || 0) + cashChange;
        }
        
        // --- Step 3: WRITE all changes to documents ---
        // 1. Update the transaction document itself
        const updateDataForFirestore = updatedFields.date 
            ? { ...updatedFields, date: Timestamp.fromDate(updatedFields.date) }
            : updatedFields;
        t.update(transactionDocRef, updateDataForFirestore);

        // 2. Update the summary document if anything changed
        if (Object.keys(summaryUpdate).length > 0) {
            t.update(accountSummaryDocRef, summaryUpdate);
        }
    });
};


export const deleteTransaction = async (id: string) => {
    const transactionDocRef = doc(db, 'transactions', id);

     await runTransaction(db, async (t) => {
        // --- Step 1: READ all necessary documents ---
        const txSnap = await t.get(transactionDocRef);
        const summarySnap = await t.get(accountSummaryDocRef);

        if (!txSnap.exists()) {
            throw new Error("Transaction to delete not found!");
        }
        
        const txToDelete = txSnap.data() as Omit<Transaction, 'id' | 'date'> & { date: Timestamp };
        const summaryUpdates: Partial<AccountSummary> = {};

        if (summarySnap.exists()) {
            const summaryData = summarySnap.data() as Omit<AccountSummary, 'id'>;
            const currentCash = summaryData.cash || 0;
            // To revert the transaction: add back expenses, subtract incomes.
            const newCashAmount = txToDelete.type === 'income'
                ? currentCash - txToDelete.amount
                : currentCash + txToDelete.amount;
            summaryUpdates.cash = newCashAmount;
        }

        // --- Step 2: WRITE all changes ---
        // 1. Update summary
        if (Object.keys(summaryUpdates).length > 0 && summarySnap.exists()) {
            t.update(accountSummaryDocRef, summaryUpdates);
        }
        // 2. Delete transaction
        t.delete(transactionDocRef);
    });
};

// Account Summary Functions
export const listenToAccountSummary = (callback: (summary: AccountSummary | null) => void) => {
    const unsubscribe = onSnapshot(accountSummaryDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback({ 
                id: docSnapshot.id, 
                cash: data.cash ?? 0,
                transfer: data.transfer ?? 0,
                capital: data.capital ?? 0,
                workingCapital: data.workingCapital ?? 0
            } as AccountSummary);
        } else {
            callback(null);
        }
    });
    return unsubscribe;
};

export const updateAccountSummary = async (summary: Partial<Omit<AccountSummary, 'id'>>) => {
    await setDoc(accountSummaryDocRef, summary, { merge: true });
};
