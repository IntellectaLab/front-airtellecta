const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
  </svg>
)

export type EstadoRiesgo = 'critico' | 'alto' | 'medio'

export interface EstadoCardProps {
  estado:      string
  consumo:     string
  vsNacional:  string
  poblacion:   string
  riesgo:      EstadoRiesgo
}

const RIESGO_CONFIG: Record<EstadoRiesgo, {
  cardClass:   string
  labelClass:  string
  valueClass:  string
  badgeClass:  string
  badgeLabel:  string
  icon:        React.ReactNode
}> = {
  critico: {
    cardClass:  'metric-card-glass--critical',
    labelClass: 'text-red-500 dark:text-red-400',
    valueClass: 'text-[#dc2626] dark:text-red-400',
    badgeClass: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25',
    badgeLabel: 'CRÍTICO',
    icon:       <AlertIcon />,
  },
  alto: {
    cardClass:  'metric-card-glass--warning',
    labelClass: 'text-amber-600 dark:text-amber-400',
    valueClass: 'text-[#d97706] dark:text-amber-400',
    badgeClass: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
    badgeLabel: 'ALTO',
    icon:       <TrendUpIcon />,
  },
  medio: {
    cardClass:  '',
    labelClass: 'text-[#5580a8] dark:text-white/35',
    valueClass: 'text-[#0c1f3f] dark:text-white',
    badgeClass: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
    badgeLabel: 'MEDIO',
    icon:       <TrendUpIcon />,
  },
}

export function EstadoCard({ estado, consumo, vsNacional, poblacion, riesgo }: EstadoCardProps) {
  const cfg = RIESGO_CONFIG[riesgo]

  return (
    <div
      className={`metric-card-glass ${cfg.cardClass} flex flex-col gap-3 p-5 rounded-[18px]`}
      data-testid={`estado-card-${estado.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Header: estado + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cfg.labelClass}>{cfg.icon}</span>
          <p className={`text-[15px] font-bold tracking-[0.8px] uppercase ${cfg.labelClass}`}>
            {estado}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border shrink-0 ${cfg.badgeClass}`}>
          {cfg.badgeLabel}
        </span>
      </div>

      {/* Valor principal */}
      <p className={`font-display text-[43px] font-extrabold leading-none tracking-[-1.5px] ${cfg.valueClass}`}>
        {consumo}
      </p>

      {/* Métricas secundarias */}
      <div className="flex flex-col gap-1">
        <p className="text-[15px] text-[#5580a8] dark:text-white/40">
          {vsNacional} vs. promedio nacional
        </p>
        <p className="text-[14px] text-[#5580a8] dark:text-white/30">
          {poblacion} afectados est.
        </p>
      </div>
    </div>
  )
}
