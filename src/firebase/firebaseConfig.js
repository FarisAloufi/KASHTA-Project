import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       
import { getFirestore } from "firebase/firestore";  
import { getStorage } from "firebase/storage";    

const firebaseConfig = {
  apiKey: "AIzaSyA-YkBrWIapCXCbRh6HJtQG5jhdPM74bE4",
  authDomain: "kashta-9b2bc.firebaseapp.com",
  projectId: "kashta-9b2bc",
  storageBucket: "kashta-9b2bc.firebasestorage.app",
  messagingSenderId: "184279619423",
  appId: "1:184279619423:web:787e26be56bd8ab3a608ea",
  measurementId: "G-XD0SFM6C6M"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);