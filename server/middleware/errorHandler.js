import { AppError } from '../core/errors.js'

export function errorHandler(error, req, res, _next) {
  const isKnownError = error instanceof AppError
  const explicitStatus = Number.isInteger(error?.statusCode) ? error.statusCode : null
  const statusCode = isKnownError ? error.statusCode : explicitStatus && explicitStatus >= 400 && explicitStatus < 500 ? explicitStatus : 500

  if (!isKnownError) {
    console.error(`[ERROR] requestId=${req.requestId ?? 'unknown'} Unhandled server error.`, error)
  }

  const response = {
    success: false,
    error: isKnownError || explicitStatus ? error.message : 'Internal server error.',
    requestId: req.requestId,
  }

  if (isKnownError && error.details) response.details = error.details
  return res.status(statusCode).json(response)
}
