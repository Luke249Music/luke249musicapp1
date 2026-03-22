import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCoGnKY6VIW4530WANcSFKABpZBJWfX8Y",
  authDomain: "schedule-mtmt.firebaseapp.com",
  projectId: "schedule-mtmt",
  storageBucket: "schedule-mtmt.firebasestorage.app",
  messagingSenderId: "983040979721",
  appId: "1:983040979721:web:24981ef9e9c79be6bdd9d8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
