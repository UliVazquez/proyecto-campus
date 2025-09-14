// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

export const USE_FIREBASE = true;

const firebaseConfig = {
  apiKey: "AIzaSyAckCS7g-P13qI5MI0jwcm4WotN0m-Ad40",
  authDomain: "proyecto-campus-f36d2.firebaseapp.com",
  projectId: "proyecto-campus-f36d2",
  storageBucket: "proyecto-campus-f36d2.appspot.com",
  messagingSenderId: "793610423893",
  appId: "1:793610423893:web:0bfa7c6a7fd3aacc744edc",
  measurementId: "G-MCERW567B2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
