import { findOrSeedProducts } from '../repositories/productRepository'
import type { Product } from '../../data/products'

export async function getCatalog(): Promise<Product[]> {
  return findOrSeedProducts()
}
