import {
  collection,
  getDocs,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../config'
import {
  getProductSeedById,
  isProductCategory,
  isProductId,
  productsSeed,
  type Product,
  type ProductCategory,
} from '../../data/products'
import { FirebaseDataError } from '../errors'

const productsCollection = collection(db, 'products')
const LEGACY_IMAGE_PATHS: Readonly<Record<string, Product['image']>> = {
  '/images/proyectile-ls.png': '/images/projectile-ls.png',
}

function parseProductPrice(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseProductCategory(value: unknown, fallback: ProductCategory): ProductCategory {
  return isProductCategory(value) ? value : fallback
}

function parseProductImage(value: unknown, fallback: Product['image']): Product['image'] {
  if (typeof value !== 'string' || value.length === 0) return fallback
  return LEGACY_IMAGE_PATHS[value] ?? (value as Product['image'])
}

function normalizeProduct(snapshot: QueryDocumentSnapshot<DocumentData>): Product {
  const data = snapshot.data()
  const normalizedId = isProductId(data.id) ? data.id : snapshot.id

  if (!isProductId(normalizedId)) {
    throw new FirebaseDataError(`Producto inválido en Firestore: ${snapshot.id}`)
  }

  const seed = getProductSeedById(normalizedId)

  return {
    id: seed.id,
    name: typeof data.name === 'string' && data.name.length > 0 ? data.name : seed.name,
    price: parseProductPrice(data.price, seed.price),
    image: parseProductImage(data.image, seed.image),
    description:
      typeof data.description === 'string' && data.description.length > 0 ? data.description : seed.description,
    category: parseProductCategory(data.category, seed.category),
    ...(data.featured === true || seed.featured ? { featured: true } : {}),
  }
}

export async function findAllProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(productsCollection)
    return snapshot.docs.map(normalizeProduct).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  } catch (error) {
    if (error instanceof FirebaseDataError) throw error
    throw new FirebaseDataError('No pudimos recuperar el catálogo desde Firestore.', error)
  }
}

export async function findOrSeedProducts(): Promise<Product[]> {
  const products = await findAllProducts()
  return products.length > 0 ? products : productsSeed.map((product) => ({ ...product }))
}
