import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCiTdW4bB5vUa8A_yaNo1Geb2gzAGAb788", // Recommend moving to import.meta.env VITE_vars later
  authDomain: "ecoaudit-cc9c1.firebaseapp.com",
  projectId: "ecoaudit-cc9c1",
  storageBucket: "ecoaudit-cc9c1.firebasestorage.app",
  messagingSenderId: "671922232892",
  appId: "1:671922232892:web:58eeb22db635957c722d39",
  measurementId: "G-24Q0CJR35G"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);