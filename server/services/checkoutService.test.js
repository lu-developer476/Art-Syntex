import { describe, expect, it, vi } from 'vitest'
import { createCheckoutService } from './checkoutService.js'

function createAdminServices(products = []) {
  const savedOrder = { current: null }
  const orderReference = {
    id: 'AS-ORDER-TEST',
    set: vi.fn(async (value) => {
      savedOrder.current = value
    }),
  }
  const auth = {
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'customer-1',
      email: 'buyer@example.com',
      email_verified: true,
      name: 'Buyer',
    }),
  }
  const db = {
    collection: vi.fn((name) => {
      if (name === 'products') {
        return {
          get: vi.fn().mockResolvedValue({
            empty: products.length === 0,
            docs: products.map((product) => ({
              id: product.documentId || product.id,
              data: () => product,
            })),
          }),
        }
      }

      if (name === 'purchaseOrders') {
        return { doc: vi.fn(() => orderReference) }
      }

      throw new Error('Unexpected collection: ' + name)
    }),
  }

  return { auth, db, orderReference, savedOrder }
}

describe('checkout service', () => {
  it('uses authoritative Firestore prices and saves a pending purchase order', async () => {
    const services = createAdminServices([
      { id: 'sandevistan', name: 'Sandevistan Mk.4', price: 3200 },
    ])
    const service = createCheckoutService(services)

    const order = await service.createPendingOrder({
      idToken: 'valid-token',
      items: [{ productId: 'sandevistan', quantity: 2 }],
    })

    expect(order).toMatchObject({
      orderId: 'AS-ORDER-TEST',
      customerEmail: 'buyer@example.com',
      customerName: 'Buyer',
      total: 6400,
      currency: 'USD',
      status: 'pending',
    })
    expect(services.savedOrder.current).toMatchObject({
      uid: 'customer-1',
      email: 'buyer@example.com',
      status: 'pending',
      paymentStatus: 'unpaid',
      total: 6400,
      items: [{
        productId: 'sandevistan',
        price: 3200,
        quantity: 2,
        subtotal: 6400,
      }],
    })
    expect(services.db.collection).toHaveBeenCalledWith('purchaseOrders')
  })

  it('uses the matching storefront demo catalog when Firestore is empty', async () => {
    const services = createAdminServices([])
    const service = createCheckoutService(services)

    const order = await service.createPendingOrder({
      idToken: 'valid-token',
      items: [{ productId: 'sandevistan', quantity: 2 }],
    })

    expect(order.total).toBe(6400)
    expect(order.items[0]).toMatchObject({
      productId: 'sandevistan',
      name: 'Sandevistan Mk.4',
      unitPrice: 3200,
      quantity: 2,
      lineTotal: 6400,
    })
  })

  it('rejects users whose Firebase email is not verified', async () => {
    const services = createAdminServices([])
    services.auth.verifyIdToken.mockResolvedValue({
      uid: 'customer-1',
      email: 'buyer@example.com',
      email_verified: false,
    })
    const service = createCheckoutService(services)

    await expect(service.createPendingOrder({
      idToken: 'unverified-token',
      items: [{ productId: 'sandevistan', quantity: 1 }],
    })).rejects.toThrow('A verified email address is required')
    expect(services.savedOrder.current).toBeNull()
  })

  it('rejects products outside the active catalog', async () => {
    const services = createAdminServices([])
    const service = createCheckoutService(services)

    await expect(service.createPendingOrder({
      idToken: 'valid-token',
      items: [{ productId: 'not-a-product', quantity: 1 }],
    })).rejects.toThrow('is unavailable')
    expect(services.savedOrder.current).toBeNull()
  })
})
