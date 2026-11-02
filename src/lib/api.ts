export function resolveApiBaseUrl(configuredUrl: string | undefined, isDevelopment: boolean): string {
  const fallback = isDevelopment ? 'http://localhost:3001' : ''
  return (configuredUrl?.trim() || fallback).replace(/\/$/, '')
}

const apiBaseUrl = resolveApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV,
)

interface ApiOptions {
  path: string
  payload: Record<string, unknown>
}

export async function postMailService({ path, payload }: ApiOptions): Promise<Record<string, unknown>> {
  if (!apiBaseUrl) {
    throw new Error('El servicio de correo no tiene una URL pública configurada.')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = 'No se pudo completar la solicitud.'

    try {
      const data = await response.json()
      if (typeof data.error === 'string') {
        message = data.error
      }
    } catch {
      // noop
    }

    throw new Error(message)
  }

  try {
    const data = await response.json()
    return data && typeof data === 'object' ? data as Record<string, unknown> : {}
  } catch {
    return {}
  }
}
