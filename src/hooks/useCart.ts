import { useMemo, useState } from 'react'
import { createPendingCheckout, downloadPurchaseOrderPdf } from '../checkout/checkoutApi'
import type { Product } from '../data/products'
import type { CartItem } from '../lib/home'
import { useI18n } from '../i18n'

interface PurchaseUser {
  uid: string
  email: string | null
}

export function useCart() {
  const { t } = useI18n()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)

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
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentCart, { product, quantity: 1 }]
    })
  }

  const increaseQuantity = (productId: string) => {
    setPurchaseMessage(null)
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }

  const decreaseQuantity = (productId: string) => {
    setPurchaseMessage(null)
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId: string) => {
    setPurchaseMessage(null)
    setCart((currentCart) => currentCart.filter((item) => item.product.id !== productId))
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const checkout = async (user: PurchaseUser | null) => {
    setPurchaseMessage(null)

    if (!user || cart.length === 0) {
      setPurchaseMessage('Necesitás una sesión activa y al menos un producto en el carrito para avanzar al checkout.')
      return
    }

    if (!user.email) {
      setPurchaseMessage('No pudimos iniciar el checkout porque tu cuenta no tiene un correo válido.')
      return
    }

    try {
      const result = await createPendingCheckout(cart.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })))

      let pdfDownloaded = false
      if (result.pdfReady && result.pdfBase64) {
        try {
          downloadPurchaseOrderPdf(result.pdfBase64, result.pdfFileName)
          pdfDownloaded = true
        } catch {
          pdfDownloaded = false
        }
      }

      setCart([])
      setIsCartOpen(false)

      if (pdfDownloaded && result.emailDelivery?.customer) {
        setPurchaseMessage(t('purchaseOrderReady'))
      } else if (pdfDownloaded) {
        setPurchaseMessage(t('purchaseOrderEmailPending'))
      } else {
        setPurchaseMessage(t('purchaseOrderPdfPending'))
      }
    } catch (error) {
      setPurchaseMessage(error instanceof Error
        ? error.message
        : 'No pudimos iniciar el checkout. Volvé a intentarlo en unos minutos.')
    }
  }

  return {
    addToCart,
    cart,
    cartCount,
    cartTotal,
    checkout,
    closeCart,
    decreaseQuantity,
    increaseQuantity,
    isCartOpen,
    openCart,
    purchaseMessage,
    removeFromCart,
    setPurchaseMessage,
  }
}
