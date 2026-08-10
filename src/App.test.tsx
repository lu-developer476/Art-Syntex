import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./layout/Main', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock('./components/Container', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./pages/Home', () => ({ default: () => <div>Home route</div> }))
vi.mock('./pages/Access', () => ({ default: () => <div>Access route</div> }))
vi.mock('./pages/Products', () => ({ default: () => <div>Products route</div> }))
vi.mock('./pages/Contact', () => ({ default: () => <div>Contact route</div> }))
vi.mock('./pages/VerifyEmail', () => ({ default: () => <div>Verify route</div> }))

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Suspense fallback={<div>Loading route</div>}>
        <App />
      </Suspense>
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it.each([
    ['/', 'Home route'],
    ['/acceso', 'Access route'],
    ['/productos', 'Products route'],
    ['/contacto', 'Contact route'],
    ['/verificar-email', 'Verify route'],
  ])('renders the expected page for %s', async (path, expectedText) => {
    renderRoute(path)
    expect(await screen.findByText(expectedText)).toBeInTheDocument()
  })
})
