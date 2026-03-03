import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD6C6ct-JequfvNkEAi2cIqmcgFvQTPD3c",
  authDomain: "art-synt-13037.firebaseapp.com",
  projectId: "art-synt-13037",
  storageBucket: "art-synt-13037.firebasestorage.app",
  messagingSenderId: "123384151241",
  appId: "1:123384151241:web:f833ca39fa256503466118",
  measurementId: "G-M7SZW2DLEH"
};

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
