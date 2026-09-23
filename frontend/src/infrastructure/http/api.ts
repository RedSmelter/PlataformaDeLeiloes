const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { ...getAuthHeaders() },
  })
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Erro na requisição', response.status)
  }

  return data as TResponse
}

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Erro na requisição', response.status)
  }

  return data as TResponse
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })

  if (!response.ok) {
    let message = 'Erro na requisição'
    try {
      const data = await response.json()
      message = data.message ?? message
    } catch {
      // resposta sem corpo (ex.: 204) — mantém mensagem genérica
    }
    throw new ApiError(message, response.status)
  }
}