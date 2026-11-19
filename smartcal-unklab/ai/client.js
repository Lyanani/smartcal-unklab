import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const aiFirebaseConfig = {
  apiKey: "AIzaSyBD9Dv1dfkMelY_wC1mfFPaCIO9eF1oQsU",
  authDomain: "finalprojectfrontend-6ec9f.firebaseapp.com",
  projectId: "finalprojectfrontend-6ec9f",
  storageBucket: "finalprojectfrontend-6ec9f.firebasestorage.app",
  messagingSenderId: "116771930948",
  appId: "1:116771930948:web:e00245f7869f8c61fdcd11",
};

const aiApp = getApps().find((a) => a.name === "smartcal-ai") || initializeApp(aiFirebaseConfig, "smartcal-ai");
export const aiAuth = getAuth(aiApp);
export const isAppCheckConfigured = false;
export const appCheck = null;
export const functions = getFunctions(aiApp, "asia-southeast1");

if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
