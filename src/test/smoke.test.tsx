import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function TestComponent() {
  return <h1>Art-Syntex</h1>
}

describe('Testing Library setup', () => {
  it('renders React components in the jsdom environment', () => {
    render(<TestComponent />)

    expect(screen.getByRole('heading', { name: 'Art-Syntex' })).toBeInTheDocument()
  })
})
