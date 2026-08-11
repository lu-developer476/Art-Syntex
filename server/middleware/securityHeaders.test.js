import { describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { securityHeaders } from './securityHeaders.js'

describe('securityHeaders', () => {
  it('sets baseline security headers', async () => {
    const app = express()
    app.use(securityHeaders)
    app.get('/', (_req, res) => res.json({ ok: true }))

    const response = await request(app).get('/')

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('DENY')
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(response.headers['permissions-policy']).toContain('camera=()')
  })
})
