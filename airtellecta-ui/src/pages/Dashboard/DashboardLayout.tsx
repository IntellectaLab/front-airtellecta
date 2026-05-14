import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'

// ── Icons ──────────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
)
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
const AppearanceIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)
const AlertTriangleIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const SearchPanelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="6" x2="3" y2="6" /><line x1="17" y1="12" x2="7" y2="12" /><line x1="13" y1="18" x2="11" y2="18" />
  </svg>
)
const LogoutMenuIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const MonitorIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

// ── Header Panel ───────────────────────────────────────────────────────────

type PanelVariant = 'notifications' | 'alerts'

function HeaderPanel({ variant }: { variant: PanelVariant }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isNotif = variant === 'notifications'

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        className="icon-btn-glass relative w-9 h-9 flex items-center justify-center rounded-[9px] cursor-pointer border-none"
        type="button"
        aria-label={isNotif ? 'Notificaciones' : 'Alertas'}
        onClick={() => setOpen((v) => !v)}
        data-open={open}
        data-testid={isNotif ? 'btn-notifications' : 'btn-alerts'}
      >
        {isNotif ? <BellIcon /> : <AlertTriangleIcon />}
        <span className="absolute top-[7px] right-[7px] w-2 h-2 rounded-full bg-[#f97316] border-[1.5px] border-white/90" />
      </button>

      {open && (
        <div className="panel-glass absolute top-[calc(100%+10px)] right-0 w-[340px] z-[200] rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-[18px] pt-5 pb-[14px]">
            <h3 className="font-display text-[20px] font-extrabold text-[#0c1f3f] m-0 tracking-[-0.3px] dark:text-white">
              {isNotif ? 'Notificaciones' : 'Alertas'}
            </h3>
            <button className="panel-icon-btn-glass w-[34px] h-[34px] flex items-center justify-center rounded-[9px] border-none cursor-pointer" type="button" aria-label="Configuración">
              <SettingsIcon />
            </button>
          </div>

          <div className="flex items-center gap-2 px-[14px] pb-4">
            <label className="panel-search-glass flex-1 flex items-center gap-2 px-[14px] py-[9px] rounded-[12px] cursor-text">
              <span className="text-[#8baac8] shrink-0"><SearchPanelIcon /></span>
              <input className="flex-1 border-none outline-none bg-transparent text-sm text-[#0c1f3f] font-sans placeholder:text-[#a0b8d0] dark:text-white/80 dark:placeholder:text-white/25" placeholder="Buscar" />
            </label>
            <button className="panel-icon-btn-glass w-[40px] h-[40px] shrink-0 flex items-center justify-center rounded-[12px] border-none cursor-pointer" type="button" aria-label="Filtrar">
              <FilterIcon />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center px-6 pt-9 pb-11 gap-[18px]">
            {isNotif ? (
              <EmptyState title="Sin notificaciones" description="No tienes notificaciones pendientes por el momento." />
            ) : (
              <>
                <EmptyState title="Sin alertas" description="Tus alertas de consumo aparecerán aquí." />
                <PrimaryButton label="Crear alerta" onClick={() => {}} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Config Modal ───────────────────────────────────────────────────────────

function ConfigModal({ onClose }: { onClose: () => void }) {
  const [displayName, setDisplayName] = useState('Usuario')

  return (
    <div className="modal-overlay-glass fixed inset-0 z-[500] flex items-center justify-center" onClick={onClose}>
      <div className="config-modal-glass w-full max-w-[460px] rounded-[22px] overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-[22px] pt-[22px] pb-4 border-b border-[rgba(180,210,240,0.30)] dark:border-white/[0.07]">
          <h2 className="font-display text-[18px] font-extrabold text-[#0c1f3f] m-0 dark:text-white">
            Configuración de cuenta
          </h2>
          <button className="btn-modal-close-glass w-[30px] h-[30px] flex items-center justify-center rounded-[8px]" type="button" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="px-[22px] py-[18px] flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#7a9ab8] m-0 dark:text-white/30">
              Perfil
            </h3>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-[#1e3a5f] dark:text-white/60">Nombre de usuario</label>
              <input
                className="config-input-glass px-[14px] py-[10px] rounded-[10px] text-sm text-[#0c1f3f] font-sans w-full"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                data-testid="config-display-name"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-[#1e3a5f] dark:text-white/60">Rol</label>
              <input className="config-input-glass px-[14px] py-[10px] rounded-[10px] text-sm font-sans w-full" value="Cargo" readOnly />
              <span className="text-[11px] text-[#8aaac5] dark:text-white/25">
                Asignado por el administrador del sistema
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#7a9ab8] m-0 dark:text-white/30">
              Seguridad
            </h3>
            <div className="flex items-start gap-2.5 px-[14px] py-3 rounded-[10px] bg-[rgba(219,234,254,0.50)] border border-[rgba(147,197,253,0.45)] dark:bg-white/[0.05] dark:border-[rgba(147,197,253,0.20)]">
              <span className="shrink-0 text-[#2563eb] mt-px dark:text-[#60a5fa]"><InfoIcon /></span>
              <p className="text-[13px] text-[#1e3a5f] leading-[1.5] m-0 dark:text-white/50">
                El cambio de contraseña en este sistema requiere autorización de un administrador. Contacta al responsable de tu institución para realizar esta solicitud.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-[22px] py-[14px] pb-5 border-t border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
          <button className="btn-cancel-glass px-[18px] py-[9px] rounded-[10px] text-sm font-semibold font-sans border-none" type="button" onClick={onClose}>
            Cancelar
          </button>
          <PrimaryButton label="Guardar cambios" onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}

// ── User Menu ──────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'auto'
const THEME_LABELS: Record<Theme, string> = { light: 'Claro', dark: 'Oscuro', auto: 'Auto' }
const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Claro',  icon: <SunIcon /> },
  { value: 'dark',  label: 'Oscuro', icon: <MoonIcon /> },
  { value: 'auto',  label: 'Auto',   icon: <MonitorIcon /> },
]

function applyTheme(t: Theme) {
  const isDark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showAppearance, setShowAppearance] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('airtellecta-theme') as Theme) ?? 'auto')
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('airtellecta-theme', theme)
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('auto')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          className="user-info-glass flex items-center gap-2.5 py-[5px] pl-2 pr-3 rounded-[12px] cursor-pointer font-sans border-none"
          type="button"
          onClick={() => setOpen((v) => !v)}
          data-open={open}
          data-testid="user-menu-btn"
        >
          <div className="flex flex-col gap-px text-right">
            <span className="text-[13px] font-bold text-[#0c1f3f] leading-[1.2] dark:text-white">Usuario</span>
            <span className="text-[11px] text-[#5580a8] leading-[1.2] dark:text-white/45">Cargo</span>
          </div>
          <div className="avatar-glass w-8 h-8 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0 font-display">
            US
          </div>
          <ChevronDownIcon />
        </button>

        {open && (
          <div className="dropdown-glass absolute top-[calc(100%+8px)] right-0 min-w-[230px] z-[200] rounded-2xl overflow-hidden">
            <div className="p-[6px]">
              <div className="flex items-center gap-2.5 py-2.5 px-2 rounded-[10px]">
                <span className="flex items-center text-[#1344c4] shrink-0"><CheckIcon /></span>
                <div>
                  <p className="text-sm font-bold text-[#0c1f3f] m-0 leading-[1.3] dark:text-white">Usuario</p>
                  <p className="text-[11px] text-[#7a9ab8] m-0 tracking-[0.5px] leading-[1.3] dark:text-white/30">ID-AIRTELLECTA</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-[rgba(180,210,240,0.35)] mx-[6px] dark:bg-white/[0.07]" />

            <div className="p-[6px]">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] border-none bg-transparent text-sm font-medium text-[#0c1f3f] cursor-pointer font-sans text-left transition-colors hover:bg-[rgba(26,86,219,0.08)] hover:text-[#1344c4] dark:text-white/70 dark:hover:bg-white/[0.07] dark:hover:text-white [&>svg]:text-[#5580a8] [&:hover>svg]:text-[#1344c4]"
                type="button"
                onClick={() => { setOpen(false); setShowConfig(true) }}
              >
                <SettingsIcon />
                Configuración
              </button>

              <button
                className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] border-none bg-transparent text-sm font-medium text-[#0c1f3f] cursor-pointer font-sans text-left transition-colors hover:bg-[rgba(26,86,219,0.08)] hover:text-[#1344c4] dark:text-white/70 dark:hover:bg-white/[0.07] dark:hover:text-white [&>svg]:text-[#5580a8] [&:hover>svg]:text-[#1344c4]"
                type="button"
                onClick={() => setShowAppearance((v) => !v)}
              >
                <AppearanceIcon />
                Apariencia
                <span className="ml-auto text-[11px] font-semibold text-[#7a9ab8] bg-[rgba(180,210,240,0.35)] px-2 py-0.5 rounded-[6px] dark:bg-white/[0.08] dark:text-white/40">
                  {THEME_LABELS[theme]}
                </span>
              </button>

              {showAppearance && (
                <div className="flex flex-col gap-0.5 py-1 pl-7 pr-[6px] animate-dropdown">
                  {THEME_OPTIONS.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      className={`appearance-option-glass flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] border-none bg-transparent text-[13px] cursor-pointer font-sans w-full text-left ${theme === value ? 'appearance-option-glass--active' : ''}`}
                      type="button"
                      onClick={() => setTheme(value)}
                    >
                      {icon}
                      {label}
                      {theme === value && (
                        <span className="ml-auto flex items-center text-[#1344c4] dark:text-[#93c5fd]"><CheckIcon /></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-[rgba(180,210,240,0.35)] mx-[6px] dark:bg-white/[0.07]" />

            <div className="p-[6px]">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] border-none bg-transparent text-sm font-medium text-[#dc2626] cursor-pointer font-sans text-left transition-colors hover:bg-[rgba(220,38,38,0.08)] hover:text-[#b91c1c]"
                type="button"
                onClick={() => navigate('/login')}
                data-testid="btn-logout"
              >
                <LogoutMenuIcon />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfig && createPortal(<ConfigModal onClose={() => setShowConfig(false)} />, document.body)}
    </>
  )
}

// ── Nav items (usado para resolver el título del header) ───────────────────

const NAV_ITEMS = [
  { label: 'Resumen Nacional', path: '/dashboard',                    end: true  },
  { label: 'Mapa de Calor',    path: '/dashboard/mapa',               end: false },
  { label: 'Tendencias',       path: '/dashboard/tendencias',         end: false },
  { label: 'Panel Ejecutivo',  path: '/dashboard/panel-ejecutivo',    end: false },
  { label: 'Costos',           path: '/dashboard/costos',             end: false },
  { label: 'Simulador',        path: '/dashboard/simulador',          end: false },
  { label: 'Correlaciones',   path: '/dashboard/correlaciones',      end: false },
]

// ── Layout ─────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  const location = useLocation()
  const currentNav = NAV_ITEMS.find((item) =>
    item.end
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  )
  const pageLabel = currentNav?.label ?? 'Dashboard'

  return (
    <div className="dashboard-bg flex h-dvh overflow-hidden p-4 gap-[14px]">

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-visible min-w-0">

        <header className="relative z-10 h-[62px] shrink-0 flex items-center justify-between px-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.9px] uppercase text-[#5580a8] leading-none dark:text-white/35">
              Airtellecta
            </p>
            <h1 className="font-display text-[22px] font-extrabold tracking-[-0.3px] text-[#0c1f3f] leading-tight dark:text-white">
              {pageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-px h-5 bg-[rgba(180,210,240,0.50)] dark:bg-white/10 mx-1" />
            <HeaderPanel variant="alerts" />
            <HeaderPanel variant="notifications" />
            <UserMenu />
          </div>
        </header>

        <main className="custom-scrollbar flex-1 overflow-y-auto px-6 py-7" data-testid="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
