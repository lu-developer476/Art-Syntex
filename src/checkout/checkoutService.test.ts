import { describe, expect, it, vi } from 'vitest'
import { createCheckoutQuote } from './checkoutService'
import { getCatalog } from '../firebase/services/productService'

vi.mock('../firebase/services/productService', () => ({
  getCatalog: vi.fn(),
}))

describe('createCheckoutQuote', () => {
  it('uses catalog prices instead of client-provided prices', async () => {
    vi.mocked(getCatalog).mockResolvedValue([
      {
        id: 'sandevistan',
        name: 'Sandevistan Mk.4',
        price: 3200,
        image: '/images/sandevistan.png',
        description: 'test',
        category: 'Neural',
      },
    ])

    const quote = await createCheckoutQuote([
      { productId: 'sandevistan', quantity: 2, unitPrice: 1 },
    ])

    expect(quote.total).toBe(6400)
    expect(quote.items[0].unitPrice).toBe(3200)
  })

  it('rejects invalid product ids', async () => {
    await expect(createCheckoutQuote([{ productId: 'fake', quantity: 1 }])).rejects.toThrow()
  })
})
