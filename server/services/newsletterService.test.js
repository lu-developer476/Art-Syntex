import { describe, expect, it, vi } from 'vitest'
import { createNewsletterService } from './newsletterService.js'

function createFirestoreMock(initialData = null) {
  let storedData = initialData
  const reference = {
    set: vi.fn(async (value, options = {}) => {
      storedData = options.merge ? { ...storedData, ...value } : value
    }),
  }
  const db = {
    collection: vi.fn(() => ({
      doc: vi.fn(() => reference),
    })),
    runTransaction: vi.fn(async (callback) => {
      const transaction = {
        get: async () => ({
          exists: storedData !== null,
          data: () => storedData,
        }),
        set: (_reference, value, options = {}) => {
          storedData = options.merge ? { ...storedData, ...value } : value
        },
      }
      await callback(transaction)
    }),
  }

  return {
    db,
    reference,
    getStoredData: () => storedData,
  }
}

describe('newsletter subscription service', () => {
  it('stores consent, sends one welcome email, and does not resend it for an existing subscriber', async () => {
    const firestore = createFirestoreMock()
    const emailService = { sendNewsletterWelcome: vi.fn().mockResolvedValue(undefined) }
    const service = createNewsletterService(emailService, firestore)

    const firstResult = await service.subscribe({ email: 'reader@example.com' })
    const secondResult = await service.subscribe({ email: 'reader@example.com' })

    expect(firstResult).toEqual({ alreadySubscribed: false, welcomeEmailSent: true })
    expect(secondResult).toEqual({ alreadySubscribed: true, welcomeEmailSent: false })
    expect(emailService.sendNewsletterWelcome).toHaveBeenCalledTimes(1)
    expect(firestore.getStoredData()).toMatchObject({
      email: 'reader@example.com',
      consent: true,
      source: 'contact-page',
      status: 'subscribed',
      welcomeEmailStatus: 'sent',
    })
  })

  it('marks failed deliveries and permits a retry', async () => {
    const firestore = createFirestoreMock()
    const emailService = {
      sendNewsletterWelcome: vi.fn()
        .mockRejectedValueOnce(new Error('SMTP unavailable'))
        .mockResolvedValueOnce(undefined),
    }
    const service = createNewsletterService(emailService, firestore)

    await expect(service.subscribe({ email: 'reader@example.com' })).rejects.toThrow('SMTP unavailable')
    expect(firestore.getStoredData().welcomeEmailStatus).toBe('failed')

    const retryResult = await service.subscribe({ email: 'reader@example.com' })

    expect(retryResult).toEqual({ alreadySubscribed: false, welcomeEmailSent: true })
    expect(emailService.sendNewsletterWelcome).toHaveBeenCalledTimes(2)
    expect(firestore.getStoredData().welcomeEmailStatus).toBe('sent')
  })

  it('does not send a second welcome email while another request owns the delivery lease', async () => {
    const now = 1_800_000_000_000
    const firestore = createFirestoreMock({
      email: 'reader@example.com',
      welcomeEmailStatus: 'sending',
      welcomeEmailClaimedAt: { toMillis: () => now - 1000 },
    })
    const emailService = { sendNewsletterWelcome: vi.fn() }
    const service = createNewsletterService(emailService, firestore, () => now)

    const result = await service.subscribe({ email: 'reader@example.com' })

    expect(result).toEqual({
      alreadySubscribed: true,
      pending: true,
      welcomeEmailSent: false,
    })
    expect(emailService.sendNewsletterWelcome).not.toHaveBeenCalled()
  })
})
