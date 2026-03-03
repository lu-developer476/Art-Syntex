// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPaZWc2lnb2FB9riXXG5cY_HFfLkjp73U",
  authDomain: "art-syntex.firebaseapp.com",
  projectId: "art-syntex",
  storageBucket: "art-syntex.firebasestorage.app",
  messagingSenderId: "928663003142",
  appId: "1:928663003142:web:b827043034ff1fbd66e387",
  measurementId: "G-L8811N2Z12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
