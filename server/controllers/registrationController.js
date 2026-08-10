import { ValidationError } from '../core/errors.js'
import { validateRegistrationPayload } from '../validation.js'

export function createRegistrationController(emailService) {
  return async function registrationController(req, res, next) {
    try {
      const { isValid, errors, sanitizedData } = validateRegistrationPayload(req.body)

      if (!isValid || !sanitizedData) {
        throw new ValidationError('Invalid request payload.', errors)
      }

      await emailService.sendRegistrationNotice(sanitizedData)
      return res.status(200).json({ success: true })
    } catch (error) {
      return next(error)
    }
  }
}
