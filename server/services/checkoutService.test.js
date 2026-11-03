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
      if (name === 'purchaseOrders') return { doc: vi.fn(() => orderReference) }
      throw new Error('Unexpected collection: ' + name)
    }),
  }
  return { db, orderReference, savedOrder }
}

const customer = { name: 'Buyer Example', email: 'buyer@example.com' }
const items = [{ productId: 'sandevistan', quantity: 2 }]

describe('checkout service', () => {
  it('creates an order for a guest without a Firebase account', async () => {
    const services = createAdminServices([
      { id: 'sandevistan', name: 'Sandevistan Mk.4', price: 3200 },
    ])
    const service = createCheckoutService(services)

    const order = await service.createPendingOrder({ customer, items })

    expect(order).toMatchObject({
      orderId: 'AS-ORDER-TEST',
      customerEmail: 'buyer@example.com',
      customerName: 'Buyer Example',
      customerType: 'guest',
      total: 6400,
      currency: 'USD',
      status: 'pending',
    })
    expect(services.savedOrder.current).toMatchObject({
      uid: null,
      customerType: 'guest',
      email: 'buyer@example.com',
      customerName: 'Buyer Example',
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
  })

  it('associates the order with a signed-in customer without requiring verified email', async () => {
    const services = createAdminServices([])
    const service = createCheckoutService(services)
    const firebaseUser = { uid: 'customer-1', email_verified: false }

    const order = await service.createPendingOrder({ firebaseUser, customer, items: [items[0]] })

    expect(order.customerType).toBe('registered')
    expect(services.savedOrder.current.uid).toBe('customer-1')
    expect(services.savedOrder.current.email).toBe('buyer@example.com')
  })

  it('uses the matching storefront demo catalog when Firestore is empty', async () => {
    const services = createAdminServices([])
    const service = createCheckoutService(services)

    const order = await service.createPendingOrder({ customer, items })

    expect(order.total).toBe(6400)
    expect(order.items[0]).toMatchObject({
      productId: 'sandevistan',
      name: 'Sandevistan Mk.4',
      unitPrice: 3200,
      quantity: 2,
      lineTotal: 6400,
    })
  })

  it('rejects invalid customer email addresses', async () => {
    const services = createAdminServices([])
    const service = createCheckoutService(services)

    await expect(service.createPendingOrder({
      customer: { name: 'Buyer', email: 'not-an-email' },
      items: [items[0]],
    })).rejects.toThrow('Ingresá una dirección de correo válida.')
    expect(services.savedOrder.current).toBeNull()
  })

  it('rejects products outside the active catalog', async () => {
    const services = createAdminServices([])
    const service = createCheckoutService(services)

    await expect(service.createPendingOrder({
      customer,
      items: [{ productId: 'not-a-product', quantity: 1 }],
    })).rejects.toThrow('is unavailable')
    expect(services.savedOrder.current).toBeNull()
  })
})
