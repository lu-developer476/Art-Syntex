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
        id: 'cyber-arm',
        name: 'Cyber Arm',
        price: 100,
        image: '/images/cyber-arm.png',
        description: 'Test product',
        category: 'implants',
      },
    ]

    vi.mocked(findOrSeedProducts).mockResolvedValue(products)

    await expect(getCatalog()).resolves.toEqual(products)
    expect(findOrSeedProducts).toHaveBeenCalledOnce()
  })
})
