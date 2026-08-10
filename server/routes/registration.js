import { Router } from 'express'
import { createRegistrationController } from '../controllers/registrationController.js'
import { createRateLimiter } from '../middleware/rateLimiter.js'

export function createRegistrationRouter(emailService) {
  const router = Router()
  const rateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 6,
  })

  router.post('/', rateLimiter, createRegistrationController(emailService))
  return router
}
