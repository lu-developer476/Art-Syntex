import { describe, expect, it, vi } from 'vitest'
import { createCheckoutDeliveryService } from './checkoutDeliveryService.js'

describe('checkout delivery service', () => {
  it('creates the PDF and emails it to both the internal inbox and buyer', async () => {
    const order = {
      orderId: 'AS-ORDER-001',
      customerName: 'Cliente',
      customerEmail: 'buyer@example.com',
      items: [{ name: 'Implante', quantity: 1, unitPrice: 100, lineTotal: 100 }],
      total: 100,
      createdAt: '2026-11-02T12:00:00.000Z',
    }
    const checkoutService = { createPendingOrder: vi.fn().mockResolvedValue(order) }
    const emailService = {
      sendPurchaseOrderEmails: vi.fn().mockResolvedValue({ internal: true, customer: true }),
    }
    const service = createCheckoutDeliveryService(checkoutService, emailService)

    const result = await service.createPendingOrder({ idToken: 'token', items: [] })

    expect(checkoutService.createPendingOrder).toHaveBeenCalledWith({ idToken: 'token', items: [] })
    expect(emailService.sendPurchaseOrderEmails).toHaveBeenCalledWith(expect.objectContaining({
      order,
      fileName: 'orden-de-compra-AS-ORDER-001.pdf',
      pdfBuffer: expect.any(Buffer),
    }))
    expect(result).toMatchObject({
      orderId: 'AS-ORDER-001',
      pdfReady: true,
      emailDelivery: { internal: true, customer: true },
    })
    expect(Buffer.from(result.pdfBase64, 'base64').toString('latin1').startsWith('%PDF-1.4')).toBe(true)
  })

  it('keeps the saved order and generated PDF when SMTP delivery is unavailable', async () => {
    const order = {
      orderId: 'AS-ORDER-002',
      customerName: 'Cliente',
      customerEmail: 'buyer@example.com',
      items: [{ name: 'Implante', quantity: 1, unitPrice: 50, lineTotal: 50 }],
      total: 50,
      createdAt: '2026-11-02T12:00:00.000Z',
    }
    const checkoutService = { createPendingOrder: vi.fn().mockResolvedValue(order) }
    const service = createCheckoutDeliveryService(checkoutService, null)

    const result = await service.createPendingOrder({ idToken: 'token', items: [] })

    expect(result.pdfReady).toBe(true)
    expect(result.emailDelivery).toEqual({ internal: false, customer: false })
  })
})
