import { Router } from 'express'
import { createCheckoutController } from '../controllers/checkoutController.js'
import { createFirebaseAuthenticator } from '../middleware/authenticateFirebase.js'
import { createRateLimiter } from '../middleware/rateLimiter.js'

export function createCheckoutRouter(checkoutService, authServices) {
  const router = Router()
  const rateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many checkout attempts. Please try again later.',
  })

  router.post(
    '/',
    rateLimiter,
    createFirebaseAuthenticator(authServices),
    createCheckoutController(checkoutService),
  )

  return router
}
