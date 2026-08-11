import { isProductId, type ProductId } from '../data/products'
import type { CheckoutItemInput } from './checkoutTypes'

const MAX_QUANTITY = 20
const MAX_DISTINCT_ITEMS = 50

export function validateCheckoutItems(input: unknown): CheckoutItemInput[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_DISTINCT_ITEMS) {
    throw new Error('El carrito no es válido.')
  }

  const merged = new Map<ProductId, number>()

  for (const item of input) {
    if (!item || typeof item !== 'object') throw new Error('El carrito no es válido.')

    const productId = (item as { productId?: unknown }).productId
    const quantity = (item as { quantity?: unknown }).quantity

    if (!isProductId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new Error('El carrito contiene una cantidad o producto inválido.')
    }

    merged.set(productId, (merged.get(productId) ?? 0) + quantity)
  }

  if ([...merged.values()].some((quantity) => quantity > MAX_QUANTITY)) {
    throw new Error('La cantidad máxima por producto es 20.')
  }

  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))
}
