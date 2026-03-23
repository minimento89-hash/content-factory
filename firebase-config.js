import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase Configuration - Placeholder
// Replace these values with your project's configuration from the Firebase Console (https://console.firebase.google.com/)
export const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "content-factory-demo.firebaseapp.com",
  projectId: "content-factory-demo",
  storageBucket: "content-factory-demo.firebasestorage.app",
  messagingSenderId: "PLACEHOLDER_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
