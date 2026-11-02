import { ValidationError } from '../core/errors.js'
import { validateNewsletterPayload } from '../validation.js'

export function createNewsletterController(newsletterService) {
  return async function newsletterController(req, res, next) {
    try {
      const { isValid, errors, sanitizedData } = validateNewsletterPayload(req.body)

      if (!isValid || !sanitizedData) {
        throw new ValidationError('Invalid newsletter subscription.', errors)
      }

      const result = await newsletterService.subscribe(sanitizedData)
      return res.status(200).json({ success: true, ...result })
    } catch (error) {
      return next(error)
    }
  }
}
