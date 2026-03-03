// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6C6ct-JequfvNkEAi2cIqmcgFvQTPD3c",
  authDomain: "art-syntex.firebaseapp.com",
  projectId: "art-syntex",
  storageBucket: "art-syntex.firebasestorage.app",
  messagingSenderId: "123384151241",
  appId: "1:123384151241:web:f833ca39fa256503466118",
  measurementId: "G-M7SZW2DLEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app)
