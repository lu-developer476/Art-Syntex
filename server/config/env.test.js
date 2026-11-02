import { describe, expect, it } from 'vitest'
import { getConfig } from './env.js'

describe('backend configuration', () => {
  it('uses the configured Gmail account and derives SMTP and sender defaults', () => {
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
    expect(config.smtp).toEqual({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
    })
    expect(config.email).toEqual({
      user: 'mail@example.com',
      pass: 'secret',
      receiver: 'mail@example.com',
      contactFrom: 'mail@example.com',
      contactReplyTo: 'mail@example.com',
      newsletterFrom: 'mail@example.com',
      registrationFrom: 'mail@example.com',
    })
    expect(config.cors.allowedOrigins).toEqual(['https://art-syntex.example'])
    expect(config.appBaseUrl).toBe('https://art-syntex.example')
    expect(config.missing).toEqual([])
  })

  it('defaults the current sender to the project Gmail inbox', () => {
    const config = getConfig({
      EMAIL_PASS: 'app-password',
      FIREBASE_ADMIN_PROJECT_ID: 'project-id',
      FIREBASE_ADMIN_CLIENT_EMAIL: 'firebase-admin@example.com',
      FIREBASE_ADMIN_PRIVATE_KEY: 'private-key',
    })

    expect(config.email.user).toBe('lucasmontenegroburgos@gmail.com')
    expect(config.email.contactFrom).toBe('lucasmontenegroburgos@gmail.com')
    expect(config.email.newsletterFrom).toBe('lucasmontenegroburgos@gmail.com')
    expect(config.email.receiver).toBe('lucasmontenegroburgos@gmail.com')
    expect(config.missing).toEqual([])
  })

  it('allows SMTP and sender addresses to be replaced without code changes', () => {
    const config = getConfig({
      EMAIL_PASS: 'provider-secret',
      SMTP_HOST: 'smtp.example.net',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      CONTACT_FROM: 'contacto@art-syntex.net',
      CONTACT_RECEIVER_EMAIL: 'inbox@art-syntex.net',
      NEWSLETTER_FROM: 'newsletters@art-syntex.net',
      REGISTRATION_FROM: 'acceso@art-syntex.net',
      FIREBASE_ADMIN_PROJECT_ID: 'project-id',
      FIREBASE_ADMIN_CLIENT_EMAIL: 'firebase-admin@example.com',
      FIREBASE_ADMIN_PRIVATE_KEY: 'private-key',
    })

    expect(config.smtp).toEqual({
      host: 'smtp.example.net',
      port: 587,
      secure: false,
    })
    expect(config.email.contactFrom).toBe('contacto@art-syntex.net')
    expect(config.email.contactReplyTo).toBe('inbox@art-syntex.net')
    expect(config.email.newsletterFrom).toBe('newsletters@art-syntex.net')
    expect(config.email.registrationFrom).toBe('acceso@art-syntex.net')
  })

  it('reports missing required credentials without throwing during parsing', () => {
    const config = getConfig({ PORT: 'invalid' })

    expect(config.port).toBe(3001)
    expect(config.missing).toEqual([
      'EMAIL_PASS',
      'FIREBASE_ADMIN_PROJECT_ID',
      'FIREBASE_ADMIN_CLIENT_EMAIL',
      'FIREBASE_ADMIN_PRIVATE_KEY',
    ])
  })
})
