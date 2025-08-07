
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "kaset-stock-manager",
  "appId": "1:772228625471:web:93f2f9fa68522ec202748a",
  "storageBucket": "kaset-stock-manager.firebasestorage.app",
  "apiKey": "AIzaSyBdsGQbRWWD1lafromwVCjPQmAQT9bGboU",
  "authDomain": "kaset-stock-manager.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "772228625471"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
