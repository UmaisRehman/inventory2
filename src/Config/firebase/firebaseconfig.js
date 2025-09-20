import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3JkQEHCSzOl40NDh6pxfdBU-gM1tZ0zs",
  authDomain: "procurement-81f28.firebaseapp.com",
  projectId: "procurement-81f28",
  storageBucket: "procurement-81f28.firebasestorage.app",
  messagingSenderId: "208833918548",
  appId: "1:208833918548:web:8f9a1df3792da2d67f5fc1",
  measurementId: "G-2M3CZ0N9DE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app
export const auth = getAuth(app);
 const db = getFirestore(app);
export { db, doc,setDoc,createUserWithEmailAndPassword}