import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuditLog } from '../../hooks/useAuditLog'
import type { AuditLogItem } from '../../types/api'

// ── Íconos ────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
)
const DatabaseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)
const ApiIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// ── Colores por prefijo de acción ─────────────────────────────
const ACCION_ESTILOS: Record<string, { pill: string; dot: string }> = {
  CREAR:      { pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  ACTIVAR:    { pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  CONSULTAR:  { pill: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',                dot: 'bg-sky-500 dark:bg-sky-400'         },
  LISTAR:     { pill: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',                dot: 'bg-sky-500 dark:bg-sky-400'         },
  ACTUALIZAR: { pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',        dot: 'bg-amber-500 dark:bg-amber-400'     },
  CAMBIAR:    { pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',        dot: 'bg-amber-500 dark:bg-amber-400'     },
  EXPORTAR:   { pill: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',    dot: 'bg-violet-500 dark:bg-violet-400'   },
  EJECUTAR:   { pill: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',    dot: 'bg-indigo-500 dark:bg-indigo-400'   },
  ELIMINAR:   { pill: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',                dot: 'bg-red-500 dark:bg-red-400'         },
  DESACTIVAR: { pill: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',                dot: 'bg-red-500 dark:bg-red-400'         },
  CARGA:      { pill: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25',            dot: 'bg-teal-500 dark:bg-teal-400'       },
}

function accionEstilo(accion: string) {
  const prefijo = accion.split('_')[0]
  return ACCION_ESTILOS[prefijo] ?? {
    pill: 'bg-[rgba(180,210,240,0.2)] text-[#5580a8] dark:bg-white/10 dark:text-white/45 border-[rgba(180,210,240,0.3)] dark:border-white/10',
    dot:  'bg-[#5580a8] dark:bg-white/30',
  }
}

function accionLabel(accion: string): string {
  return accion.replaceAll('_', ' ').toLowerCase()
}

function avatarLetras(email: string | null): string {
  if (!email) return '?'
  const partes = email.split('@')[0].split('.')
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return email.substring(0, 2).toUpperCase()
}

function formatFechaCorta(iso: string): { fecha: string; hora: string } {
  const d = new Date(iso)
  return {
    fecha: d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora:  d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
  }
}

// ── Parser de detalle → texto legible ─────────────────────────
const DETALLE_FIJO: Record<string, string> = {
  EJECUTAR_SIMULACION:       'Simulación de política fiscal ejecutada',
  CONSULTAR_SIMULACION:      'Consulta de resultados de simulación',
  CONSULTAR_PANEL_EJECUTIVO: 'Panel ejecutivo nacional consultado',
  CONSULTAR_RESUMEN_NACIONAL:'Resumen nacional consultado',
  CONSULTAR_MAPA_ESTATAL:    'Mapa de calor estatal consultado',
  CONSULTAR_PERFIL:          'Inicio de sesión · perfil verificado',
  LISTAR_USUARIOS:           'Directorio de usuarios consultado',
  CONSULTAR_AUDIT_LOG:       'Registro de auditoría consultado',
}

function parsearDetalleActualizar(d: Record<string, unknown>): string {
  if (d.fuente !== 'trigger') return 'Actualización de perfil'
  if (d.activo_anterior === 1 && d.activo_nuevo === 0) return `Cuenta suspendida · ${d.email}`
  if (d.activo_anterior === 0 && d.activo_nuevo === 1) return `Cuenta reactivada · ${d.email}`
  return `Perfil actualizado · ${d.email}`
}

function parsearDetalle(item: AuditLogItem): string {
  if (!item.detalle) return '—'
  try {
    const d = JSON.parse(item.detalle) as Record<string, unknown>
    if (DETALLE_FIJO[item.accion]) return DETALLE_FIJO[item.accion]
    switch (item.accion) {
      case 'CREAR_USUARIO':
        return d.fuente === 'trigger'
          ? `Registro en sistema · ${d.email} · Rol inicial: ${d.rol}`
          : `Usuario creado: ${d.email}`
      case 'ACTUALIZAR_USUARIO':  return parsearDetalleActualizar(d)
      case 'CAMBIAR_ROL_USUARIO': return `Cambio de rol: ${d.rol_anterior} → ${d.rol_nuevo} · ${d.email}`
      case 'DESACTIVAR_USUARIO':  return `Cuenta suspendida · ${d.email ?? ''}`
      case 'ACTIVAR_USUARIO':     return `Cuenta reactivada · ${d.email ?? ''}`
      case 'EXPORTAR_DATOS':
        if (String(d.path ?? '').includes('/pdf'))   return 'Reporte PDF generado y descargado'
        if (String(d.path ?? '').includes('/excel')) return 'Reporte Excel exportado'
        return 'Exportación de datos'
      case 'CARGA_COMPLETADA': return `Carga exitosa · ${d.nombre_archivo} · ${d.registros_insertados} registros insertados`
      case 'CARGA_ERROR':      return `Error en carga · ${d.nombre_archivo}`
      default: {
        if (d.path) return `${d.method ?? ''} ${d.path}`
        return Object.entries(d).filter(([k]) => k !== 'fuente').map(([, v]) => String(v)).join(' · ').slice(0, 80) || '—'
      }
    }
  } catch {
    return item.detalle?.slice(0, 80) ?? '—'
  }
}

function esFuenteTrigger(detalle: string | null): boolean {
  if (!detalle) return false
  try { return JSON.parse(detalle)?.fuente === 'trigger' } catch { return false }
}

// ── Dropdown personalizado ────────────────────────────────────
const ACCIONES_OPCIONES: { value: string; label: string }[] = [
  { value: '', label: 'Todas las acciones' },
  { value: 'EJECUTAR_SIMULACION',       label: 'Ejecutar simulación' },
  { value: 'EXPORTAR_DATOS',            label: 'Exportar datos' },
  { value: 'CONSULTAR_PERFIL',          label: 'Inicio de sesión' },
  { value: 'CREAR_USUARIO',             label: 'Crear usuario' },
  { value: 'ACTUALIZAR_USUARIO',        label: 'Actualizar usuario' },
  { value: 'CAMBIAR_ROL_USUARIO',       label: 'Cambiar rol' },
  { value: 'DESACTIVAR_USUARIO',        label: 'Suspender usuario' },
  { value: 'ACTIVAR_USUARIO',           label: 'Reactivar usuario' },
  { value: 'LISTAR_USUARIOS',           label: 'Listar usuarios' },
  { value: 'CARGA_COMPLETADA',          label: 'Carga completada' },
  { value: 'CARGA_ERROR',               label: 'Error de carga' },
  { value: 'CONSULTAR_PANEL_EJECUTIVO', label: 'Panel ejecutivo' },
  { value: 'CONSULTAR_AUDIT_LOG',       label: 'Audit log' },
]

function CustomSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = ACCIONES_OPCIONES.find(o => o.value === value) ?? ACCIONES_OPCIONES[0]

  return (
    <div ref={ref} className="relative w-[220px]">
      <button
        id={id}
        type="button"
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium
          bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06]
          border border-[rgba(180,210,240,0.35)] dark:border-white/[0.12]
          text-[#0c1f3f] dark:text-white
          hover:bg-[rgba(180,210,240,0.25)] dark:hover:bg-white/[0.10]
          transition-colors focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="truncate">{selected.label}</span>
        <span className={`shrink-0 transition-transform duration-200 text-[#5580a8] dark:text-white/40 ${open ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full z-50 rounded-[12px] overflow-hidden
          border border-[rgba(180,210,240,0.35)] dark:border-white/[0.12]
          bg-white dark:bg-[rgba(10,20,48,0.97)]
          shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {ACCIONES_OPCIONES.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors
                ${opt.value === value
                  ? 'bg-[rgba(180,210,240,0.25)] dark:bg-white/[0.12] text-[#0c1f3f] dark:text-white font-semibold'
                  : 'text-[#5580a8] dark:text-white/70 hover:bg-[rgba(180,210,240,0.15)] dark:hover:bg-white/[0.07] hover:text-[#0c1f3f] dark:hover:text-white'
                }`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[rgba(180,210,240,0.2)] dark:border-white/[0.05] animate-pulse">
          <div className="w-[110px] h-3 rounded bg-[rgba(180,210,240,0.3)] dark:bg-white/[0.08]" />
          <div className="w-9 h-9 rounded-full bg-[rgba(180,210,240,0.3)] dark:bg-white/[0.08] shrink-0" />
          <div className="w-[140px] h-3 rounded bg-[rgba(180,210,240,0.2)] dark:bg-white/[0.06]" />
          <div className="w-[120px] h-5 rounded-full bg-[rgba(180,210,240,0.3)] dark:bg-white/[0.08]" />
          <div className="flex-1 h-3 rounded bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.05]" />
          <div className="w-[80px] h-3 rounded bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.05]" />
        </div>
      ))}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sublabel }: Readonly<{
  label: string; value: string | number; icon: React.ReactNode
  color: string; sublabel?: string
}>) {
  return (
    <div className="metric-card-glass rounded-[16px] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-[0.7px] uppercase text-[#5580a8] dark:text-white/35">{label}</p>
        <span className={`p-2 rounded-[10px] ${color}`}>{icon}</span>
      </div>
      <div>
        <p className="font-display text-[32px] font-extrabold leading-none tracking-[-1px] text-[#0c1f3f] dark:text-white">
          {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
        </p>
        {sublabel && <p className="text-[12px] text-[#5580a8] dark:text-white/30 mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

// ── Fila de tabla ─────────────────────────────────────────────
function AuditTableRow({ item }: Readonly<{ item: AuditLogItem }>) {
  const { fecha, hora } = formatFechaCorta(item.createdAt)
  const estilo  = accionEstilo(item.accion)
  const trigger = esFuenteTrigger(item.detalle)
  const desc    = parsearDetalle(item)

  return (
    <div
      className="grid items-center gap-3 px-5 py-3.5
        border-b border-[rgba(180,210,240,0.2)] dark:border-white/[0.04]
        hover:bg-[rgba(180,210,240,0.08)] dark:hover:bg-white/[0.03] transition-colors"
      style={{ gridTemplateColumns: '130px 180px 160px 1fr 80px 90px' }}
    >
      {/* Fecha/hora */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] font-semibold text-[#1e3a5f] dark:text-white/70">{hora}</span>
        <span className="text-[11px] text-[#5580a8] dark:text-white/25">{fecha}</span>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-[rgba(100,160,220,0.2)] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-[#2563eb] dark:text-[#93c5fd]">
            {avatarLetras(item.usuarioEmail)}
          </span>
        </div>
        <span className="text-[12px] text-[#5580a8] dark:text-white/60 truncate">{item.usuarioEmail ?? 'sistema'}</span>
      </div>

      {/* Acción */}
      <div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${estilo.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${estilo.dot}`} />
          {accionLabel(item.accion)}
        </span>
      </div>

      {/* Descripción */}
      <span className="text-[12.5px] text-[#5580a8] dark:text-white/55 truncate">{desc}</span>

      {/* IP */}
      <span className="text-[11px] text-[#5580a8]/70 dark:text-white/30 font-mono truncate">{item.ipAddress ?? '—'}</span>

      {/* Fuente */}
      <div className="flex justify-end">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border
          ${trigger
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/20'
            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600/20'
          }`}
        >
          {trigger ? <DatabaseIcon /> : <ApiIcon />}
          {trigger ? 'BD' : 'API'}
        </span>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export function AdminAuditLog() {
  const [page,          setPage]          = useState(0)
  const [accionFiltro,  setAccionFiltro]  = useState('')
  const [fechaInicio,   setFechaInicio]   = useState<string | undefined>()
  const [fechaFin,      setFechaFin]      = useState<string | undefined>()
  const [emailInput,    setEmailInput]    = useState('')
  const [emailBusqueda, setEmailBusqueda] = useState<string | undefined>()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handleEmailChange = useCallback((v: string) => {
    setEmailInput(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setEmailBusqueda(v.trim() || undefined)
      setPage(0)
    }, 400)
  }, [])

  const { data, isLoading, isError } = useAuditLog({
    page,
    size: 50,
    accion:         accionFiltro || undefined,
    fechaInicio:    fechaInicio ? `${fechaInicio}T00:00:00` : undefined,
    fechaFin:       fechaFin    ? `${fechaFin}T23:59:59`    : undefined,
    emailBusqueda,
  })

  const items = data?.items ?? []

  const usuariosUnicos  = new Set(items.map(i => i.usuarioEmail).filter(Boolean)).size
  const eventosCriticos = items.filter(i =>
    ['CREAR_USUARIO', 'CAMBIAR_ROL_USUARIO', 'DESACTIVAR_USUARIO', 'ACTIVAR_USUARIO', 'CARGA_ERROR'].includes(i.accion)
  ).length
  const exportaciones = items.filter(i => i.accion === 'EXPORTAR_DATOS').length
  const simulaciones  = items.filter(i => i.accion === 'EJECUTAR_SIMULACION').length

  const hayFiltros = !!(accionFiltro || fechaInicio || fechaFin || emailBusqueda)

  return (
    <div className="flex flex-col gap-5" data-testid="admin-audit-log">

      {/* ── Encabezado ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="p-1.5 rounded-[9px] bg-indigo-500/15 text-indigo-500 dark:text-indigo-400">
            <ShieldIcon />
          </span>
          <p className="text-[12px] font-semibold text-[#5580a8] dark:text-white/30 uppercase tracking-[0.8px]">AIRTELLECTA · ADMIN</p>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#0c1f3f] dark:text-white tracking-[-0.5px]">
          Registro de Auditoría
        </h1>
        <p className="text-[13px] text-[#5580a8] dark:text-white/35 mt-0.5">
          Trazabilidad completa de acciones del sistema
          {data ? ` · ${data.totalItems.toLocaleString('es-MX')} eventos registrados` : ''}
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total eventos"    value={data?.totalItems ?? 0}       sublabel={`${items.length} en esta página`}                   icon={<ActivityIcon />} color="bg-indigo-500/15 text-indigo-500 dark:text-indigo-400" />
        <KpiCard label="Usuarios activos" value={usuariosUnicos}              sublabel="usuarios distintos"                                 icon={<UsersIcon />}    color="bg-sky-500/15 text-sky-500 dark:text-sky-400"         />
        <KpiCard label="Eventos críticos" value={eventosCriticos}             sublabel="creaciones, roles, suspensiones"                    icon={<ShieldIcon />}   color="bg-amber-500/15 text-amber-500 dark:text-amber-400"   />
        <KpiCard label="Exportaciones"    value={exportaciones + simulaciones} sublabel={`${simulaciones} simulaciones · ${exportaciones} reportes`} icon={<DownloadIcon />} color="bg-violet-500/15 text-violet-500 dark:text-violet-400" />
      </div>

      {/* ── Filtros ── */}
      <div className="metric-card-glass rounded-[16px] px-5 py-4 flex flex-wrap gap-4 items-end relative z-[60]">
        {/* Búsqueda por email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#5580a8] dark:text-white/30 uppercase tracking-[0.6px]">Usuario</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5580a8]/50 dark:text-white/25 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              id="filter-email"
              type="text"
              placeholder="Buscar por correo..."
              className="bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06]
                border border-[rgba(180,210,240,0.35)] dark:border-white/[0.12]
                rounded-[10px] pl-8 pr-3 py-2 text-[13px]
                text-[#0c1f3f] dark:text-white
                placeholder:text-[#5580a8]/50 dark:placeholder:text-white/20
                focus:outline-none focus:border-[rgba(100,160,220,0.5)] dark:focus:border-white/25
                transition-colors w-[210px]"
              value={emailInput}
              onChange={e => handleEmailChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#5580a8] dark:text-white/30 uppercase tracking-[0.6px]">Acción</label>
          <CustomSelect value={accionFiltro} onChange={v => { setAccionFiltro(v); setPage(0) }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#5580a8] dark:text-white/30 uppercase tracking-[0.6px]">Desde</label>
          <input
            id="filter-desde"
            type="date"
            className="bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06]
              border border-[rgba(180,210,240,0.35)] dark:border-white/[0.12]
              rounded-[10px] px-3 py-2 text-[13px]
              text-[#0c1f3f] dark:text-white
              focus:outline-none focus:border-[rgba(100,160,220,0.5)] dark:focus:border-white/25
              transition-colors [color-scheme:light] dark:[color-scheme:dark]"
            value={fechaInicio ?? ''}
            onChange={e => { setFechaInicio(e.target.value || undefined); setPage(0) }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#5580a8] dark:text-white/30 uppercase tracking-[0.6px]">Hasta</label>
          <input
            id="filter-hasta"
            type="date"
            className="bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06]
              border border-[rgba(180,210,240,0.35)] dark:border-white/[0.12]
              rounded-[10px] px-3 py-2 text-[13px]
              text-[#0c1f3f] dark:text-white
              focus:outline-none focus:border-[rgba(100,160,220,0.5)] dark:focus:border-white/25
              transition-colors [color-scheme:light] dark:[color-scheme:dark]"
            value={fechaFin ?? ''}
            onChange={e => { setFechaFin(e.target.value || undefined); setPage(0) }}
          />
        </div>

        {hayFiltros && (
          <button
            className="px-4 py-2 rounded-[10px] text-[13px] font-medium
              text-[#5580a8] dark:text-white/50
              bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.05]
              border border-[rgba(180,210,240,0.3)] dark:border-white/[0.10]
              hover:bg-[rgba(180,210,240,0.25)] dark:hover:bg-white/[0.09]
              hover:text-[#0c1f3f] dark:hover:text-white/70
              transition-colors"
            onClick={() => {
              setAccionFiltro(''); setFechaInicio(undefined); setFechaFin(undefined)
              setEmailInput(''); setEmailBusqueda(undefined); setPage(0)
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="metric-card-glass rounded-[18px] overflow-hidden">
        {/* Header */}
        <div className="grid gap-3 px-5 py-3 border-b border-[rgba(180,210,240,0.3)] dark:border-white/[0.08]"
          style={{ gridTemplateColumns: '130px 180px 160px 1fr 80px 90px' }}
        >
          {['Hora', 'Usuario', 'Acción', 'Descripción', 'IP', 'Origen'].map(col => (
            <span key={col} className="text-[11px] font-bold text-[#5580a8]/60 dark:text-white/25 uppercase tracking-[0.6px]">{col}</span>
          ))}
        </div>

        {isLoading && <TableSkeleton />}

        {isError && (
          <div className="p-10 text-center text-red-500 dark:text-red-400 text-[14px]">
            No se pudo cargar el registro de auditoría.
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-[14px] text-[#5580a8] dark:text-white/25">Sin eventos para los filtros seleccionados</p>
          </div>
        )}

        {!isLoading && items.map(item => <AuditTableRow key={item.id} item={item} />)}
      </div>

      {/* ── Paginación ── */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5580a8] dark:text-white/25">
            Página {data.page + 1} de {data.totalPages} · {data.totalItems.toLocaleString('es-MX')} registros totales
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-[10px] text-[13px] font-medium
                bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06]
                border border-[rgba(180,210,240,0.3)] dark:border-white/[0.10]
                text-[#0c1f3f] dark:text-white
                disabled:opacity-30 hover:bg-[rgba(180,210,240,0.25)] dark:hover:bg-white/[0.10]
                transition-colors"
            >
              ← Anterior
            </button>
            <button
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-[10px] text-[13px] font-medium
                bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06]
                border border-[rgba(180,210,240,0.3)] dark:border-white/[0.10]
                text-[#0c1f3f] dark:text-white
                disabled:opacity-30 hover:bg-[rgba(180,210,240,0.25)] dark:hover:bg-white/[0.10]
                transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
