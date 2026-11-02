import { describe, expect, it } from 'vitest'
import { createPurchaseOrderPdf } from './purchaseOrderPdf.js'

describe('purchase order PDF', () => {
  it('creates a PDF with order, customer, products and Spanish characters intact', () => {
    const pdf = createPurchaseOrderPdf({
      orderId: 'AS-ORDER-123',
      customerName: 'José Núñez',
      customerEmail: 'buyer@example.com',
      createdAt: '2026-11-02T12:00:00.000Z',
      items: [{
        name: 'Sándevistan Mk.4',
        quantity: 2,
        unitPrice: 3200,
        lineTotal: 6400,
      }],
      total: 6400,
    })

    const source = pdf.toString('latin1')
    expect(source.startsWith('%PDF-1.4')).toBe(true)
    expect(source).toContain('AS-ORDER-123')
    expect(source).toContain('José Núñez')
    expect(source).toContain('buyer@example.com')
    expect(source).toContain('Sándevistan Mk.4')
    expect(source).toContain('PENDIENTE DE CONFIRMACIÓN / PAGO')
    expect(source).toContain('confirmado ningún pago')
    expect(source.endsWith('%%EOF')).toBe(true)
  })

  it('rejects invalid or empty orders', () => {
    expect(() => createPurchaseOrderPdf(null)).toThrow('A valid purchase order is required')
    expect(() => createPurchaseOrderPdf({
      orderId: 'AS-1',
      items: [],
      total: 10,
    })).toThrow('A valid purchase order is required')
  })
})
