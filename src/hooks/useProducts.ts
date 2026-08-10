import { useEffect, useState } from 'react'
import { getCatalog } from '../firebase/services/productService'
import type { Product } from '../data/products'
import { getFirebaseErrorMessage } from '../firebase/errors'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null)
        const items = await getCatalog()
        setProducts(items)
      } catch (loadError) {
        setError(
          getFirebaseErrorMessage(
            loadError,
            'No pudimos conectarte a la red. Revisá tu conexión e intentá de nuevo.',
          ),
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return {
    error,
    loading,
    products,
    selectedProduct,
    setSelectedProduct,
  }
}
