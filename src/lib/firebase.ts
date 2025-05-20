
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration is now sourced from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined' && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Enable offline persistence for Firestore
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log("Firebase offline persistence enabled successfully.");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firebase offline persistence failed: Multiple tabs open, or other precondition not met.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firebase offline persistence failed: The current browser does not support all of the features required.");
      } else {
        console.error("Firebase offline persistence failed with error: ", err);
      }
    });
} else if (getApps().length > 0) {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Fallback for server-side rendering or build steps where window is not defined
  // Initialize a temporary app instance if needed, or handle appropriately
  // For now, we'll re-initialize for SSR, but this might need refinement
  // depending on how you use Firebase on the server.
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
