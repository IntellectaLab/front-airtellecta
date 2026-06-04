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
  UsuarioDto,
  CrearUsuarioRequest,
  ActualizarUsuarioRequest,
  AuditLogPage,
  AuditLogParams,
} from '../types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// Tabla CP850: caracteres Unicode para bytes 0x80–0xFF (en orden)
const CP850_CHARS =
  '\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xef\xee\xec\xc4\xc5' +
  '\xc9\xe6\xc6\xf4\xf6\xf2\xfb\xf9\xff\xd6\xdc\xf8\xa3\xd8\xd7ƒ' +
  '\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf\xae\xac\xbd\xbc\xa1\xab\xbb' +
  '░▒▓│┤\xc1\xc2\xc0\xa9╣║╗╝\xa2\xa5┐' +
  '└┴┬├─┼\xe3\xc3╚╔╩╦╠═╬\xa4' +
  '\xf0\xd0\xca\xcb\xc8ı\xcd\xce\xcf┘┌█▄\xa6\xcc▀' +
  '\xd3\xdf\xd4\xd2\xf5\xd5\xb5\xfe\xde\xda\xdb\xd9\xfd\xdd\xaf\xb4' +
  '­\xb1‗\xbe\xb6\xa7\xf7\xb8\xb0\xa8\xb7\xb9\xb3\xb2■\xa0'

// Mapa inverso: carácter Unicode → byte CP850
const cp850Reverse = new Map<string, number>()
for (let i = 0; i < CP850_CHARS.length; i++) {
  cp850Reverse.set(CP850_CHARS[i], 0x80 + i)
}

// Corrige mojibake CP850: bytes UTF-8 del backend interpretados como CP850
// Ej: "M├®xico" → "México",  "Le├│n" → "León"
function fixMojibake(s: string): string {
  if (!s) return s
  try {
    const bytes = new Uint8Array(s.length)
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i)
      if (code < 0x80) {
        bytes[i] = code
      } else {
        const b = cp850Reverse.get(s[i])
        if (b === undefined) return s  // Carácter no CP850 → ya es Unicode correcto
        bytes[i] = b
      }
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return s
  }
}

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

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch(path, { method: 'PUT', body: JSON.stringify(body) })
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
  mapaEstatal: async (sexo?: 1 | 2) => {
    const data = await get<EntidadPrevalencia[]>(`/api/mapa-estatal${sexo ? `?sexo=${sexo}` : ''}`)
    return data.map(e => ({
      ...e,
      nombre:      fixMojibake(e.nombre),
      abreviatura: fixMojibake(e.abreviatura),
    }))
  },
  panelEjecutivo:  () => get<PanelEjecutivo>('/api/panel-ejecutivo'),
  exportSimulacionExcel: async (req: SimulacionRequest) => {
    const res = await authFetch('/api/export/simulacion/excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error('Error al exportar Excel')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simulacion-airtellecta-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  },
  exportPanelEjecutivoExcel: async () => {
    const res = await authFetch('/api/export/panel-ejecutivo/excel')
    if (!res.ok) throw new Error('Error al exportar Excel')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `panel-ejecutivo-airtellecta-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  },
  logSimulacionPdf:      () => post<void>('/api/export/simulacion/pdf', {}),
  logPanelEjecutivoPdf:  () => post<void>('/api/export/panel-ejecutivo/pdf', {}),
  recaudacion:     () => get<RecaudacionAnual[]>('/api/recaudacion'),
  simulacion:      (req: SimulacionRequest) =>
    post<SimulacionResultado>('/api/simulacion', req),

  // Current user profile
  me: () => get<UsuarioDto>('/api/me'),

  // Admin usuarios
  listarUsuarios:     () => get<UsuarioDto[]>('/api/admin/usuarios'),
  crearUsuario:       (req: CrearUsuarioRequest) => post<UsuarioDto>('/api/admin/usuarios', req),
  actualizarUsuario:  (id: number, req: ActualizarUsuarioRequest) => put<UsuarioDto>(`/api/admin/usuarios/${id}`, req),

  // Admin audit log
  auditLog: (params: AuditLogParams = {}) => {
    const qs = new URLSearchParams()
    if (params.page        != null) qs.set('page',        String(params.page))
    if (params.size        != null) qs.set('size',        String(params.size))
    if (params.accion      != null) qs.set('accion',      params.accion)
    if (params.usuarioId   != null) qs.set('usuarioId',   String(params.usuarioId))
    if (params.fechaInicio != null) qs.set('fechaInicio', params.fechaInicio)
    if (params.fechaFin       != null) qs.set('fechaFin',       params.fechaFin)
    if (params.emailBusqueda  != null) qs.set('emailBusqueda',  params.emailBusqueda)
    return get<AuditLogPage>(`/api/admin/audit-log?${qs.toString()}`)
  },
}
