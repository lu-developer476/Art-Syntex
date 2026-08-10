import { describe, expect, it, vi } from 'vitest'
import { getCatalog } from './productService'
import { findOrSeedProducts } from '../repositories/productRepository'

vi.mock('../repositories/productRepository', () => ({
  findOrSeedProducts: vi.fn(),
}))

describe('productService', () => {
  it('delegates catalog retrieval to the repository', async () => {
    const products = [
      {
        id: 'sandevistan',
        name: 'Sandevistan Mk.4',
        price: 3200,
        image: '/images/sandevistan.png',
        description: 'Test product',
        category: 'Neural' as const,
      },
    ]

    vi.mocked(findOrSeedProducts).mockResolvedValue(products)

    await expect(getCatalog()).resolves.toEqual(products)
    expect(findOrSeedProducts).toHaveBeenCalledOnce()
  })
})
