import { getCatalog } from '../firebase/services/productService'
import type { Product } from '../data/products'
import { validateCheckoutItems } from './checkoutValidation'
import type { CheckoutItemInput, CheckoutQuote } from './checkoutTypes'

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export async function createCheckoutQuote(input: unknown): Promise<CheckoutQuote> {
  const items = validateCheckoutItems(input)
  const catalog = await getCatalog()
  const products = new Map<Product['id'], Product>(catalog.map((product) => [product.id, product]))

  const lines = items.map(({ productId, quantity }: CheckoutItemInput) => {
    const product = products.get(productId)
    if (!product) throw new Error(`El producto ${productId} ya no está disponible.`)

    const unitPrice = roundMoney(product.price)
    return {
      productId,
      name: product.name,
      unitPrice,
      quantity,
      lineTotal: roundMoney(unitPrice * quantity),
    }
  })

  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0))

  return {
    currency: 'USD',
    items: lines,
    subtotal,
    total: subtotal,
  }
}
