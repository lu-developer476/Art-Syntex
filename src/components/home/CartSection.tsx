import type { User } from 'firebase/auth'
import type { CartItem } from '../../lib/home'
import { formatPrice } from '../../lib/home'
import { useI18n } from '../../i18n'

interface CartSectionProps {
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  isOpen: boolean
  isCheckingOut: boolean
  message: string | null
  onOpenCheckout: () => void
  onClose: () => void
  onDecreaseQuantity: (productId: string) => void
  onIncreaseQuantity: (productId: string) => void
  onRemoveFromCart: (productId: string) => void
  user: User | null
}

export default function CartSection({
  cart,
  cartCount,
  cartTotal,
  isOpen,
  isCheckingOut,
  message,
  onOpenCheckout,
  onClose,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveFromCart,
  user,
}: CartSectionProps) {
  const { t } = useI18n()

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/65 backdrop-blur-sm transition ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-purple-300/40 bg-gradient-to-br from-[#12041f] via-black to-slate-950 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-purple-300/20 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-purple-300/70">Carrito</p>
            <h3 className="mt-2 text-2xl font-semibold text-purple-100">Vista previa</h3>
            <p className="mt-2 text-sm text-purple-200">
              {cartCount === 0 ? 'No se han agregado productos al carrito.' : `${cartCount} item${cartCount === 1 ? '' : 's'} · ${formatPrice(cartTotal)}`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-purple-300/40 px-3 py-2 text-sm text-purple-100 transition hover:bg-purple-900/50">Cerrar</button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-300/30 bg-purple-950/20 p-5 text-sm text-purple-200">
              Añade productos para ver el resumen y avanzar al checkout.
            </div>
          ) : cart.map((item) => (
            <article key={item.product.id} className="rounded-2xl border border-purple-300/30 bg-white/5 p-4 shadow-lg shadow-black/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-android text-lg text-purple-50">{item.product.name}</h4>
                  <p className="mt-1 text-sm text-purple-300">{item.product.category}</p>
                </div>
                <button type="button" onClick={() => onRemoveFromCart(item.product.id)} className="text-xs uppercase tracking-[0.2em] text-purple-300 transition hover:text-purple-100">Quitar</button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-full border border-purple-300/30 px-2 py-1">
                  <button type="button" onClick={() => onDecreaseQuantity(item.product.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/60 text-lg text-white transition hover:bg-purple-800" aria-label={`Quitar una unidad de ${item.product.name}`}>−</button>
                  <span className="min-w-8 text-center text-sm font-semibold text-purple-50">{item.quantity}</span>
                  <button type="button" onClick={() => onIncreaseQuantity(item.product.id)} disabled={item.quantity >= 20} className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 text-lg text-white transition hover:bg-purple-600 disabled:opacity-40" aria-label={`Agregar una unidad de ${item.product.name}`}>+</button>
                </div>
                <span className="text-sm font-semibold text-purple-100">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="border-t border-purple-300/20 p-6">
          <div className="flex items-center justify-between text-sm text-purple-200">
            <span>Subtotal</span><span className="font-semibold text-purple-100">{formatPrice(cartTotal)}</span>
          </div>
          <button type="button" onClick={onOpenCheckout} disabled={cart.length === 0 || isCheckingOut} className="mt-5 w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-950 disabled:text-purple-300">
            {t('checkout')} ↗
          </button>
          <p className="mt-3 text-xs leading-5 text-purple-300">
            {user ? (
              `Sesión iniciada: ${user.email ?? 'cuenta autenticada'}.`
            ) : (
              <>
                Podés continuar como invitado o{' '}
                <a href="https://art-syntex.web.app/acceso" target="_blank" rel="noreferrer" className="font-semibold text-cyan-300 underline underline-offset-2 hover:text-cyan-200">crear una cuenta</a>
              </>
            )}
          </p>
          {message ? <p role="status" aria-live="polite" className="mt-3 text-sm text-purple-200">{message}</p> : null}
        </div>
      </aside>
    </>
  )
}
