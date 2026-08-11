import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config'
import { FirebaseDataError } from '../errors'
import type { CheckoutQuote } from '../../checkout/checkoutTypes'

export async function createPendingOrder(userId: string, quote: CheckoutQuote) {
  try {
    const reference = await addDoc(collection(db, 'orders'), {
      userId,
      currency: quote.currency,
      items: quote.items,
      subtotal: quote.subtotal,
      total: quote.total,
      status: 'pending',
      createdAt: serverTimestamp(),
    })

    return reference.id
  } catch (error) {
    throw new FirebaseDataError('No se pudo crear la orden.', error)
  }
}
