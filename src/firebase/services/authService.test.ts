import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../config', () => ({
  auth: {},
}))

import { getAuthErrorMessage, isEmailVerified } from './authService'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authService', () => {
  it('maps Firebase auth errors to safe user-facing messages', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe('Las credenciales no son válidas.')
    expect(getAuthErrorMessage({ code: 'auth/too-many-requests' })).toContain('Demasiados intentos')
    expect(getAuthErrorMessage({ code: 'auth/unknown' })).toBe('No se pudo completar la operación de autenticación.')
  })

  it('detects verified email state safely', () => {
    expect(isEmailVerified(null)).toBe(false)
    expect(isEmailVerified({ emailVerified: false } as never)).toBe(false)
    expect(isEmailVerified({ emailVerified: true } as never)).toBe(true)
  })
})
