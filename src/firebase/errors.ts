export class FirebaseDataError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'FirebaseDataError'
  }
}

export function getFirebaseErrorMessage(error: unknown, fallback = 'No pudimos completar la operación.') {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
