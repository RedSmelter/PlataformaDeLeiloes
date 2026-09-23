const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`)
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Erro na requisição', response.status)
  }

  return data as TResponse
}

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Erro na requisição', response.status)
  }

  return data as TResponse
}