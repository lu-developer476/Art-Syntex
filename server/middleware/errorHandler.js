import { AppError } from '../core/errors.js'

export function errorHandler(error, _req, res, _next) {
  const isKnownError = error instanceof AppError
  const statusCode = isKnownError ? error.statusCode : 500

  if (!isKnownError) {
    console.error('[ERROR] Unhandled server error.', error)
  }

  const response = {
    success: false,
    error: isKnownError ? error.message : 'Internal server error.',
  }

  if (isKnownError && error.details) {
    response.details = error.details
  }

  return res.status(statusCode).json(response)
}
