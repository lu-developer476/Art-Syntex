import { getCatalog } from './services/productService'
export { findAllProducts, findOrSeedProducts, seedProducts } from './repositories/productRepository'

/**
 * Backward-compatible facade for the catalog data layer.
 * New application code should depend on the service layer instead.
 */
export async function getOrSeedProducts() {
  return getCatalog()
}
