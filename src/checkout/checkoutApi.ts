import { auth } from '../firebase/config'
import { resolveApiBaseUrl } from '../lib/api'
import type { CheckoutItemInput } from './checkoutTypes'

const API_BASE_URL = resolveApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV,
)

export interface PendingCheckoutResult {
  success: true
  orderId: string
  total: number
  currency: 'USD'
  status: 'pending'
  requestId: string
  pdfReady: boolean
  pdfFileName: string
  pdfBase64: string | null
  emailDelivery: {
    internal: boolean
    customer: boolean
  }
}

export async function createPendingCheckout(items: CheckoutItemInput[]): Promise<PendingCheckoutResult> {
  if (!API_BASE_URL) {
    throw new Error('El servicio de checkout no tiene una URL pública configurada.')
  }

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
    throw new Error(typeof payload.error === 'string' ? payload.error : 'No se pudo iniciar el checkout.')
  }

  return payload as PendingCheckoutResult
}

export function downloadPurchaseOrderPdf(base64: string, fileName: string) {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  const blob = new Blob([bytes], { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName || 'orden-de-compra-art-syntex.pdf'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
