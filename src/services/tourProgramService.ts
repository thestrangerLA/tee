
import { db } from '@/lib/firebase';
import type { TourCostItem, TourProgram } from '@/lib/types';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    doc, 
    updateDoc, 
    deleteDoc, 
    orderBy,
    serverTimestamp,
    Timestamp,
    where,
    getDoc
} from 'firebase/firestore';

const programsCollectionRef = collection(db, 'tourPrograms');
const costsCollectionRef = collection(db, 'tourCostItems');

// ---- Tour Program Functions ----

export const listenToTourPrograms = (callback: (items: TourProgram[]) => void) => {
    const q = query(programsCollectionRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: TourProgram[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp)?.toDate(),
                createdAt: (data.createdAt as Timestamp)?.toDate()
            } as TourProgram);
        });
        callback(items);
    });
    return unsubscribe;
};

export const getTourProgram = async (id: string): Promise<TourProgram | null> => {
    const docRef = doc(db, 'tourPrograms', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate()
        } as TourProgram;
    } else {
        return null;
    }
}

export const addTourProgram = async (program: Omit<TourProgram, 'id' | 'createdAt'>) => {
    const newProgram = {
        ...program,
        date: Timestamp.fromDate(program.date),
        createdAt: serverTimestamp()
    };
    const docRef = await addDoc(programsCollectionRef, newProgram);
    return docRef.id;
};


// ---- Tour Cost Item Functions ----

export const listenToTourCostItemsForProgram = (programId: string, callback: (items: TourCostItem[]) => void) => {
    const q = query(costsCollectionRef, where('programId', '==', programId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: TourCostItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ 
                id: doc.id, 
                ...data,
                date: (data.date as Timestamp)?.toDate() || null,
                createdAt: (data.createdAt as Timestamp)?.toDate()
            } as TourCostItem);
        });
        // Sort by createdAt date on the client side
        items.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
        callback(items);
    });
    return unsubscribe;
};

export const addTourCostItemForProgram = async (programId: string) => {
    const newItem: Omit<TourCostItem, 'id' | 'createdAt'> = {
        programId: programId,
        date: new Date(),
        detail: '',
        kip: 0,
        baht: 0,
        usd: 0,
        cny: 0,
    };
    await addDoc(costsCollectionRef, {
        ...newItem,
        createdAt: serverTimestamp()
    });
};

export const updateTourCostItem = async (id: string, updatedFields: Partial<Omit<TourCostItem, 'id' | 'createdAt'>>) => {
    const itemDoc = doc(db, 'tourCostItems', id);
    
    // Convert Date to Timestamp before updating
    const dataToUpdate: any = { ...updatedFields };
    if (updatedFields.date) {
        dataToUpdate.date = Timestamp.fromDate(updatedFields.date);
    }
    
    await updateDoc(itemDoc, dataToUpdate);
};

export const deleteTourCostItem = async (id: string) => {
    const itemDoc = doc(db, 'tourCostItems', id);
    await deleteDoc(itemDoc);
};
