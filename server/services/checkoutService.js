import { FieldValue } from 'firebase-admin/firestore'
import { getAdminServices } from './firebaseAdmin.js'
import { fallbackCatalog } from '../data/catalog.js'

const MAX_QUANTITY = 20
const MAX_ITEMS = 50

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function checkoutError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function validateItems(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_ITEMS) {
    throw checkoutError('Invalid checkout items.')
  }

  const merged = new Map()
  for (const item of input) {
    const productId = item?.productId
    const quantity = item?.quantity
    if (typeof productId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw checkoutError('Invalid product or quantity.')
    }
    merged.set(productId, (merged.get(productId) ?? 0) + quantity)
  }

  if ([...merged.values()].some((quantity) => quantity > MAX_QUANTITY)) {
    throw checkoutError('Maximum quantity per product is 20.')
  }
  return [...merged.entries()]
}

function validateCustomer(customer) {
  const name = typeof customer?.name === 'string' ? customer.name.trim() : ''
  const email = typeof customer?.email === 'string' ? customer.email.trim().toLowerCase() : ''

  if (name.length < 2 || name.length > 120) {
    throw checkoutError('Ingresá tu nombre (entre 2 y 120 caracteres).')
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw checkoutError('Ingresá una dirección de correo válida.')
  }
  return { name, email }
}

export function createCheckoutService(services) {
  async function createPendingOrder({ firebaseUser = null, customer, items }) {
    const { db } = services ?? getAdminServices()
    const { name: customerName, email: customerEmail } = validateCustomer(customer)
    const normalizedItems = validateItems(items)
    const catalogSnapshot = await db.collection('products').get()
    const products = new Map(catalogSnapshot.docs.map((snapshot) => {
      const data = snapshot.data()
      const productId = typeof data.id === 'string' ? data.id : snapshot.id
      return [productId, data]
    }))

    if (catalogSnapshot.empty) {
      for (const product of fallbackCatalog) products.set(product.id, product)
    }

    const lines = normalizedItems.map(([productId, quantity]) => {
      const product = products.get(productId)
      if (!product) throw checkoutError('Product ' + productId + ' is unavailable.', 409)

      const unitPrice = Number(product.price)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw checkoutError('Product ' + productId + ' has an invalid price.', 500)
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
    const createdAt = new Date().toISOString()

    await orderRef.set({
      uid: firebaseUser?.uid ?? null,
      customerType: firebaseUser ? 'registered' : 'guest',
      email: customerEmail,
      customerName,
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
      customerType: firebaseUser ? 'registered' : 'guest',
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
