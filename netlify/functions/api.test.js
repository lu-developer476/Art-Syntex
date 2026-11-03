import { describe, expect, it } from 'vitest'
import { handleRequest } from './api.mjs'

describe('Netlify serverless API', () => {
  it('exposes a health endpoint without external credentials', async () => {
    const response = await handleRequest(new Request('https://api.example/health'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      status: 'OK',
      service: 'art-syntex-serverless-api',
    })
  })

  it('creates a guest checkout without an Authorization header', async () => {
    const savedOrders = []
    const adminServices = {
      auth: { verifyIdToken: vi.fn() },
      db: {
        collection(name) {
          if (name === 'products') {
            return { get: async () => ({ empty: true, docs: [] }) }
          }
          if (name === 'purchaseOrders') {
            return {
              doc() {
                return {
                  id: 'AS-GUEST-TEST',
                  set: async (order) => savedOrders.push(order),
                }
              },
            }
          }
          throw new Error('Unexpected collection: ' + name)
        },
      },
    }

    const response = await handleRequest(new Request('https://api.example/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Guest Buyer', email: 'guest@example.com' },
        items: [{ productId: 'sandevistan', quantity: 1 }],
      }),
    }), { adminServices })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      orderId: 'AS-GUEST-TEST',
      customerType: 'guest',
      pdfReady: true,
    })
    expect(adminServices.auth.verifyIdToken).not.toHaveBeenCalled()
    expect(savedOrders[0]).toMatchObject({
      uid: null,
      customerType: 'guest',
      email: 'guest@example.com',
      paymentStatus: 'unpaid',
    })
  })

  it('returns 404 for unknown routes', async () => {
    const response = await handleRequest(new Request('https://api.example/not-found'))

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'Route not found.',
    })
  })

  it('validates contact data before attempting SMTP delivery', async () => {
    const response = await handleRequest(new Request('https://api.example/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'invalid', message: 'short' }),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'Invalid contact request.',
    })
  })
})
