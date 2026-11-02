import { FieldValue } from 'firebase-admin/firestore'
import { getAdminServices } from './firebaseAdmin.js'
import { fallbackCatalog } from '../data/catalog.js'

const MAX_QUANTITY = 20
const MAX_ITEMS = 50

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function validateItems(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_ITEMS) {
    const error = new Error('Invalid checkout items.')
    error.statusCode = 400
    throw error
  }

  const merged = new Map()

  for (const item of input) {
    const productId = item?.productId
    const quantity = item?.quantity

    if (typeof productId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      const error = new Error('Invalid product or quantity.')
      error.statusCode = 400
      throw error
    }

    merged.set(productId, (merged.get(productId) ?? 0) + quantity)
  }

  if ([...merged.values()].some((quantity) => quantity > MAX_QUANTITY)) {
    const error = new Error('Maximum quantity per product is 20.')
    error.statusCode = 400
    throw error
  }

  return [...merged.entries()]
}

export function createCheckoutService(services) {
  async function createPendingOrder({ idToken, items }) {
    const { auth, db } = services ?? getAdminServices()
    const decodedToken = await auth.verifyIdToken(idToken)

    if (!decodedToken.email_verified || typeof decodedToken.email !== 'string' || !decodedToken.email.trim()) {
      const error = new Error('A verified email address is required before checkout.')
      error.statusCode = 403
      throw error
    }

    const normalizedItems = validateItems(items)
    const catalogSnapshot = await db.collection('products').get()
    const products = new Map(catalogSnapshot.docs.map((snapshot) => {
      const data = snapshot.data()
      const productId = typeof data.id === 'string' ? data.id : snapshot.id
      return [productId, data]
    }))

    // The UI uses the same local demo seed when the Firestore catalog has not been seeded yet.
    // Keep checkout available in that state, but prefer Firestore prices whenever documents exist.
    if (catalogSnapshot.empty) {
      for (const product of fallbackCatalog) products.set(product.id, product)
    }

    const lines = normalizedItems.map(([productId, quantity]) => {
      const product = products.get(productId)
      if (!product) {
        const error = new Error('Product ' + productId + ' is unavailable.')
        error.statusCode = 409
        throw error
      }

      const unitPrice = Number(product.price)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        const error = new Error('Product ' + productId + ' has an invalid price.')
        error.statusCode = 500
        throw error
      }

      return {
        productId,
        name: String(product.name ?? productId).slice(0, 160),
        unitPrice: roundMoney(unitPrice),
        quantity,
        lineTotal: roundMoney(unitPrice * quantity),
      }
    })

    const total = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0))
    const orderRef = db.collection('purchaseOrders').doc()
    const customerEmail = decodedToken.email.trim().toLowerCase()
    const customerName = typeof decodedToken.name === 'string' && decodedToken.name.trim()
      ? decodedToken.name.trim().slice(0, 120)
      : 'Cliente de Art-Syntex'
    const createdAt = new Date().toISOString()

    await orderRef.set({
      uid: decodedToken.uid,
      email: customerEmail,
      status: 'pending',
      paymentStatus: 'unpaid',
      currency: 'USD',
      items: lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        price: line.unitPrice,
        quantity: line.quantity,
        subtotal: line.lineTotal,
      })),
      subtotal: total,
      total,
      createdAt: FieldValue.serverTimestamp(),
    })

    return {
      orderId: orderRef.id,
      customerEmail,
      customerName,
      items: lines,
      subtotal: total,
      total,
      currency: 'USD',
      status: 'pending',
      createdAt,
    }
  }

  return { createPendingOrder }
}
