import { afterEach, describe, expect, it, vi } from 'vitest'
import { postMailService } from './api'

describe('postMailService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends a POST request with the expected payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await postMailService({
      path: '/contact',
      payload: {
        name: 'Lu',
        email: 'lu@example.com',
        message: 'Hello',
      },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/contact',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Lu',
          email: 'lu@example.com',
          message: 'Hello',
        }),
      }),
    )
  })

  it('throws the API error message when the response is not successful', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Solicitud rechazada.' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      postMailService({
        path: '/contact',
        payload: { name: 'Lu', email: 'lu@example.com', message: 'Hello' },
      }),
    ).rejects.toThrow('Solicitud rechazada.')
  })

  it('uses the fallback error when the API does not return a message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error('invalid json')),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      postMailService({
        path: '/contact',
        payload: { name: 'Lu', email: 'lu@example.com', message: 'Hello' },
      }),
    ).rejects.toThrow('No se pudo completar la solicitud.')
  })
})
