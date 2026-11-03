import {
  createUserWithEmailAndPassword,
  type Auth,
  type UserCredential,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { Product } from '../data/products'

interface CartItem {
  product: Product
  quantity: number
}

export async function registerCustomerAccount(
  auth: Auth,
  db: Firestore,
  email: string,
  password: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)

  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email: credential.user.email,
    role: 'customer',
    createdAt: serverTimestamp(),
  })

  return credential
}

export async function createPurchaseOrder(
  db: Firestore,
  uid: string | null,
  customerName: string,
  email: string,
  cart: CartItem[],
): Promise<string> {
  if (cart.length === 0 || cart.length > 10) {
    throw new Error('El carrito no contiene productos válidos.')
  }

  const normalizedName = customerName.trim()
  const normalizedEmail = email.trim().toLowerCase()
  if (normalizedName.length < 2 || normalizedName.length > 120) {
    throw new Error('Ingresá un nombre válido.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Ingresá un correo electrónico válido.')
  }

  const items = cart.map(({ product, quantity }) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error('La cantidad de un producto no es válida.')
    }
    const price = product.price
    const subtotal = Math.round((price * quantity + Number.EPSILON) * 100) / 100
    return {
      productId: product.id,
      name: product.name,
      price,
      quantity,
      subtotal,
    }
  })

  const total = Math.round((items.reduce((sum, item) => sum + item.subtotal, 0) + Number.EPSILON) * 100) / 100
  const order = await addDoc(collection(db, 'purchaseOrders'), {
    uid,
    customerType: uid ? 'registered' : 'guest',
    customerName: normalizedName,
    email: normalizedEmail,
    status: 'pending',
    paymentStatus: 'unpaid',
    currency: 'USD',
    items,
    subtotal: total,
    total,
    createdAt: serverTimestamp(),
  })

  return order.id
}
