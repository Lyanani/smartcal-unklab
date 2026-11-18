import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// 1. TEMPELKAN firebaseConfig DARI FIREBASE CONSOLE DI SINI:
const firebaseConfig = {
  apiKey: "AIzaSyBD9Dv1dfkMelY_wC1mfFPaCIO9eF1oQsU",
  authDomain: "finalprojectfrontend-6ec9f.firebaseapp.com",
  projectId: "finalprojectfrontend-6ec9f",
  storageBucket: "finalprojectfrontend-6ec9f.firebasestorage.app",
  messagingSenderId: "116771930948",
  appId: "1:116771930948:web:e00245f7869f8c61fdcd11",
}

// Initialize Firebase services used by authentication and the local Functions emulator.
export const isFirebaseConfigured = !firebaseConfig.projectId.startsWith('ISI_')
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null