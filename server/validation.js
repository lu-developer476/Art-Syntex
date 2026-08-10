const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 5000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function sanitizeInput(value, maxLength) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function validateContactPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      isValid: false,
      errors: ['Request body must be a JSON object.'],
      sanitizedData: null,
    }
  }

  const sanitizedData = {
    name: sanitizeInput(payload.name, MAX_NAME_LENGTH),
    email: sanitizeInput(payload.email, MAX_EMAIL_LENGTH).toLowerCase(),
    message: sanitizeInput(payload.message, MAX_MESSAGE_LENGTH),
  }

  const errors = []

  if (sanitizedData.name.length < 2) {
    errors.push('Name must be at least 2 characters long.')
  }

  if (!EMAIL_REGEX.test(sanitizedData.email)) {
    errors.push('Email address is invalid.')
  }

  if (sanitizedData.message.length < 20) {
    errors.push('Message must be at least 20 characters long.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  }
}

export function validateRegistrationPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      isValid: false,
      errors: ['Request body must be a JSON object.'],
      sanitizedData: null,
    }
  }

  const sanitizedData = {
    email: sanitizeInput(payload.email, MAX_EMAIL_LENGTH).toLowerCase(),
    verificationUrl: sanitizeInput(payload.verificationUrl, 1200),
  }

  const errors = []

  if (!EMAIL_REGEX.test(sanitizedData.email)) {
    errors.push('Email address is invalid.')
  }

  if (!/^https?:\/\//.test(sanitizedData.verificationUrl)) {
    errors.push('Verification URL is invalid.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  }
}
