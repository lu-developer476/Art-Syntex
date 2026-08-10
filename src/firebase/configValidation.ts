const REQUIRED_FIREBASE_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

type FirebaseEnv = Record<string, unknown>

export function getMissingFirebaseEnv(env: FirebaseEnv): string[] {
  return REQUIRED_FIREBASE_ENV.filter((name) => {
    const value = env[name]
    return typeof value !== 'string' || value.trim().length === 0
  })
}

export function assertFirebaseEnv(env: FirebaseEnv): void {
  const missing = getMissingFirebaseEnv(env)

  if (missing.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missing.join(', ')}`)
  }
}
