import { useMemo, useRef, useState } from 'react'
import { createPendingCheckout, downloadPurchaseOrderPdf } from '../checkout/checkoutApi'
import type { CheckoutCustomer } from '../checkout/checkoutTypes'
import type { Product } from '../data/products'
import type { CartItem } from '../lib/home'
import { useI18n } from '../i18n'

export function useCart() {
  const { t } = useI18n()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const checkoutInProgress = useRef(false)

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
    setCart((currentCart) => currentCart.map((item) =>
      item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
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

  const checkout = async (customer: CheckoutCustomer) => {
    if (checkoutInProgress.current) return
    setPurchaseMessage(null)

    if (cart.length === 0) {
      setPurchaseMessage('Agregá al menos un producto para continuar.')
      return
    }

    checkoutInProgress.current = true
    setIsCheckingOut(true)

    try {
      const result = await createPendingCheckout(cart.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })), customer)

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
      if (pdfDownloaded && result.emailDelivery?.customer) {
        setPurchaseMessage(t('purchaseOrderReady'))
      } else if (pdfDownloaded) {
        setPurchaseMessage(t('purchaseOrderEmailPending'))
      } else if (result.emailDelivery?.customer) {
        setPurchaseMessage(t('purchaseOrderPdfPendingEmailSent'))
      } else {
        setPurchaseMessage(t('purchaseOrderPdfPending'))
      }
    } catch (error) {
      setPurchaseMessage(error instanceof Error
        ? error.message
        : 'No pudimos iniciar el checkout. Volvé a intentarlo en unos minutos.')
    } finally {
      checkoutInProgress.current = false
      setIsCheckingOut(false)
    }
  }

  return {
    addToCart, cart, cartCount, cartTotal, checkout, closeCart, decreaseQuantity,
    increaseQuantity, isCartOpen, isCheckingOut, openCart, purchaseMessage,
    removeFromCart, setPurchaseMessage,
  }
}
