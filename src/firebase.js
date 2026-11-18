import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// 1. TEMPELKAN firebaseConfig DARI FIREBASE CONSOLE DI SINI:
const firebaseConfig = {
  apiKey: "AIzaSyBzNlEkwAqSlVllUt_p5XukbtZ-JESWXZ0",
  authDomain: "final-frontend-350fc.firebaseapp.com",
  projectId: "final-frontend-350fc",
  storageBucket: "final-frontend-350fc.firebasestorage.app",
  messagingSenderId: "268561846651",
  appId:"1:268561846651:web:bcc191a81e6322dfa5edde"
}

// 2. Inisialisasi otomatis (jangan diubah agar terhubung ke App.jsx)
export const isFirebaseConfigured = !firebaseConfig.projectId.startsWith('ISI_')
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const db = app ? getFirestore(app) : null