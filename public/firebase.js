import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJ-xVBD33LxTrrwfHNXPfULjZx9C4YYV0",
  authDomain: "zewailcoursebooking.firebaseapp.com",
  projectId: "zewailcoursebooking",
  storageBucket: "zewailcoursebooking.appspot.com",
  messagingSenderId: "936184340092",
  appId: "1:936184340092:web:0633ef4a89791ceb9533f9",
  measurementId: "G-TNGEM7NS28",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
