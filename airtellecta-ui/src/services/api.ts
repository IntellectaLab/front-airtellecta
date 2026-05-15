import { auth } from '../firebase'
import type {
  ApiResponse,
  ResumenNacional,
  Tendencias,
  EntidadPrevalencia,
  PanelEjecutivo,
  RecaudacionAnual,
  SimulacionRequest,
  SimulacionResultado,
} from '../types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const user = auth?.currentUser ?? null
  const token = user ? await user.getIdToken() : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401 && auth) {
    await auth.signOut()
    window.location.href = '/login'
  }

  return response
}

async function get<T>(path: string): Promise<T> {
  const res = await authFetch(path)
  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) throw new Error(json.error ?? 'Error del servidor')
  return json.data
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch(path, { method: 'POST', body: JSON.stringify(body) })
  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) throw new Error(json.error ?? 'Error del servidor')
  return json.data
}

export const api = {
  get:  (path: string) => authFetch(path),
  post: (path: string, body: unknown) =>
    authFetch(path, { method: 'POST', body: JSON.stringify(body) }),
}

export const apiService = {
  resumenNacional: () => get<ResumenNacional>('/api/resumen-nacional'),
  tendencias:      () => get<Tendencias>('/api/tendencias'),
  mapaEstatal:     (sexo?: 1 | 2) =>
    get<EntidadPrevalencia[]>(`/api/mapa-estatal${sexo ? `?sexo=${sexo}` : ''}`),
  panelEjecutivo:  () => get<PanelEjecutivo>('/api/panel-ejecutivo'),
  recaudacion:     () => get<RecaudacionAnual[]>('/api/recaudacion'),
  simulacion:      (req: SimulacionRequest) =>
    post<SimulacionResultado>('/api/simulacion', req),
}
