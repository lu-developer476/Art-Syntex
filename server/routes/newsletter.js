import { Router } from 'express'
import { createNewsletterController } from '../controllers/newsletterController.js'
import { createRateLimiter } from '../middleware/rateLimiter.js'

export function createNewsletterRouter(newsletterService) {
  const router = Router()
  const rateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 6,
  })

  router.post('/subscribe', rateLimiter, createNewsletterController(newsletterService))
  return router
}
