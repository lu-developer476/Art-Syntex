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
      sendNewsletterWelcome: vi.fn(),
      sendRegistrationNotice: vi.fn(),
      sendPurchaseOrderEmails: vi.fn().mockResolvedValue({ internal: true, customer: true }),
    },
    newsletterService: {
      subscribe: vi.fn().mockResolvedValue({
        alreadySubscribed: false,
        welcomeEmailSent: true,
      }),
    },
    adminServices: {
      auth: { verifyIdToken: vi.fn() },
      db: {},
    },
    checkoutDeliveryService: {
      createPendingOrder: vi.fn().mockResolvedValue({ orderId: 'AS-GUEST-001', status: 'pending' }),
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

  it('validates and handles newsletter subscriptions through the API', async () => {
    const dependencies = createTestDependencies()
    const app = createApp(config, dependencies)

    const response = await new Promise((resolve) => {
      const server = app.listen(0, () => {
        fetch(`http://127.0.0.1:${server.address().port}/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'USER@example.com', consent: true }),
        })
          .then(async (res) => resolve({ status: res.status, body: await res.json() }))
          .finally(() => server.close())
      })
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      alreadySubscribed: false,
      welcomeEmailSent: true,
    })
    expect(dependencies.newsletterService.subscribe).toHaveBeenCalledWith({
      email: 'user@example.com',
      consent: true,
    })
  })

  it('rejects newsletter subscriptions without explicit consent', async () => {
    const dependencies = createTestDependencies()
    const app = createApp(config, dependencies)

    const response = await new Promise((resolve) => {
      const server = app.listen(0, () => {
        fetch(`http://127.0.0.1:${server.address().port}/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com', consent: false }),
        })
          .then(async (res) => resolve({ status: res.status, body: await res.json() }))
          .finally(() => server.close())
      })
    })

    expect(response.status).toBe(400)
    expect(dependencies.newsletterService.subscribe).not.toHaveBeenCalled()
  })

  it('accepts checkout as a guest without an Authorization header', async () => {
    const dependencies = createTestDependencies()
    const app = createApp(config, dependencies)

    const response = await new Promise((resolve) => {
      const server = app.listen(0, () => {
        fetch(`http://127.0.0.1:${server.address().port}/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: { name: 'Guest Buyer', email: 'guest@example.com' },
            items: [{ productId: 'sandevistan', quantity: 1 }],
          }),
        })
          .then(async (res) => resolve({ status: res.status, body: await res.json() }))
          .finally(() => server.close())
      })
    })

    expect(response.status).toBe(201)
    expect(response.body.orderId).toBe('AS-GUEST-001')
    expect(dependencies.checkoutDeliveryService.createPendingOrder).toHaveBeenCalledWith({
      firebaseUser: null,
      customer: { name: 'Guest Buyer', email: 'guest@example.com' },
      items: [{ productId: 'sandevistan', quantity: 1 }],
    })
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
