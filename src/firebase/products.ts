import {
  collection,
  doc,
  getDocs,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './config'
import { productsSeed, type Product } from '../data/products'

const productsCollection = collection(db, 'products')

function normalizeProduct(data: DocumentData, fallbackId: string): Product {
  return {
    id: data.id ?? fallbackId,
    name: data.name,
    price: Number(data.price),
    image: data.image,
    description: data.description,
    category: data.category,
    featured: Boolean(data.featured),
  }
}

export async function getOrSeedProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection)

  if (snapshot.empty) {
    await Promise.all(
      productsSeed.map((product) =>
        setDoc(doc(productsCollection, product.id), {
          ...product,
          createdAt: new Date().toISOString(),
        }),
      ),
    )

    return productsSeed
  }

  return snapshot.docs
    .map((entry) => normalizeProduct(entry.data(), entry.id))
    .sort((a, b) => a.name.localeCompare(b.name))
}
