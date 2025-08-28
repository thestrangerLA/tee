
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
        
        // --- WRITES SECOND ---
        // 1. Add the new transaction
        const newTransactionRef = doc(collection(db, "transactions"));
        t.set(newTransactionRef, transactionWithTimestamp);

        // 2. Update the account summary
        if (summarySnap.exists()) {
            const summaryData = summarySnap.data() as Omit<AccountSummary, 'id'>;
            
            if (transaction.paymentMethod === 'cash' || transaction.paymentMethod === 'transfer') {
                const currentAmount = summaryData[transaction.paymentMethod] || 0;
                const newAmount = transaction.type === 'income' 
                    ? currentAmount + transaction.amount 
                    : currentAmount - transaction.amount;
                t.update(accountSummaryDocRef, { [transaction.paymentMethod]: newAmount });
            }
        } else {
            // If summary doesn't exist, create it.
            const initialSummary: Partial<Omit<AccountSummary, 'id'>> = {
                cash: 0,
                transfer: 0,
                capital: 0,
                workingCapital: 0,
            };
             if (transaction.paymentMethod === 'cash' || transaction.paymentMethod === 'transfer') {
                initialSummary[transaction.paymentMethod] = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            }
            t.set(accountSummaryDocRef, initialSummary);
        }
    });
};

export const updateTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id'>>) => {
    const transactionDocRef = doc(db, 'transactions', id);

    await runTransaction(db, async (t) => {
        // --- READS FIRST ---
        const txSnap = await t.get(transactionDocRef);
        const summarySnap = await t.get(accountSummaryDocRef);

        if (!txSnap.exists()) {
            throw new Error("Transaction not found!");
        }
        if (!summarySnap.exists()) {
             throw new Error("Account summary not found!");
        }

        const originalTx = { ...txSnap.data(), date: (txSnap.data().date as Timestamp).toDate() } as Omit<Transaction, 'id'>;
        let newSummary = { ...(summarySnap.data() as Omit<AccountSummary, 'id'>) };

        // Revert original transaction from summary
        if (originalTx.paymentMethod === 'cash' || originalTx.paymentMethod === 'transfer') {
            const field = originalTx.paymentMethod;
            if (originalTx.type === 'income') {
                newSummary[field] = (newSummary[field] || 0) - originalTx.amount;
            } else {
                newSummary[field] = (newSummary[field] || 0) + originalTx.amount;
            }
        }

        // Apply new transaction to summary
        const newType = updatedFields.type || originalTx.type;
        const newAmount = updatedFields.amount ?? originalTx.amount;
        const newPaymentMethod = updatedFields.paymentMethod || originalTx.paymentMethod;

        if (newPaymentMethod === 'cash' || newPaymentMethod === 'transfer') {
             const field = newPaymentMethod;
            if (newType === 'income') {
                newSummary[field] = (newSummary[field] || 0) + newAmount;
            } else {
                newSummary[field] = (newSummary[field] || 0) - newAmount;
            }
        }
        
        // --- WRITES SECOND ---
        // 1. Update the transaction document
        const finalUpdatedFields = updatedFields.date 
            ? { ...updatedFields, date: Timestamp.fromDate(updatedFields.date) }
            : updatedFields;
        t.update(transactionDocRef, finalUpdatedFields);

        // 2. Update the summary document
        t.update(accountSummaryDocRef, newSummary);
    });
};


export const deleteTransaction = async (id: string) => {
    const transactionDocRef = doc(db, 'transactions', id);

     await runTransaction(db, async (t) => {
        // --- READS FIRST ---
        const txSnap = await t.get(transactionDocRef);
        const summarySnap = await t.get(accountSummaryDocRef);

        if (!txSnap.exists()) {
            throw new Error("Transaction not found!");
        }
        const txToDelete = txSnap.data() as Omit<Transaction, 'id' | 'date'> & { date: Timestamp };

        // --- WRITES SECOND ---
        // 1. Update summary
        if (summarySnap.exists()) {
            const summaryData = summarySnap.data();
             if (txToDelete.paymentMethod === 'cash' || txToDelete.paymentMethod === 'transfer') {
                const field = txToDelete.paymentMethod;
                const currentAmount = summaryData[field] || 0;
                const newAmount = txToDelete.type === 'income'
                    ? currentAmount - txToDelete.amount
                    : currentAmount + txToDelete.amount;
                t.update(accountSummaryDocRef, { [field]: newAmount });
            }
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
