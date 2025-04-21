// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Platform } from "react-native";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxr7eyH_TlPr2BzADEtBSdj1Zob72n3ng",
  authDomain: "treknep-5c9a0.firebaseapp.com",
  projectId: "treknep-5c9a0",
  storageBucket: "treknep-5c9a0.firebasestorage.app",
  messagingSenderId: "66836726777",
  appId: "1:66836726777:web:0f990db37788b05dc1b328",
  measurementId: "G-MM6N81BK7M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

export { auth };
