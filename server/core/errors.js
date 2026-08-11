export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'Unable to process the request right now.') {
    super(message, 502)
    this.name = 'ExternalServiceError'
  }
}

export class SecurityError extends AppError {
  constructor(message = 'Request rejected.') {
    super(message, 403)
    this.name = 'SecurityError'
  }
}
