import { NavLink, useNavigate } from 'react-router-dom'

const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
    <path d="M20 7L5 14.5L20 22L35 14.5L20 7Z" fill="white" fillOpacity="0.95" />
    <path d="M5 20L20 27.5L35 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 25.5L20 33L35 25.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
  </svg>
)

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const MapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
    <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

const TrendingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="12" />
  </svg>
)

const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const ScatterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4.5" cy="19" r="1.8" /><circle cx="9.5" cy="13" r="1.8" />
    <circle cx="15" cy="8.5" r="1.8" /><circle cx="20" cy="4" r="1.8" />
    <line x1="2" y1="22" x2="22.5" y2="1.5" strokeDasharray="3 2.5" strokeOpacity="0.45" />
  </svg>
)

const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const NAV_ITEMS = [
  { label: 'Resumen Nacional',  path: '/dashboard',               icon: <GridIcon />,      end: true  },
  { label: 'Mapa de Calor',     path: '/dashboard/mapa',          icon: <MapIcon />,       end: false },
  { label: 'Tendencias',        path: '/dashboard/tendencias',    icon: <TrendingIcon />,  end: false },
  { label: 'Panel Ejecutivo',   path: '/dashboard/panel-ejecutivo', icon: <BriefcaseIcon />, end: false },
  { label: 'Costos',            path: '/dashboard/costos',        icon: <DollarIcon />,    end: false },
  { label: 'Simulador',         path: '/dashboard/simulador',     icon: <SlidersIcon />,   end: false },
  { label: 'Correlaciones',    path: '/dashboard/correlaciones', icon: <ScatterIcon />,   end: false },
]

export function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside
      className="sidebar-glass group w-[72px] hover:w-[220px] flex flex-col items-center rounded-[24px] pt-[10px] pb-4 relative z-10 overflow-hidden transition-[width] duration-[250ms] ease-in-out"
      data-testid="sidebar"
    >
      <div className="w-full h-[62px] flex items-center justify-center shrink-0 border-b border-white/[0.07] mb-2">
        <div className="sidebar-logo-glass w-[42px] h-[42px] rounded-[13px] flex items-center justify-center">
          <LogoIcon />
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-stretch gap-1 py-1 pl-2 w-full">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              `relative w-full h-[46px] flex items-center justify-start pl-[22px] gap-[14px] rounded-[13px] no-underline border-none cursor-pointer font-sans transition-colors duration-[180ms] ${
                isActive
                  ? 'nav-item-active'
                  : 'bg-transparent text-white/40 hover:text-white/75 hover:bg-white/[0.08]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center justify-center shrink-0 w-[18px] h-[18px]">
                  {item.icon}
                </span>
                <span className={`opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-[200ms] text-[17.5px] font-semibold ${isActive ? 'text-[#0c1f3f] dark:text-[#93c5fd]' : 'text-white/85'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col items-center px-2.5 w-full border-t border-white/[0.07] pt-3 mt-2">
        <button
          className="w-full h-[46px] flex items-center justify-start pl-[22px] gap-[14px] rounded-[13px] border-none bg-transparent cursor-pointer font-sans text-white/35 hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.10)] transition-colors duration-[180ms]"
          type="button"
          title="Cerrar sesión"
          onClick={() => navigate('/login')}
          data-testid="sidebar-logout"
        >
          <LogoutIcon />
          <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-[200ms] text-[17.5px] font-semibold text-white/85">
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  )
}
