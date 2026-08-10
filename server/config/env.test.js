import { describe, expect, it } from 'vitest'
import { getConfig } from './env.js'

describe('backend configuration', () => {
  it('normalizes environment values and derives defaults', () => {
    const config = getConfig({
      EMAIL_USER: ' mail@example.com ',
      EMAIL_PASS: ' secret ',
      ALLOWED_ORIGIN: 'https://art-syntex.example/',
      PORT: '4000',
    })

    expect(config.port).toBe(4000)
    expect(config.email.user).toBe('mail@example.com')
    expect(config.email.pass).toBe('secret')
    expect(config.email.receiver).toBe('mail@example.com')
    expect(config.cors.allowedOrigin).toBe('https://art-syntex.example/')
    expect(config.appBaseUrl).toBe('https://art-syntex.example')
    expect(config.missing).toEqual([])
  })

  it('reports missing required credentials without throwing during parsing', () => {
    const config = getConfig({ PORT: 'invalid' })

    expect(config.port).toBe(3001)
    expect(config.missing).toEqual(['EMAIL_USER', 'EMAIL_PASS'])
  })
})
