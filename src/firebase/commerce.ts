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
  uid: string,
  email: string,
  cart: CartItem[],
): Promise<void> {
  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)

  await addDoc(collection(db, 'purchaseOrders'), {
    uid,
    email,
    status: 'pending',
    total,
    items: cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    })),
    createdAt: serverTimestamp(),
  })
}
