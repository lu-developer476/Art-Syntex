import { createPendingOrder } from '../firebase/repositories/orderRepository'
import { createCheckoutQuote } from './checkoutService'

export async function prepareCheckout(userId: string, input: unknown) {
  if (!userId) throw new Error('Debes iniciar sesión para comprar.')

  const quote = await createCheckoutQuote(input)
  const orderId = await createPendingOrder(userId, quote)

  return {
    orderId,
    quote,
  }
}
