import { describe, expect, it } from 'vitest'
import { getConfig } from './env.js'

describe('backend configuration', () => {
  it('normalizes environment values and derives defaults', () => {
    const config = getConfig({
      EMAIL_USER: ' mail@example.com ',
      EMAIL_PASS: ' secret ',
      FIREBASE_ADMIN_PROJECT_ID: 'project-id',
      FIREBASE_ADMIN_CLIENT_EMAIL: 'firebase-admin@example.com',
      FIREBASE_ADMIN_PRIVATE_KEY: 'private-key',
      ALLOWED_ORIGIN: 'https://art-syntex.example/',
      PORT: '4000',
    })

    expect(config.port).toBe(4000)
    expect(config.email.user).toBe('mail@example.com')
    expect(config.email.pass).toBe('secret')
    expect(config.email.receiver).toBe('mail@example.com')
    expect(config.cors.allowedOrigins).toEqual(['https://art-syntex.example'])
    expect(config.appBaseUrl).toBe('https://art-syntex.example')
    expect(config.missing).toEqual([])
  })

  it('reports all missing required credentials without throwing during parsing', () => {
    const config = getConfig({ PORT: 'invalid' })

    expect(config.port).toBe(3001)
    expect(config.missing).toEqual([
      'EMAIL_USER',
      'EMAIL_PASS',
      'FIREBASE_ADMIN_PROJECT_ID',
      'FIREBASE_ADMIN_CLIENT_EMAIL',
      'FIREBASE_ADMIN_PRIVATE_KEY',
    ])
  })
})
