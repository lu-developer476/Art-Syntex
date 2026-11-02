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
