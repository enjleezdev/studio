// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwAmbnKucP8XgNR7VdLQRgnNSXu6gx2g0",
  authDomain: "enjleez-tech-system.firebaseapp.com",
  projectId: "enjleez-tech-system",
  storageBucket: "enjleez-tech-system.firebasestorage.app",
  messagingSenderId: "287769207619",
  appId: "1:287769207619:web:02d8236f06ad00708445f6",
  measurementId: "G-MX3LYK13CN"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics | undefined; // Make analytics potentially undefined for SSR safety

if (typeof window !== 'undefined') {
  // This code runs only on the client-side
  if (getApps().length === 0) {
    // Initialize Firebase only if it hasn't been initialized yet
    app = initializeApp(firebaseConfig);
    try {
      analytics = getAnalytics(app); // Initialize Analytics
    } catch (e) {
      console.warn("Firebase Analytics could not be initialized:", e);
    }
  } else {
    app = getApps()[0];
    // Ensure analytics is initialized if app was already initialized (e.g., by another part of the app or HMR)
    if (!analytics) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics could not be re-initialized on existing app instance:", e);
      }
    }
  }

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
} else {
  // Fallback for server-side rendering or build steps where window is not defined
  // Initialize a temporary app instance if needed, or handle appropriately.
  // Auth and Firestore can be initialized here for server-side operations if needed,
  // but Analytics is client-side only.
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth, analytics };
