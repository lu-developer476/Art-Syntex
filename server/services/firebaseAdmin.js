import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const privateKey = required('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n')

  return initializeApp({
    credential: cert({
      projectId: required('FIREBASE_ADMIN_PROJECT_ID'),
      clientEmail: required('FIREBASE_ADMIN_CLIENT_EMAIL'),
      privateKey,
    }),
  })
}

export function getAdminServices() {
  const app = getAdminApp()
  return {
    auth: getAuth(app),
    db: getFirestore(app),
  }
}
