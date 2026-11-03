import type { ProductId } from '../data/products'

export interface CheckoutCustomer {\n  name: string\n  email: string\n}\n\nexport interface CheckoutItemInput {
  productId: ProductId
  quantity: number
}

export interface CheckoutLine {
  productId: ProductId
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface CheckoutQuote {
  currency: 'USD'
  items: CheckoutLine[]
  subtotal: number
  total: number
}

export interface OrderRecord extends CheckoutQuote {
  id: string
  userId: string
  status: 'pending' | 'paid' | 'cancelled' | 'failed'
  createdAt: string
}
