import { auth } from '../firebase/config'
import type { CheckoutItemInput } from './checkoutTypes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function createPendingCheckout(items: CheckoutItemInput[]) {
  const user = auth.currentUser
  if (!user) throw new Error('Debes iniciar sesión para comprar.')

  const token = await user.getIdToken()
  const response = await fetch(`${API_BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo iniciar el checkout.')
  }

  return payload as { success: true; orderId: string; total: number; currency: 'USD'; requestId: string }
}
