import cors from 'cors'
import express from 'express'
import { createContactRouter } from './routes/contact.js'
import { createRegistrationRouter } from './routes/registration.js'
import { createCheckoutRouter } from './routes/checkout.js'
import { createEmailService } from './services/emailService.js'
import { createCheckoutService } from './services/checkoutService.js'
import { getAdminServices } from './services/firebaseAdmin.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestGuards } from './middleware/requestGuards.js'
import { requestId } from './middleware/requestId.js'
import { securityHeaders } from './middleware/securityHeaders.js'

export function createApp(config, dependencies = {}) {
  const app = express()
  const emailService = dependencies.emailService ?? createEmailService(config)
  const adminServices = dependencies.adminServices ?? getAdminServices()
  const checkoutService = dependencies.checkoutService ?? createCheckoutService(adminServices)
  app.locals.emailService = emailService
  app.locals.checkoutService = checkoutService

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(requestId)
  app.use(securityHeaders)
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.cors.allowedOrigins.length === 0 || config.cors.allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Origin not allowed by CORS.'))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }))
  app.use(express.json({ limit: '10kb', strict: true }))
  app.use(requestGuards)

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', service: 'art-syntex-api', timestamp: new Date().toISOString() })
  })

  app.use('/contact', createContactRouter(emailService))
  app.use('/registration-notice', createRegistrationRouter(emailService))
  app.use('/checkout', createCheckoutRouter(checkoutService, adminServices))

  app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found.' }))
  app.use(errorHandler)
  return app
}
