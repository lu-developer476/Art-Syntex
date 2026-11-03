import CartSection from '../components/home/CartSection'
import ProductsSection from '../components/home/ProductsSection'
import { useAuthState } from '../hooks/useAuthState'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'

export default function ProductsPageSection() {
  const auth = useAuthState()
  const products = useProducts()
  const cart = useCart()

  return (
    <section className="space-y-6">
      <ProductsSection
        cartCount={cart.cartCount}
        cartTotal={cart.cartTotal}
        error={products.error}
        loading={products.loading}
        onAddToCart={cart.addToCart}
        onOpenCart={cart.openCart}
        onSelectProduct={products.setSelectedProduct}
        products={products.products}
        selectedProduct={products.selectedProduct}
      />
      <CartSection
        cart={cart.cart}
        cartCount={cart.cartCount}
        cartTotal={cart.cartTotal}
        isOpen={cart.isCartOpen}
        isCheckingOut={cart.isCheckingOut}
        message={cart.purchaseMessage}
        onOpenCheckout={cart.openCheckout}
        onClose={cart.closeCart}
        onDecreaseQuantity={cart.decreaseQuantity}
        onIncreaseQuantity={cart.increaseQuantity}
        onRemoveFromCart={cart.removeFromCart}
        user={auth.user}
      />
    </section>
  )
}
