import { useEffect, useMemo, useRef, useState } from 'react'
import type { Product } from '../data/products'
import type { CartItem } from '../lib/home'
import { useI18n } from '../i18n'

export const CHECKOUT_CART_KEY = 'art-syntex:checkout-cart:v1'

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CHECKOUT_CART_KEY)
    if (!raw) return []
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((item): item is CartItem =>
      Boolean(item && typeof item === 'object' &&
        'product' in item && 'quantity' in item &&
        typeof item.quantity === 'number' && Number.isInteger(item.quantity) &&
        item.quantity > 0 && item.quantity <= 20 &&
        item.product && typeof item.product === 'object' &&
        typeof item.product.id === 'string'),
    )
  } catch {
    return []
  }
}

export function useCart() {
  const { t } = useI18n()
  const [cart, setCart] = useState<CartItem[]>(() => readStoredCart())
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)
  const [isCheckingOut] = useState(false)
  const checkoutInProgress = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const syncCart = (event: StorageEvent) => {
      if (event.key === CHECKOUT_CART_KEY) setCart(readStoredCart())
    }
    window.addEventListener('storage', syncCart)
    return () => window.removeEventListener('storage', syncCart)
  }, [])

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart],
  )
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart])

  const addToCart = (product: Product) => {
    setPurchaseMessage(null)
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.product.id === product.id)
      if (existing) {
        return currentCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item,
        )
      }
      return [...currentCart, { product, quantity: 1 }]
    })
  }

  const increaseQuantity = (productId: string) => {
    setPurchaseMessage(null)
    setCart((currentCart) => currentCart.map((item) =>
      item.product.id === productId ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item,
    ))
  }

  const decreaseQuantity = (productId: string) => {
    setPurchaseMessage(null)
    setCart((currentCart) => currentCart
      .map((item) => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => {
    setPurchaseMessage(null)
    setCart((currentCart) => currentCart.filter((item) => item.product.id !== productId))
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const openCheckout = () => {
    if (cart.length === 0) {
      setPurchaseMessage('Agregá al menos un producto para continuar.')
      return
    }
    window.localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(
      cart.map(({ product, quantity }) => ({ productId: product.id, quantity })),
    ))
    window.open('/checkout', '_blank', 'noopener,noreferrer')
    setIsCartOpen(false)
  }

  return {
    addToCart, cart, cartCount, cartTotal, closeCart, decreaseQuantity,
    increaseQuantity, isCartOpen, isCheckingOut, openCart, openCheckout, purchaseMessage,
    removeFromCart, setPurchaseMessage,
  }
}
