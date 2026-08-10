import cors from 'cors'
import express from 'express'
import { createContactRouter } from './routes/contact.js'
import { createRegistrationRouter } from './routes/registration.js'
import { createEmailService } from './services/emailService.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp(config, dependencies = {}) {
  const app = express()
  const emailService = dependencies.emailService ?? createEmailService(config)

  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(
    cors(
      config.cors.allowedOrigin
        ? { origin: config.cors.allowedOrigin }
        : undefined,
    ),
  )
  app.use(express.json({ limit: '10kb' }))

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      service: 'art-syntex-mail-api',
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/contact', createContactRouter(emailService))
  app.use('/registration-notice', createRegistrationRouter(emailService))

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found.',
    })
  })

  app.use(errorHandler)
  return app
}
