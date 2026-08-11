import { AppError } from '../core/errors.js'

export function errorHandler(error, req, res, _next) {
  const isKnownError = error instanceof AppError
  const statusCode = isKnownError ? error.statusCode : 500

  if (!isKnownError) {
    console.error(`[ERROR] requestId=${req.requestId ?? 'unknown'} Unhandled server error.`, error)
  }

  const response = {
    success: false,
    error: isKnownError ? error.message : 'Internal server error.',
    requestId: req.requestId,
  }

  if (isKnownError && error.details) {
    response.details = error.details
  }

  return res.status(statusCode).json(response)
}
