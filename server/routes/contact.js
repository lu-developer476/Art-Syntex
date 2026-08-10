import { Router } from 'express'
import { createContactController } from '../controllers/contactController.js'
import { createRateLimiter } from '../middleware/rateLimiter.js'

export function createContactRouter(emailService) {
  const router = Router()
  const rateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 6,
  })

  router.post('/', rateLimiter, createContactController(emailService))
  return router
}
