import { describe, expect, it, vi } from 'vitest'
import { createApp } from './app.js'

const config = {
  port: 3001,
  email: {
    user: 'test@example.com',
    pass: 'test-pass',
    receiver: 'receiver@example.com',
  },
  cors: {
    allowedOrigins: ['http://localhost:5173'],
  },
  appBaseUrl: 'http://localhost:5173',
}

describe('Express application', () => {
  const createTestDependencies = () => ({
    emailService: {
      transporter: { verify: vi.fn() },
      sendContactEmails: vi.fn(),
      sendRegistrationNotice: vi.fn(),
    },
    adminServices: {
      auth: { verifyIdToken: vi.fn() },
      db: {},
    },
  })

  it('exposes a health endpoint without requiring SMTP or Firebase Admin credentials', async () => {
    const app = createApp(config, createTestDependencies())

    const response = await new Promise((resolve) => {
      const server = app.listen(0, () => {
        fetch(`http://127.0.0.1:${server.address().port}/health`)
          .then(async (res) => resolve({ status: res.status, body: await res.json() }))
          .finally(() => server.close())
      })
    })

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('OK')
    expect(response.body.service).toBe('art-syntex-api')
  })

  it('returns a consistent 404 response for unknown routes', async () => {
    const app = createApp(config, createTestDependencies())

    const response = await new Promise((resolve) => {
      const server = app.listen(0, () => {
        fetch(`http://127.0.0.1:${server.address().port}/does-not-exist`)
          .then(async (res) => resolve({ status: res.status, body: await res.json() }))
          .finally(() => server.close())
      })
    })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ success: false, error: 'Route not found.' })
  })
})
