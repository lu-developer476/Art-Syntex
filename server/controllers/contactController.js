import { ValidationError } from '../core/errors.js'
import { validateContactPayload } from '../validation.js'

export function createContactController(emailService) {
  return async function contactController(req, res, next) {
    try {
      const { isValid, errors, sanitizedData } = validateContactPayload(req.body)

      if (!isValid || !sanitizedData) {
        throw new ValidationError('Invalid request payload.', errors)
      }

      await emailService.sendContactEmails(sanitizedData)
      return res.status(200).json({ success: true })
    } catch (error) {
      return next(error)
    }
  }
}
