import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { app } from '../src/firebase.js'

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY?.trim()

export const isAppCheckConfigured = Boolean(appCheckSiteKey)
export const appCheck =
  app && appCheckSiteKey
    ? initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
    : null
export const functions = app ? getFunctions(app, 'asia-southeast1') : null

if (functions && import.meta.env.DEV) {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}
