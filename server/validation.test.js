import { describe, expect, it } from 'vitest'
import {
  sanitizeInput,
  validateContactPayload,
  validateRegistrationPayload,
} from './validation.js'

describe('sanitizeInput', () => {
  it('removes HTML/control characters, normalizes whitespace, and trims', () => {
    expect(sanitizeInput('  <Lu>\n\u0000  Developer  ', 100)).toBe('Lu Developer')
  })

  it('respects the maximum length', () => {
    expect(sanitizeInput('abcdefghij', 5)).toBe('abcde')
  })
})

describe('validateContactPayload', () => {
  it('accepts valid data and normalizes the email', () => {
    const result = validateContactPayload({
      name: 'Lu',
      email: 'LU@EXAMPLE.COM',
      message: 'This is a valid contact message.',
    })

    expect(result).toEqual({
      isValid: true,
      errors: [],
      sanitizedData: {
        name: 'Lu',
        email: 'lu@example.com',
        message: 'This is a valid contact message.',
      },
    })
  })

  it('rejects invalid contact data with useful validation errors', () => {
    const result = validateContactPayload({
      name: 'L',
      email: 'not-an-email',
      message: 'Too short',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual([
      'Name must be at least 2 characters long.',
      'Email address is invalid.',
      'Message must be at least 20 characters long.',
    ])
  })

  it('rejects non-object request bodies', () => {
    expect(validateContactPayload(null)).toEqual({
      isValid: false,
      errors: ['Request body must be a JSON object.'],
      sanitizedData: null,
    })
  })
})

describe('validateRegistrationPayload', () => {
  it('accepts a valid email and HTTP verification URL', () => {
    const result = validateRegistrationPayload({
      email: 'USER@example.com',
      verificationUrl: 'https://example.com/verificar-email',
    })

    expect(result).toEqual({
      isValid: true,
      errors: [],
      sanitizedData: {
        email: 'user@example.com',
        verificationUrl: 'https://example.com/verificar-email',
      },
    })
  })

  it('rejects invalid email and verification URL values', () => {
    const result = validateRegistrationPayload({
      email: 'invalid',
      verificationUrl: 'javascript:alert(1)',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual([
      'Email address is invalid.',
      'Verification URL is invalid.',
    ])
  })
})
