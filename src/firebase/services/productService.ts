import { findAllProducts } from '../repositories/productRepository'
import { productsSeed, type Product } from '../../data/products'

export async function getCatalog(): Promise<Product[]> {
  const products = await findAllProducts()
  return products.length > 0 ? products : productsSeed.map((product) => ({ ...product }))
}
