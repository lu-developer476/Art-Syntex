import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'

const mocks = vi.hoisted(() => ({
  products: {
    products: [],
    loading: false,
  },
  cart: {
    cart: [],
  },
  t: (key: string) =>
    ({
      statProducts: 'Products',
      statCart: 'Cart',
      statStatus: 'Status',
      statActive: 'Active',
      statSync: 'Syncing',
    })[key] ?? key,
}))

vi.mock('../sections/Hero', () => ({
  default: () => <div data-testid="hero-section">Hero</div>,
}))

vi.mock('../hooks/useProducts', () => ({
  useProducts: () => mocks.products,
}))

vi.mock('../hooks/useCart', () => ({
  useCart: () => mocks.cart,
}))

vi.mock('../i18n', () => ({
  useI18n: () => ({ t: mocks.t }),
}))

describe('Home', () => {
  beforeEach(() => {
    mocks.products = { products: [], loading: false }
    mocks.cart = { cart: [] }
  })

  it('renders the hero and home status cards', () => {
    mocks.products = { products: [{ id: '1' }], loading: false }
    mocks.cart = { cart: [{ id: 'cart-1' }] }

    render(<Home />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByText('Cart')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('uses the loading status while products are synchronizing', () => {
    mocks.products = { products: [], loading: true }

    render(<Home />)

    expect(screen.getByText('Syncing')).toBeInTheDocument()
  })
})
