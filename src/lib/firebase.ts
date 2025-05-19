import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // If auth is needed later

// Your web app's Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
// These are placeholders and should be stored in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

let app: FirebaseApp;
let db: Firestore;
// let auth: Auth; // If auth is needed later

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
// auth = getAuth(app); // If auth is needed later

// Enable offline persistence
// This needs to be called before any data is read or written from Firestore.
// It's best to call this as early as possible.
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log("Firebase offline persistence enabled successfully.");
    })
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn("Firebase offline persistence failed: Multiple tabs open or other precondition not met.");
      } else if (err.code == 'unimplemented') {
        console.warn("Firebase offline persistence failed: The current browser does not support all of the features required.");
      } else {
        console.error("Firebase offline persistence failed with error: ", err);
      }
    });
}


export { app, db /*, auth */ };

// Placeholder for future CRUD functions
// e.g.,
// export const getWarehouses = async () => { ... }
// export const addItemToWarehouse = async (warehouseId, itemData) => { ... }
